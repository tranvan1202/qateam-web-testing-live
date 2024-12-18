# python-tests/src/pages/s_normal_pdpage.py
from src.pages.base_page import BasePage
from src.utils.actions_utils import ActionUtils

class SSPDPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self._s_pdp_gallery_next_arrow = page.locator("button[class='swiper-button-next pd-header-gallery__thumbnail-button']")
        self._s_pdp_swiper_pagination_bullet = page.locator("button[class~='indicator__item']")
        self._s_pdp_header_gallery_thumbnails = page.locator("div[class~='pd-header-gallery__thumbnail-swiper'] ul[role='list'] li")

    def customize_lazy_load_trigger_actions(self):
        # Trigger lazy-load elements
        ActionUtils.wait_and_click_elements(self._s_pdp_swiper_pagination_bullet, self._options_click_all_founded_elements)
        ActionUtils.wait_and_click_elements(self._s_pdp_header_gallery_thumbnails,self._options_click_all_founded_elements)