from abc import ABC
from playwright.sync_api import Page
from src.cores.actions import Actions


class BasePage(ABC):
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)

    def _resolve_page(self, page=None):
        """Resolve the target page for actions, defaulting to self.page."""
        return page or self.page

    def perform_common_actions(self, page=None):
        """
        Perform common actions such as scrolling and button injection.
        :param page: The page object to perform actions on (defaults to self.page).
        """
        page = self._resolve_page(page)
        self.actions.page = page

        self.actions.scroll_to_bottom()
        self.trigger_load_actions(page)
        self.actions.scroll_to_top()
        self.actions.inject_button_script(self.actions.get_wait_time(self.device))
        self.actions.wait_for_button_trigger_or_timeout(self.device)

    def trigger_load_actions(self, page=None):
        """
        Define page-specific actions, optionally for a given page.
        Default implementation is to click declared elements.
        """
        page = self._resolve_page(page)
        self.actions.page = page
        self.actions.click_js_declared_elements("ssLazyLoadTriggerElementClassNames")

    def is_url_loaded(self, expected_url, page=None):
        """
        Check if the current page URL matches the expected URL.
        :param expected_url: The expected URL to validate.
        :param page: Optional specific page object (defaults to self.page).
        :return: True if the URL matches, otherwise False.
        """
        page = self._resolve_page(page)
        return page.url == expected_url

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

    def open_tabs(self, urls, max_tabs=1):
        """
        Open multiple tabs or a single tab based on max_tabs.
        :param urls: List of URLs to open.
        :param max_tabs: Maximum number of tabs to open simultaneously.
        :return: List of (page, url) tuples for opened tabs.
        """
        if not urls:
            print("No URLs provided to open_tabs.")
            return []

        pages = []
        for idx, url in enumerate(urls[:max_tabs]):
            try:
                page = self.page.context.new_page() if idx > 0 else self.page
                self.navigate(url, page)
                pages.append((page, url))
            except Exception as e:
                print(f"Failed to open URL: {url}, Error: {e}")
        return pages

    def post_action_hook(self, page, tab_index, url):
        """
        Hook for page-specific actions after performing common actions.
        :param page: The Playwright page object.
        :param tab_index: Index of the tab being processed.
        :param url: URL of the tab being processed.
        """
        pass  # Default implementation does nothing

    def navigate_and_perform_actions(self, urls, max_tabs=1, collect_results=False):
        """
        Open multiple tabs or process URLs sequentially.
        :param urls: List of URLs to test.
        :param max_tabs: Maximum number of tabs to open simultaneously.
        :param collect_results: Whether to collect and return navigated URLs.
        :return: List of (tab_index, expected_url, actual_url) tuples if collect_results is True.
        """
        tab_results = []

        try:
            # Open tabs based on max_tabs
            pages = self.open_tabs(urls, max_tabs)

            # Perform actions on opened tabs
            for idx, (page, expected_url) in enumerate(pages):
                try:
                    page.bring_to_front()
                    print(f"Performing common actions on tab {idx + 1}")
                    self.perform_common_actions(page)

                    # Collect tab results if requested
                    if collect_results:
                        actual_url = page.url
                        tab_results.append((idx + 1, expected_url, actual_url))
                        print(f"Tab {idx + 1}: Completed actions for {actual_url}")

                    # Call post-action hook
                    self.post_action_hook(page, idx + 1, expected_url)

                except Exception as e:
                    print(f"Error during actions on tab {idx + 1}: {e}")
                    if collect_results:
                        tab_results.append((idx + 1, expected_url, "Error"))

        except Exception as main_error:
            print(f"Error during navigation and actions: {main_error}")

        # Return tab results for further assertions
        return tab_results if collect_results else None