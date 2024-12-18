# python-tests/src/pages/i_hybris_promotion_rules_page.py
import time
from src.pages.base_page import BasePage
from src.utils.actions_utils import ActionUtils

class IHybrisPromotionRulesPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self.ih_marketing_tab_name = page.locator("td[class='y-tree-icon-hmc_treenode_marketing z-treecell'] span[class='z-label']")
        self.ih_marketing_promotion_rules_tab_name = page.locator("td[class='y-tree-icon-hmc_typenode_promotion_rules z-treecell'] span[class='z-label']")
        self.ih_marketing_promotion_rules_search = page.locator("input[placeholder='Type to search']")

    def customize_lazy_load_trigger_actions(self):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        """
        #Trigger lazy-load elements
        ActionUtils.wait_and_click_elements(self.ih_marketing_tab_name)
        time.sleep(0.5)
        ActionUtils.wait_and_click_elements(self.ih_marketing_promotion_rules_tab_name)
        time.sleep(0.5)
        ActionUtils.wait_and_click_elements(self.ih_marketing_promotion_rules_search)

        self.search_promotion("test_ne")
        time.sleep(5.5)

    def search_promotion(self,text):
        self.ih_marketing_promotion_rules_search.fill(text)
        self.ih_marketing_promotion_rules_search.press("Enter")
