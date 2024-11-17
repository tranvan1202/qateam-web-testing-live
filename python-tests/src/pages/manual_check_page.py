# python-tests/src/pages/manual_check_page.py

from src.pages.base_page import BasePage

class ManualCheckPage(BasePage):
    """
    Page Object for manual checks. Provides reusable methods to interact with the page.
    """
    def navigate(self, url):
        """
        Navigate to the given URL using the existing default tab if available.
        :param url: The URL to navigate to.
        """
        self.page.goto(url, timeout=60000)

    def is_url_loaded(self, expected_url):
        """
        Verify if the current URL matches the expected URL.
        :param expected_url: The expected URL to validate.
        :return: True if the URLs match, False otherwise.
        """
        return self.page.url == expected_url

    def is_body_visible(self):
        """
        Check if the body element is visible.
        :return: True if the body element is visible, False otherwise.
        """
        return self.page.locator("body").is_visible()

    def get_cookies(self):
        """
        Retrieve cookies for the current page.
        :return: List of cookies.
        """
        return self.page.context.cookies()
