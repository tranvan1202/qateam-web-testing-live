# python-tests/src/pages/base_page.py

from abc import ABC
from playwright.sync_api import Page
from src.cores.actions import Actions
from src.cores.image_properties_extractor import ImagePropertiesExtractor
from src.cores.excel_writer import ExcelWriter

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
                #Add Tuple Pages(Page, Expected URL)
                pages.append((page, url))
            except Exception as e:
                print(f"Failed to open URL: {url}, Error: {e}")
        return pages