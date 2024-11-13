# python-tests/src/pages/base_page.py
from abc import ABC, abstractmethod
from playwright.sync_api import Page
from src.cores.actions import Actions

class BasePage(ABC):
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.actions = Actions(page, device)

    def perform_common_actions(self):
        """Perform common actions such as scrolling and button injection."""
        self.actions.scroll_to_bottom()
        # Call page-specific actions to handle additional unique interactions
        self.trigger_load_actions()
        self.actions.scroll_to_top()
        self.actions.inject_button_script(self.actions.get_wait_time(self.device))
        self.actions.wait_for_button_trigger_or_timeout(self.device)


    def trigger_load_actions(self):
        """Define page-specific actions to be implemented in subclasses."""
        self.actions.click_js_declared_elements("ssLazyLoadTriggerElementClassNames")