# python-tests/src/pages/manual_check_page.py

from src.pages.base_page import BasePage

class ManualCheckPage(BasePage):
    def get_loaded_url(self):
        """Retrieve the current URL of the page."""
        return self.page.url

    def is_body_visible(self, page=None):
        """
        Check if the body element is visible on the page.
        :param page: Optional specific page object (defaults to self.page).
        :return: True if the body is visible, otherwise False.
        """
        page = page or self.page
        return page.is_visible("body")