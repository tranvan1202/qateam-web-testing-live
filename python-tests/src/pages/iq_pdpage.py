# python-tests/src/pages/iq_pdpage.py
import os

from src.pages.base_page import BasePage
from src.cores.actions import Actions
from src.cores.image_properties_extractor import ImagePropertiesExtractor
from src.cores.excel_writer import ExcelWriter


class IQPDPage(BasePage):
    def __init__(self, page, device: str):
        super().__init__(page, device)
        self.actions = Actions(page, device)
        self.image_extractor = ImagePropertiesExtractor(page)
        self.excel_writer = ExcelWriter()

    def trigger_load_actions(self, page=None):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        :param page: Optional specific page object (defaults to self.page).
        """
        page = page or self.page
        self.actions.page = page
        self.actions.click_js_declared_elements("iqLazyLoadTriggerElementClassNames")

    def post_action_hook(self, page, tab_index, url):
        """
        IQPD-specific hook to extract and save image properties for each tab.
        :param page: The Playwright page object.
        :param tab_index: Index of the tab being processed.
        :param url: URL of the tab being processed.
        :return: The absolute path of the exported Excel file, or None if no data was extracted.
        """
        print(f"Extracting image properties for tab {tab_index} (URL: {url})")
        self.image_extractor.page = page
        img_data = self.image_extractor.extract_image_data()

        if not img_data or len(img_data) <= 1:
            print(f"No valid image data found for tab {tab_index} (URL: {url}).")
            return None

        # Save extracted data to a unique Excel file for each tab
        filename = self.excel_writer.write_data_to_excel(
            img_data,
            executed_file_name=f"iqpd_image_data_tab_{tab_index}",
            device_type=self.device
        )

        # Resolve the absolute path of the filename
        absolute_filename = os.path.abspath(filename)
        print(f"Image data exported to {absolute_filename} for tab {tab_index} (URL: {url}).")
        return absolute_filename

    def navigate_and_collect_images(self, urls, max_tabs=1, validate_urls=False):
        """
        Navigate to multiple tabs, perform actions, and extract image data.
        :param urls: List of URLs to navigate.
        :param max_tabs: Maximum number of tabs to open simultaneously.
        :param validate_urls: Whether to validate navigated URLs.
        :return: List of (expected_url, actual_url, filename) tuples.
        """
        print(f"Starting navigation and image collection for {len(urls)} URLs (max_tabs={max_tabs}).")
        collected_results = []  # To store (expected_url, actual_url, filename) tuples

        # Use base method to navigate and perform actions
        tab_results = super().navigate_and_perform_actions(
            urls=urls,
            max_tabs=max_tabs,
            collect_results=True  # Ensure tab results are collected
        )

        # Process each tab result
        for tab_index, expected_url, actual_url in tab_results:
            print(f"Processing tab {tab_index}: Expected URL: {expected_url}, Actual URL: {actual_url}")

            # Validate the navigated URL if required
            if validate_urls and expected_url != actual_url:
                print(f"URL validation failed for tab {tab_index}: Expected {expected_url}, got {actual_url}")
                collected_results.append((expected_url, actual_url, None))
                continue

            # Extract and save image properties for this tab
            try:
                filename = self.post_action_hook(self.page, tab_index, actual_url)
                collected_results.append((expected_url, actual_url, filename))
            except Exception as e:
                print(f"Error extracting images for tab {tab_index} (URL: {actual_url}): {e}")
                collected_results.append((expected_url, actual_url, None))

        return collected_results