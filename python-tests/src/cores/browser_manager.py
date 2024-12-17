# python-tests/src/cores/browser_manager.py
import logging
import os
from playwright.sync_api import Playwright, BrowserContext
from src.pages.s_login_env_index_page import S_Login_Env_Index_Page
from src.utils.actions_utils import ActionUtils

class BrowserManager:
    unwanted_tabs = ["chrome-extension://", "https://chrispederick.com/"]

    def __init__(self, playwright: Playwright):
        self.playwright = playwright

    def _setup_persistent_context(self, **context_args) -> BrowserContext:
        """Configure and launch a persistent browser context with specified arguments."""
        browser = self.playwright.chromium.launch_persistent_context(**context_args)

        # Only handle unwanted tabs if extensions are enabled
        if context_args.get("args"):
            self._close_unwanted_tabs(browser)

        return browser

    def _close_unwanted_tabs(self, browser):
        """Close all existing unwanted tabs and set up a listener for future tabs."""
        # Close currently open unwanted tabs
        for page in browser.pages:
            self._close_if_unwanted(page)

        # Set up a listener for future unwanted tabs
        browser.on("page", lambda page: page.once("load", lambda: self._close_if_unwanted(page)))

    def _close_if_unwanted(self, page):
        """Close the page if it matches an unwanted URL pattern."""
        if any(unwanted in page.url for unwanted in self.unwanted_tabs):
            print(f"Closing unwanted tab with URL: {page.url}")
            page.close()

    @staticmethod
    def _find_extension_paths(directory: str) -> list:
        """Locate paths for Chrome extensions inside the given directory."""
        extension_paths = []
        for root, dirs, files in os.walk(directory):
            if 'manifest.json' in files:
                extension_paths.append(root)
        return extension_paths

    def create_context(
        self,
        user_data_dir: str = None,
        viewport: dict = None,
        is_mobile: bool = False,
        has_touch: bool = False,
        user_agent: str = None,
        headless: bool = True,
        persistent: bool = True,
        extensions: bool = False,
        open_devtools: bool = False,
        channel: str = "chrome",
    ) -> BrowserContext:
        """Create a browser context dynamically based on input arguments."""
        context_args = {
            "headless": headless,
            "channel": channel,
            "viewport": viewport,
            "is_mobile": is_mobile,
            "has_touch": has_touch,
            "user_agent": user_agent,
        }

        if persistent:
            if not user_data_dir:
                raise ValueError("Persistent context requires a 'user_data_dir'.")

            context_args["user_data_dir"] = user_data_dir
            args = []

            if extensions:
                extensions_root = os.path.abspath(
                    os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'extensions')
                )
                extension_paths = self._find_extension_paths(extensions_root)
                load_extensions_arg = ','.join(extension_paths)
                args += [
                    f"--disable-extensions-except={load_extensions_arg}",
                    f"--load-extension={load_extensions_arg}",
                ]

            if open_devtools:
                args.append("--auto-open-devtools-for-tabs")

            context_args["args"] = args

            return self._setup_persistent_context(**context_args)
        else:
            browser = self.playwright.chromium.launch(headless=headless, channel=channel)
            return browser.new_context(
                viewport=viewport,
                is_mobile=is_mobile,
                has_touch=has_touch,
                user_agent=user_agent,
            )

    @staticmethod
    def analyze_url_and_apply_cookie(context, url):
        """
        Analyze the URL and apply cookies dynamically.
        :param context: Playwright BrowserContext.
        :param url: The URL to analyze and apply cookies for.
        """
        try:
            from src.cores.auth_manager import AuthManager
            from src.cores.cookie_manager import configure_cookies_lib, set_cookies_in_context

            auth_manager = AuthManager(ActionUtils.load_config_from_json())
            url_info = auth_manager.analyze_url(url)
            base_domain = url.split("/")[2]

            cookies = configure_cookies_lib(auth_manager, url_info, base_domain)
            set_cookies_in_context(context, cookies)
            logging.info(f"Cookies applied successfully for URL: {url}")

        except ImportError as e:
            logging.error(f"Failed to import required modules for URL '{url}': {e}")
            raise  # Re-raise the exception to signal failure

        except Exception as e:
            logging.error(f"Error analyzing URL '{url}' or applying cookies: {e}")
            raise  # Re-raise the exception to signal failure

    @staticmethod
    def preprocess_urls(context, urls, login_env: str):
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
                    logging.info(f"Processing 'p6-qa' URL: {url}")
                    BrowserManager.analyze_url_and_apply_cookie(context, url)

                    # Perform the login flow for the first 'p6-qa' URL
                    login_page = S_Login_Env_Index_Page(context.pages[0] if context.pages else context.new_page())
                    logged_in_context = login_page.handle_login_to_env_success_page(login_env)

                elif "p6-qa" not in url:
                    BrowserManager.analyze_url_and_apply_cookie(context, url)

            return logged_in_context

        except Exception as e:
            # Log the error and indicate that preprocessing has failed
            logging.info(f"Error during preprocessing URLs: {e}")
            return None  # Indicate failure