# python-tests/src/pages/iq_pdpage.py
import os
import time
from src.pages.base_page import BasePage

class IQPDPage(BasePage):
    def trigger_load_actions(self, page=None):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        :param page: Optional specific page object (defaults to self.page).
        """
        page = page or self.page
        self.actions.page = page
        self.actions.wait_and_click_element_by_key("iqLazyLoadTriggerElement","pdp_MainImg")
        self.actions.wait_and_click_element_by_key("iqLazyLoadTriggerElement", "pdp_ZoomModalThumbnails",
                                                   repeat_until_disabled=True, interact_all = True)
        self.actions.wait_and_click_element_by_key("iqLazyLoadTriggerElement", "pdp_ZoomModalPrevArrow",
                                                   repeat_until_disabled=True)
        time.sleep(2)
        self.actions.wait_and_click_element_by_key("iqLazyLoadTriggerElement", "pdp_ZoomModalCloseButton")

    def post_action_hook(self, page, tab_index, url):
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

    def navigate_and_collect_images(self, urls, max_tabs=1):
        """
        Navigate to multiple tabs, perform actions, and extract image data.
        :param urls: List of URLs to navigate.
        :param max_tabs: Maximum number of tabs to open simultaneously.
        :return: List of file name by tab.
        """
        tab_img_filename_result = []

        try:
            # Open tabs based on max_tabs
            pages = self.open_tabs(urls, max_tabs)
            # Perform actions on opened tabs
            for idx, (page, expected_url) in enumerate(pages):
                try:
                    page.bring_to_front()
                    print(f"Starting navigation and image collection for {len(expected_url)} URLs (max_tabs={max_tabs}).")
                    print(f"Performing common actions on tab {idx + 1}")
                    self.perform_common_actions(page)

                    # Extract and save image properties for the current tab
                    try:
                        filename = self.post_action_hook(page, idx, expected_url)
                        tab_img_filename_result.append((expected_url, filename))
                    except Exception as e:
                        print(f"Error extracting images for tab {idx} (URL: {expected_url}): {e}")
                        tab_img_filename_result.append((expected_url, None))

                except Exception as e:
                    print(f"Error during actions on tab {idx + 1}: {e}")
                    tab_img_filename_result.append((idx + 1, "Error"))

        except Exception as main_error:
            print(f"Error during navigation and actions: {main_error}")

        return tab_img_filename_result