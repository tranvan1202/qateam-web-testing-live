# python-tests/src/pages/iq_pdpage.py
from src.pages.base_page import BasePage
from src.cores.actions import Actions
from src.cores.image_properties_extractor import ImagePropertiesExtractor

class IQPDPage(BasePage):
    def __init__(self, page, device: str):
        super().__init__(page, device)
        self.actions = Actions(page, device)

    def trigger_load_actions(self):
        #super().trigger_load_actions()  # Optionally call the default actions
        self.actions.click_js_declared_elements("iqLazyLoadTriggerElementClassNames") # Add IQPD-specific actions or  """Completely custom load actions for AnotherPage."""

    def get_image_data(self):
        """Extract image data only when needed in the test."""
        self.perform_common_actions()  # Perform scrolling, button injection, etc.
        image_extractor = ImagePropertiesExtractor(self.page)
        return image_extractor.extract_image_data()