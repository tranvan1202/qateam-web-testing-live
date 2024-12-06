# python-tests/src/pages/i_hybris_promotion_rules_page.py
import time
from src.pages.base_page import BasePage

class IHybrisPromotionRulesPage(BasePage):
    def __init__(self, page, device):
        super().__init__(page, device)
        self.ih_marketing_tab_name = page.locator("td[class='y-tree-icon-hmc_treenode_marketing z-treecell'] span[class='z-label']")
        self.ih_marketing_promotion_rules_tab_name = page.locator("td[class='y-tree-icon-hmc_typenode_promotion_rules z-treecell'] span[class='z-label']")
        self.ih_marketing_promotion_rules_search = page.locator("input[placeholder='Type to search']")

    def trigger_customize_actions(self, page=None):
        """
        Override trigger_load_actions to define IQPD-specific actions.
        :param page: Optional specific page object (defaults to self.page).
        """
        page = page or self.page

        #Trigger lazy-load elements
        page.wait_for_load_state("domcontentloaded")
        self.actions.wait_and_click_element(self.ih_marketing_tab_name, page=page)
        time.sleep(0.5)
        self.actions.wait_and_click_element(self.ih_marketing_promotion_rules_tab_name, page=page)
        time.sleep(0.5)
        self.actions.wait_and_click_element(self.ih_marketing_promotion_rules_search, page=page)
        self.ih_marketing_promotion_rules_search.fill("test")
        time.sleep(5.5)
