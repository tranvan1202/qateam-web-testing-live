# python-tests/src/pages/iq_pdpage.py

from playwright.sync_api import Page
from src.cores.actions import Actions

class IQPDPage:
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)

    def perform_common_actions(self):
        # Click declared elements before scrolling
        self.actions.doubleclick_js_declared_elements("iqLazyLoadTriggerElementClassNames")
        self.actions.scroll_to_bottom()
        self.actions.scroll_to_top()
        self.actions.doubleclick_js_declared_elements("iqLazyLoadTriggerElementClassNames")
        self.actions.inject_button_script(self.actions.get_wait_time(self.device))
        self.actions.wait_for_button_trigger_or_timeout(self.device)