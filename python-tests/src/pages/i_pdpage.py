# python-tests/src/pages/i_pdpage.py
import time
from src.pages.base_page import BasePage

class IQPDPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.i_pdp_main_img = page.locator("div[class='swiper-wrapper align-items-center'] div[class='swiper-slide text-center swiper-slide-active']")
        self.i_pdp_modal_zoom_next_arrow = page.locator("a[data-pmi-el='modal-swiper-button-next']")
        self.i_pdp_modal_zoom_prev_arrow = page.locator("a[data-pmi-el='modal-swiper-button-prev']")
        self.i_pdp_modal_zoom_thumbnails = page.locator("//body//div//div[@data-pmi-el='modal-swiper-thumbs']//div//div")
        self.i_pdp_modal_close_button = page.locator("button[data-bs-dismiss='modal']")
        self.i_pdp_extract_img_area = "body"

    def trigger_customize_actions_hook(self, page=None):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        :param page: Optional specific page object (defaults to self.page).
        """
        page = page or self.page

        #Trigger lazy-load elements
        self.actions.wait_and_click_element(self.i_pdp_main_img, page=page)
        self.actions.wait_and_click_element(self.i_pdp_modal_zoom_next_arrow, repeat_until_disabled=True, page=page)
        self.actions.wait_and_click_element(self.i_pdp_modal_zoom_prev_arrow, repeat_until_disabled=True, page=page)
        self.actions.wait_and_click_element(self.i_pdp_modal_zoom_thumbnails, repeat_until_disabled=True, interact_all=True, page=page)
        time.sleep(1)
        self.actions.wait_and_click_element(self.i_pdp_modal_close_button, page=page)

    def post_trigger_actions_hook(self, page=None, action_flags=None, tab_number=None, url=None):
        page = page or self.page
        action_flags = action_flags or {}

        # Option 1: Collect URL data by tab
        if action_flags.get("collect_url_by_tab", False):
            try:
                actual_url = page.url
                print(f"Tab {tab_number}: Expected URL {url}, Actual URL {actual_url}")
                if not hasattr(self, "collected_url_results"):
                    self.collected_url_results = []  # Initialize collection
                self.collected_url_results.append((tab_number, url, actual_url))
            except Exception as e:
                print(f"Error collecting URL data for tab {tab_number}: {e}")
                if not hasattr(self, "collected_url_results"):
                    self.collected_url_results = []  # Initialize collection
                self.collected_url_results.append((tab_number, url, str(e)))

        # Action: Extract image properties
        if action_flags.get("extract_image_properties_to_excel", False):
            img_properties_to_excel_result = self.image_extractor.extract_image_properties_to_excel(
                page=page,
                extract_img_area=self.i_pdp_extract_img_area,
                device=self.device,
                excel_writer=self.excel_writer
            )
            return img_properties_to_excel_result

