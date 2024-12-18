# python-tests/src/pages/i_pdpage.py
import time
from src.pages.base_page import BasePage
from src.utils.actions_utils import ActionUtils

class IQPDPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self._i_pdp_main_img = page.locator("div[class='swiper-wrapper align-items-center'] div[class='swiper-slide text-center swiper-slide-active']")
        self._i_pdp_modal_zoom_next_arrow = page.locator("a[data-pmi-el='modal-swiper-button-next']")
        self._i_pdp_modal_zoom_prev_arrow = page.locator("a[data-pmi-el='modal-swiper-button-prev']")
        self._i_pdp_modal_zoom_thumbnails = page.locator("//body//div//div[@data-pmi-el='modal-swiper-thumbs']//div//div")
        self._i_pdp_modal_close_button = page.locator("button[data-bs-dismiss='modal']")
        self._i_pdp_extract_img_area = "main[role='main']"

    def customize_lazy_load_trigger_actions(self):
        #Trigger lazy-load elements
        ActionUtils.wait_and_click_elements(self._i_pdp_main_img)
        ActionUtils.wait_and_click_elements(self._i_pdp_modal_zoom_next_arrow, self._options_click_until_disabled)
        ActionUtils.wait_and_click_elements(self._i_pdp_modal_zoom_prev_arrow, self._options_click_until_disabled)
        ActionUtils.wait_and_click_elements(self._i_pdp_modal_zoom_thumbnails, self._options_click_all_elements_until_disabled)
        time.sleep(1)
        ActionUtils.wait_and_click_elements(self._i_pdp_modal_close_button)