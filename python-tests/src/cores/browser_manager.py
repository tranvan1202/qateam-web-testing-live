from playwright.sync_api import Playwright, BrowserContext
import os

class BrowserManager:
    def __init__(self, playwright: Playwright):
        self.playwright = playwright

    def _find_extension_paths(self, directory: str) -> list:
        """Locate paths for Chrome extensions inside the given directory."""
        extension_paths = []
        for root, dirs, files in os.walk(directory):
            if 'manifest.json' in files:
                extension_paths.append(root)
        return extension_paths

    def _setup_persistent_context(self, **context_args) -> BrowserContext:
        """Configure and launch a persistent browser context with specified arguments."""
        browser = self.playwright.chromium.launch_persistent_context(**context_args)

        # Only handle unwanted tabs if extensions are enabled
        if context_args.get("args"):
            unwanted_tabs = ["chrome-extension://", "https://chrispederick.com/"]
            self._close_unwanted_tabs(browser, unwanted_tabs)

        return browser

    def _close_unwanted_tabs(self, browser, unwanted_tabs: list):
        """Close tabs matching unwanted URLs."""
        for page in browser.pages:
            if any(unwanted in page.url for unwanted in unwanted_tabs):
                print(f"Closing unwanted tab with URL: {page.url}")
                page.close()

        # Set up a listener for future unwanted tabs
        browser.on("page", lambda page: page.once("load", lambda: self._close_if_unwanted(page, unwanted_tabs)))

    def _close_if_unwanted(self, page, unwanted_tabs: list):
        """Close the page if it matches an unwanted URL pattern."""
        if any(unwanted in page.url for unwanted in unwanted_tabs):
            print(f"Closing unwanted tab with URL: {page.url}")
            page.close()

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
