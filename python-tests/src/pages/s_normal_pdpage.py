# python-tests/src/pages/s_normal_pdpage.py
from src.pages.base_page import BasePage

class SSPDPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.s_pdp_gallery_next_arrow = page.locator("button[class='swiper-button-next pd-header-gallery__thumbnail-button']")
        self.s_pdp_swiper_pagination_bullet = page.locator("button[class~='indicator__item']")
        self.s_pdp_header_gallery_thumbnails = page.locator("div[class~='pd-header-gallery__thumbnail-swiper'] ul[role='list'] li")
        self.s_pdp_extract_img_area = page.locator("")

    def trigger_customize_actions(self, page=None):
        """
        Default implementation is to click declared elements.
        """
        page = page or self.page

        # Trigger lazy-load elements
        self.actions.wait_and_click_element(self.s_pdp_swiper_pagination_bullet, interact_all=True, page=page)
        self.actions.wait_and_click_element(self.s_pdp_header_gallery_thumbnails, interact_all=True, page=page)

    def post_trigger_actions_hook(self, page=None, action_flags=None):
        page = page or self.page
        action_flags = action_flags or {}

        # Action: Extract image properties
        if action_flags.get("extract_image_properties_to_excel", False):
            img_properties_to_excel_result = self.image_extractor.extract_image_properties_to_excel(
                page=page,
                extract_img_area=self.s_pdp_extract_img_area,
                device=self.device,
                excel_writer=self.excel_writer
            )
            return img_properties_to_excel_result