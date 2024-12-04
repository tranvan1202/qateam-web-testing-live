# python-tests/src/pages/s_normal_pdpage.py
import os
import time
from src.pages.base_page import BasePage

class SSPDPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.pdp_gallery_next_arrow = ""
        self.pdp_gallery_prev_arrow = ""
        self.indicator_item_class_name = "indicator__item"

    def trigger_lazy_load_actions(self, page=None):
        """
        Define page-specific actions, optionally for a given page.
        Default implementation is to click declared elements.
        """
        page = page or self.page
        self.actions.page = page

        self.actions.wait_and_click_element(self.indicator_item_class_name,interact_all=True)