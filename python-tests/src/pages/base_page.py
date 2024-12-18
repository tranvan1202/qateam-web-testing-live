# python-tests/src/pages/base_page.py
import logging
from abc import ABC, abstractmethod
from src.utils.actions_utils import ActionUtils
from src.cores.cache_manager import CacheManager
from src.cores.image_properties_extractor import ImagePropertiesExtractor
from src.cores.excel_writer import ExcelWriter

class BasePage(ABC):
    def __init__(self, page):
        self.page = page
        self._excel_writer = None
        self._image_extractor = None
        self._cache_manager = None
        self._options_click_all_founded_elements = {"click_all_founded_elements": True}
        self._options_click_until_disabled = {"click_until_disabled": True}
        self._options_click_all_elements_until_disabled = {"click_all_founded_elements": True, "click_until_disabled": True}

    @property
    def excel_writer(self):
        if not self._excel_writer:
            print("Initializing Excel Writer...")
            self._excel_writer = ExcelWriter()
        return self._excel_writer

    @property
    def image_extractor(self):
        if not self._image_extractor:
            print("Initializing Image Properties Extractor...")
            self._image_extractor = ImagePropertiesExtractor(self.page)
        return self._image_extractor

    @property
    def cache_manager(self):
        if not self.cache_manager:
            print("Initializing Cache Manager...")
            self._cache_manager = CacheManager()
        return self._cache_manager

    @abstractmethod
    def customize_lazy_load_trigger_actions(self):
        pass

    def navigate_to_page(self, url):
        try:
            logging.info(f"Navigating to URL: {url}")
            print(f"Navigating to URL: {url}")
            self.page.goto(url)
            self.page.wait_for_load_state("domcontentloaded")
            logging.info(f"Finished navigating to {url}")
            print(f"Finished navigating to {url}")
        except Exception as e:
            logging.error(f"Error navigating to {url}: {e}")
            print(f"Error navigating to {url}: {e}")

    def execute_trigger_lazy_load_actions_flow(self):
        """Optional helper for common workflows."""
        ActionUtils.scroll_to_bottom(self.page)
        self.customize_lazy_load_trigger_actions()
        ActionUtils.scroll_to_top(self.page)

    def extract_img_properties_to_exel(self, extract_img_locator:str, test_device):
        img_properties_to_excel_result = self.image_extractor.export_image_properties_to_excel(
            extract_img_area=extract_img_locator,
            device=test_device,
            excel_writer=self.excel_writer
        )
        return img_properties_to_excel_result
# ------------------------------------------------------------------------------------------------------------------------------------
    def get_dom_links(self):
        return self.page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")

    def get_dom_image_links(self):
        return self.page.evaluate("() => Array.from(document.querySelectorAll('img')).map(img => img.src)")

    def get_dom_video_links(self):
        return self.page.evaluate("() => Array.from(document.querySelectorAll('video')).map(video => video.src)")

    def get_dom_js_links(self):
        return self.page.evaluate("() => Array.from(document.querySelectorAll('script')).map(script => script.src)")