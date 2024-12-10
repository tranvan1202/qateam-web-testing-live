# python-tests/src/pages/s_normal_pdpage.py
from src.pages.base_page import BasePage

class SSPDPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.s_pdp_gallery_next_arrow = page.locator("button[class='swiper-button-next pd-header-gallery__thumbnail-button']")
        self.s_pdp_swiper_pagination_bullet = page.locator("button[class~='indicator__item']")
        self.s_pdp_header_gallery_thumbnails = page.locator("div[class~='pd-header-gallery__thumbnail-swiper'] ul[role='list'] li")
        self.s_pdp_extract_img_area = ""

    def trigger_customize_actions_hook(self, page=None):
        """
        Default implementation is to click declared elements.
        """
        page = page or self.page

        # Trigger lazy-load elements
        self.actions.wait_and_click_element(self.s_pdp_swiper_pagination_bullet, interact_all=True, page=page)
        self.actions.wait_and_click_element(self.s_pdp_header_gallery_thumbnails, interact_all=True, page=page)

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
                extract_img_area=self.s_pdp_extract_img_area,
                device=self.device,
                excel_writer=self.excel_writer
            )
            return img_properties_to_excel_result

        # Action: Perform smoke test
        if action_flags.get("is_smoke_test", False):
            self.smoke_test_content(page)

    def smoke_test_content(self, page):
        """
        Validate content for smoke testing: links, images, videos, and JS files.
        :param page: The Playwright page object to operate on.
        """
        print(f"Performing smoke test on page: {page.url}")

        # Check for broken links
        self.validate_links(page)

        # Check for broken images
        self.validate_images(page)

        # Check for broken videos
        self.validate_videos(page)

        # Check for broken JS files
        self.validate_js_files(page)