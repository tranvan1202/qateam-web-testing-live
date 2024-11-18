# python-tests/src/pages/base_page.py
from abc import ABC, abstractmethod
from playwright.sync_api import Page
from src.cores.actions import Actions

class BasePage(ABC):
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)

    def perform_common_actions(self, page=None):
        """
        Perform common actions such as scrolling and button injection.
        :param page: The page object to perform actions on (defaults to self.page).
        """
        page = page or self.page  # Use provided page or fall back to self.page
        self.actions.page = page  # Update actions to operate on the provided page

        # Scroll to bottom, perform trigger load actions, scroll to top, and inject button
        self.actions.scroll_to_bottom()
        self.trigger_load_actions(page)  # Pass page explicitly to page-specific actions
        self.actions.scroll_to_top()
        self.actions.inject_button_script(self.actions.get_wait_time(self.device))
        self.actions.wait_for_button_trigger_or_timeout(self.device)

    def trigger_load_actions(self, page=None):
        """Define page-specific actions, optionally for a given page."""
        page = page or self.page  # Use provided page or fall back to self.page
        # Example page-specific action: clicking declared elements
        self.actions.page = page
        self.actions.click_js_declared_elements("ssLazyLoadTriggerElementClassNames")

    def navigate(self, url):
        """
        Navigate to the specified URL.
        :param url: The target URL.
        """
        print(f"Navigating to URL: {url}")
        try:
            self.page.goto(url, timeout=60000)  # Navigate using Playwright's goto method
        except Exception as e:
            raise RuntimeError(f"Failed to navigate to {url}: {str(e)}")

    def navigate_and_perform_actions(self, urls, max_tabs=1):
        """
        Open multiple tabs or process URLs sequentially based on max_tabs.
        :param urls: List of URLs to test.
        :param max_tabs: Maximum number of tabs to open simultaneously.
                         If max_tabs > 1, multiple tabs are opened.
        """
        failed_urls = []

        if max_tabs > 1:
            # Open multiple tabs for URLs (up to max_tabs)
            pages = []
            for idx, url in enumerate(urls[:max_tabs]):
                try:
                    print(f"Opening URL in a new tab: {url}")
                    page = self.page.context.new_page() if idx > 0 else self.page
                    page.goto(url, timeout=60000)
                    pages.append(page)
                except Exception as e:
                    print(f"Failed to open URL: {url}, Error: {e}")
                    failed_urls.append(f"URL: {url}, Error: {e}")

            # Perform actions on all tabs
            for idx, page in enumerate(pages):
                try:
                    page.bring_to_front()
                    print(f"Performing common actions on tab {idx + 1}")
                    self.perform_common_actions(page=page)  # Pass the specific tab page

                    # Validate the URL in each tab
                    current_url = page.url
                    expected_url = urls[idx]
                    assert self.is_url_loaded(expected_url, page=page), (
                        f"Expected URL: {expected_url}, but got {current_url}"
                    )
                    print(f"Successfully validated URL: {expected_url}")
                except AssertionError as e:
                    print(f"Validation failed for tab {idx + 1}")
                    failed_urls.append(f"Tab {idx + 1}: {e}")
        else:
            # Open URLs sequentially
            for url in urls:
                try:
                    print(f"Navigating to URL: {url}")
                    self.navigate(url)
                    self.perform_common_actions()
                    assert self.is_url_loaded(url), f"Expected URL: {url}, but got {self.page.url}"
                    print(f"Successfully validated URL: {url}")
                except AssertionError as e:
                    print(f"Validation failed for URL: {url}")
                    failed_urls.append(f"URL: {url}, Error: {e}")

        return failed_urls

