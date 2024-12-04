# python-tests/src/pages/base_page.py

from abc import ABC
from playwright.sync_api import Page
from src.cores.actions import Actions
from src.cores.image_properties_extractor import ImagePropertiesExtractor
from src.cores.excel_writer import ExcelWriter
from src.pages.s_login_env_index_page import S_Login_Env_Index_Page


class BasePage(ABC):
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)
        self.image_extractor = ImagePropertiesExtractor(page)
        self.excel_writer = ExcelWriter()

    def _resolve_page(self, page=None):
        """Resolve the target page for actions, defaulting to self.page."""
        return page or self.page

    def open_tabs_and_perform_actions(self, context, urls, max_tabs=1, collect_url_by_tab=False, s_login_env: str = "qa"):
        """
        Open tabs and perform actions for the given URLs.
        If max_tabs=1, reuse the first tab for all URLs.
        """
        validate_url_results_by_tab = []

        try:
            # Step 1: Preprocess URLs
            self.preprocess_urls(context, urls, s_login_env)

            # Case 1: max_tabs=1 - Reuse the first tab for all URLs
            if max_tabs == 1:
                page = self.page  # Use the first opened tab
                for idx, url in enumerate(urls):
                    try:
                        print(f"Processing URL {idx + 1}/{len(urls)}: {url}")

                        # Navigate to URL in the same tab
                        self.navigate(url, page)

                        # Perform actions on the page
                        page.bring_to_front()
                        self.trigger_lazy_load_action_list(page)
                        self.post_lazy_load_trigger_actions_hook(page)

                        # Collect tab results if requested
                        if collect_url_by_tab:
                            actual_url = page.url
                            validate_url_results_by_tab.append((idx + 1, url, actual_url))
                            print(f"Completed actions for URL {actual_url}")

                    except Exception as e:
                        print(f"Error processing URL {url}: {e}")
                        if collect_url_by_tab:
                            validate_url_results_by_tab.append((idx + 1, url, "Error"))

            # Case 2: max_tabs > 1 - Open and process multiple tabs simultaneously
            else:
                # Step 2: Open tabs based on max_tabs
                pages = self.open_tabs(urls, max_tabs)

                # Step 3: Perform actions on opened tabs
                for idx, (page, expected_url) in enumerate(pages):
                    try:
                        page.bring_to_front()
                        print(f"Performing actions on tab {idx + 1}")

                        # Trigger lazy load
                        self.trigger_lazy_load_action_list(page)

                        # Perform post-actions
                        self.post_lazy_load_trigger_actions_hook(page)

                        # Collect tab results if requested
                        if collect_url_by_tab:
                            actual_url = page.url
                            validate_url_results_by_tab.append((idx + 1, expected_url, actual_url))
                            print(f"Tab {idx + 1}: Completed actions for {actual_url}")

                    except Exception as e:
                        print(f"Error during actions on tab {idx + 1}: {e}")
                        if collect_url_by_tab:
                            validate_url_results_by_tab.append((idx + 1, expected_url, "Error"))

        except Exception as main_error:
            print(f"Error during navigation and actions: {main_error}")

        # Return tab results for further assertions
        return validate_url_results_by_tab if collect_url_by_tab else None

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
        page = self._resolve_page(page)
        print(f"Navigating to URL: {url}")
        try:
            page.goto(url, timeout=60000)
        except Exception as e:
            print(f"Failed to navigate to {url}: {e}")

    def trigger_lazy_load_action_list(self, page=None):
        """
        Perform common actions such as scrolling and button injection.
        :param page: The page object to perform actions on (defaults to self.page).
        """
        page = self._resolve_page(page)
        self.actions.page = page
        self.actions.scroll_to_bottom()
        self.trigger_lazy_load_actions(page)
        self.actions.scroll_to_top()
        self.actions.inject_button_script(self.actions.get_wait_time(self.device))
        self.actions.wait_for_button_trigger_or_timeout(self.device)

    def post_lazy_load_trigger_actions_hook(self, page=None):
        """
        Perform page-specific actions after lazy loading.
        This method should be overridden by child classes to add specific actions.
        """
        print(f"Performing post-actions for page: {page.url}")

    def trigger_lazy_load_actions(self, page=None):
        page = self._resolve_page(page)
        self.actions.page = page
        self.actions.click_js_declared_elements("test_ssLazyLoadTriggerElementClassNames")