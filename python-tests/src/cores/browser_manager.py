# python-tests/src/cores/browser_manager.py
from playwright.sync_api import Playwright, BrowserContext
import os


class BrowserManager:
    def __init__(self, playwright: Playwright):
        self.playwright = playwright

    def _find_extension_paths(self, directory):
        # Locate the paths for Chrome extensions inside the given directory
        extension_paths = []
        for root, dirs, files in os.walk(directory):
            if 'manifest.json' in files:
                extension_paths.append(root)
        return extension_paths

    def _setup_context(self, **context_args) -> BrowserContext:
        """Helper method to configure and launch a persistent browser context with specified arguments."""
        # Launch persistent context without any arguments; all args will be added individually
        browser = self.playwright.chromium.launch_persistent_context(**context_args)

        # List of unwanted URLs or patterns to close (e.g., extension popups)
        unwanted_tabs = [
            "chrome-extension://",
            "https://chrispederick.com/"
        ]

        # Close unwanted tabs that are already open
        for page in browser.pages:
            if self._is_unwanted_tab(page.url, unwanted_tabs):
                print(f"Closing unwanted tab with URL: {page.url}")
                page.close()

        # Set up a listener to handle any unwanted new tabs
        browser.on("page", lambda page: self._handle_new_page(page, unwanted_tabs))

        return browser

    def create_existing_profile_extensions_context(self, user_data_dir: str, viewport: dict, is_mobile: bool,
                                                   has_touch: bool, user_agent: str) -> BrowserContext:
        """Creates a standard browser context with user profile and extensions loaded."""
        extensions_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'extensions'))
        extension_paths = self._find_extension_paths(extensions_root)

        # Prepare Chrome arguments with extensions
        load_extensions_arg = ','.join(extension_paths)
        context_args = {
            "user_data_dir": user_data_dir,
            "channel": "chrome",
            "headless": False,
            "viewport": viewport,
            "is_mobile": is_mobile,
            "has_touch": has_touch,
            "user_agent": user_agent,
            "args": [
                "--auto-open-devtools-for-tabs",
                f"--disable-extensions-except={load_extensions_arg}",
                f"--load-extension={load_extensions_arg}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-default-apps"
            ]
        }

        return self._setup_context(**context_args)

    def create_existing_profile_extensions_context_har(self, har_file_path: str, user_data_dir: str, viewport: dict,
                                                       is_mobile: bool, has_touch: bool,
                                                       user_agent: str) -> BrowserContext:
        """Creates a browser context with HAR recording enabled, user profile, and extensions loaded."""
        extensions_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'extensions'))
        extension_paths = self._find_extension_paths(extensions_root)

        # Prepare Chrome arguments with extensions and HAR recording options
        load_extensions_arg = ','.join(extension_paths)
        context_args = {
            "user_data_dir": user_data_dir,
            "channel": "chrome",
            "headless": False,
            "viewport": viewport,
            "is_mobile": is_mobile,
            "has_touch": has_touch,
            "user_agent": user_agent,
            "args": [
                "--auto-open-devtools-for-tabs",
                f"--disable-extensions-except={load_extensions_arg}",
                f"--load-extension={load_extensions_arg}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-default-apps"
            ],
            "record_har_path": har_file_path
            # "record_har_mode": "minimal",
            # "record_har_content": "omit",
            # "record_har_url_filter": r".*\.(png|jpg|jpeg|gif|bmp|webp|svg|mp4|webm)$"
        }

        return self._setup_context(**context_args)

    def close_context(self, context: BrowserContext):
        """ Close the browser context to free resources """
        try:
            context.close()
            print("Browser context successfully closed.")
        except Exception as e:
            print(f"Error while closing browser context: {e}")

    def _is_unwanted_tab(self, url: str, unwanted_tabs: list) -> bool:
        """ Helper function to determine if a page URL matches any unwanted pattern """
        for unwanted in unwanted_tabs:
            if unwanted in url:
                return True
        return False

    def _handle_new_page(self, page, unwanted_tabs):
        """ Handles newly opened tabs by checking if they are unwanted """
        page.once("load", lambda: self._close_if_unwanted(page, unwanted_tabs))

    def _close_if_unwanted(self, page, unwanted_tabs):
        """ Close the page if it matches any unwanted pattern """
        if self._is_unwanted_tab(page.url, unwanted_tabs):
            print(f"Closing unwanted tab with URL: {page.url}")
            page.close()
