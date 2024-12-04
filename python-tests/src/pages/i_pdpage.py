# python-tests/src/pages/i_pdpage.py
import os
import time
from src.pages.base_page import BasePage

class IQPDPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.pdp_main_img = "div[class='swiper-wrapper align-items-center'] div[class='swiper-slide text-center swiper-slide-active']"
        self.pdp_modal_zoom_next_arrow = "a[data-pmi-el='modal-swiper-button-next']"
        self.pdp_modal_zoom_prev_arrow = "a[data-pmi-el='modal-swiper-button-prev']"
        self.pdp_modal_zoom_thumbnails = "//body//div//div[@data-pmi-el='modal-swiper-thumbs']//div//div"
        self.pdp_modal_close_button = "button[data-bs-dismiss='modal']"
        self.pdp_extract_img_area = "main[role='main']"

    def trigger_lazy_load_actions(self, page=None):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        :param page: Optional specific page object (defaults to self.page).
        """
        page = page or self.page
        self.actions.page = page
        #Trigger lazy-load elements
        self.actions.wait_and_click_element(self.pdp_main_img)
        self.actions.wait_and_click_element(self.pdp_modal_zoom_next_arrow,repeat_until_disabled=True)
        self.actions.wait_and_click_element(self.pdp_modal_zoom_prev_arrow,repeat_until_disabled=True)
        self.actions.wait_and_click_element(self.pdp_modal_zoom_thumbnails, repeat_until_disabled=True, interact_all=True)
        time.sleep(2)
        self.actions.wait_and_click_element(self.pdp_modal_close_button)

    def post_lazy_load_trigger_actions_hook(self, page):
        """
        Perform actions after lazy loading, such as extracting and exporting image data.
        """
        # Sử dụng image_extractor để xử lý hình ảnh
        print(f"Extracting image properties for page (URL: {page.url})")
        self.image_extractor.page = page
        img_data = self.image_extractor.extract_image_data(self.pdp_extract_img_area)

        if not img_data or len(img_data) <= 1:
            print(f"No valid image data found for page (URL: {page.url}).")
            return None

        # Save extracted data to a unique Excel file for each tab
        filename = self.excel_writer.write_data_to_excel(
            img_data,
            executed_file_name=f"iqpd_image_data_{int(time.time())}",
            device_type=self.device
        )

        # Resolve the absolute path of the filename
        absolute_filename = os.path.abspath(filename)
        print(f"Image data exported to {absolute_filename} for page (URL: {page.url}).")
        return absolute_filename