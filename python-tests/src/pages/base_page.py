# python-tests/src/pages/base_page.py
import logging
from abc import ABC
from playwright.sync_api import Page
from src.cores.actions import Actions
from src.cores.image_properties_extractor import ImagePropertiesExtractor
from src.cores.excel_writer import ExcelWriter
from src.pages.s_login_env_index_page import S_Login_Env_Index_Page
from tqdm import tqdm

# Setup logging
logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

class BasePage(ABC):
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)
        self.image_extractor = ImagePropertiesExtractor(page)
        self.excel_writer = ExcelWriter()

    def open_tabs_and_perform_actions(self, context, urls, max_tabs=1, s_login_env="qa", action_flags=None):
        """
        Open tabs and perform actions for the given URLs.
        If max_tabs=1, reuse the first tab for all URLs.
        """
        action_flags = action_flags or {}

        try:
            # Step 1: Preprocess URLs
            self.preprocess_urls(context, urls, s_login_env)

            # Case 1: max_tabs=1 - Reuse the first tab for all URLs
            if max_tabs == 1:
                page = self.page  # Use the first opened tab
                for idx, url in enumerate(urls):
                    try:
                        tab_number = idx + 1
                        print(f"Processing URL {tab_number}/{len(urls)}: {url}")

                        # Navigate to URL in the same tab
                        self.navigate(url, page)

                        # Perform actions on the page
                        page.bring_to_front()
                        self.trigger_action_list(page)

                        # Perform post-actions (including URL collection if enabled)
                        self.post_trigger_actions_hook(page, action_flags, tab_number, url)

                    except Exception as e:
                        print(f"Error processing URL {url}: {e}")

            # Case 2: max_tabs > 1 - Open and process multiple tabs simultaneously
            else:
                # Step 2: Open tabs based on max_tabs
                pages = self.open_tabs(urls, max_tabs)

                # Step 3: Perform actions on opened tabs
                for idx, (page, url) in enumerate(pages):
                    try:
                        tab_number = idx + 1
                        page.bring_to_front()
                        print(f"Performing actions on tab {tab_number}")

                        # Trigger lazy load
                        self.trigger_action_list(page)

                        # Perform post-actions (including URL collection if enabled)
                        self.post_trigger_actions_hook(page, action_flags, tab_number, url)

                    except Exception as e:
                        print(f"Error during actions on tab {tab_number}: {e}")

        except Exception as main_error:
            print(f"Error during navigation and actions: {main_error}")

    def preprocess_urls(self, context, urls, login_env: str):
        """
        Preprocess a list of URLs:
        - Handle 'p6-qa' login flow and cookie application.
        - If any error occurs during URL preprocessing, stop the entire process.
        :param context: Browser context.
        :param urls: List of URLs to preprocess.
        :param login_env: Login environment string.
        :return: logged_in_context if successful, None if there was an error.
        """
        logged_in_context = None  # Track logged-in context across multiple URLs

        try:
            for url in urls:
                if "p6-qa" in url and logged_in_context is None:
                    print(f"Processing 'p6-qa' URL: {url}")
                    self.actions.analyze_url_and_apply_cookie(context, url)

                    # Perform the login flow for the first 'p6-qa' URL
                    login_page = S_Login_Env_Index_Page(context.pages[0] if context.pages else context.new_page())
                    logged_in_context = login_page.handle_login_to_env_success_page(login_env)

                elif "p6-qa" not in url:
                    print(f"Processing non-'p6-qa' URL: {url}")
                    self.actions.analyze_url_and_apply_cookie(context, url)

            return logged_in_context

        except Exception as e:
            # Log the error and indicate that preprocessing has failed
            print(f"Error during preprocessing URLs: {e}")
            return None  # Indicate failure

    def open_tabs(self, urls, max_tabs=1):
        """
        Open tabs for the given URLs.
        If max_tabs=1, process URLs sequentially.
        """
        if not urls:
            print("No URLs provided to open_tabs.")
            return []

        pages = []
        for idx, url in enumerate(urls[:max_tabs]):
            try:
                page = self.page.context.new_page() if idx > 0 else self.page
                self.navigate(url, page)
                # Add Tuple Pages(Page, Expected URL)
                pages.append((page, url))
            except Exception as e:
                print(f"Failed to open URL: {url}, Error: {e}")
        return pages

    def navigate(self, url, page=None):
        """
        Navigate to the specified URL.
        :param url: The target URL.
        :param page: Optional page object for navigation (defaults to self.page).
        """
        page = page or self.page
        print(f"Navigating to URL: {url}")
        try:
            page.goto(url, timeout=60000)
        except Exception as e:
            print(f"Failed to navigate to {url}: {e}")

    def trigger_action_list(self, page=None):
        """
        Perform common actions such as scrolling and button injection.
        :param page: The page object to perform actions on (defaults to self.page).
        """
        page = page or self.page

        page.wait_for_load_state("domcontentloaded", timeout=10000)
        self.actions.scroll_to_bottom(page=page)
        self.trigger_customize_actions_hook(page=page)
        self.actions.scroll_to_top(page=page)
        self.actions.inject_button_script(self.actions.get_wait_time(self.device),page=page)
        self.actions.wait_for_button_trigger_or_timeout(self.device,page=page)

    def trigger_customize_actions_hook(self, page=None):
        pass

    def post_trigger_actions_hook(self, page=None, action_flags=None, tab_number=None, url=None):
        """
        Perform page-specific actions after lazy loading.
        This method should be overridden by child classes to add specific actions.
        """
        pass

    def validate_links(self, page):
        links = page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")
        for link in links:
            response = self.actions.check_url_status(link)
            if response == 404:
                tqdm.write(f"[FAIL] Broken Link: {link} due to response status = {response}")
            else:
                tqdm.write(f"[PASS] Link: {link}")

    def validate_images(self, page):
        images = page.evaluate("() => Array.from(document.querySelectorAll('img')).map(img => img.src)")
        for image in images:
            response = self.actions.check_url_status(image)
            if response == 404:
                tqdm.write(f"[FAIL] Broken Image: {image} due to response status = {response}")
            else:
                tqdm.write(f"[PASS] Image: {image}")

    def validate_videos(self, page):
        videos = page.evaluate("() => Array.from(document.querySelectorAll('video')).map(video => video.src)")
        for video in videos:
            response = self.actions.check_url_status(video)
            if response == 404:
                tqdm.write(f"[FAIL] Broken Video: {video} due to response status = {response}")
            else:
                tqdm.write(f"[PASS] Video: {video}")

    def validate_js_files(self, page):
        scripts = page.evaluate("() => Array.from(document.querySelectorAll('script')).map(script => script.src)")
        for script in scripts:
            if script:  # Ensure the script has a `src`
                response = self.actions.check_url_status(script)
                if response == 404:
                    tqdm.write(f"[FAIL] Broken JS File: {script} due to response status = {response}")
                else:
                    tqdm.write(f"[PASS] JS File: {script}")