from src.pages.i_hybris_promotion_rules_page import IHybrisPromotionRulesPage
from src.pages.i_pdpage import IQPDPage
from src.pages.s_normal_pdpage import SSPDPage

class PageFactory:
    """
    Factory class to create Page Object instances based on domain and page type.
    """
    PAGE_MAPPING = {
        "iq": {
            "pdp": IQPDPage,
            "hybris": IHybrisPromotionRulesPage
        },
        "ss": {
            "normal_pdp": SSPDPage
        }
    }

    @staticmethod
    def create_page(domain: str, page_type: str, page):
        # Check if the domain exists in the mapping
        if domain not in PageFactory.PAGE_MAPPING:
            raise ValueError(f"Unsupported domain: {domain}")

        # Check if the page type exists for the domain
        if page_type not in PageFactory.PAGE_MAPPING[domain]:
            raise ValueError(f"Unsupported page type '{page_type}' for domain '{domain}'")

        # Get the appropriate Page Object class
        page_class = PageFactory.PAGE_MAPPING[domain][page_type]

        # Return an instance of the Page Object class
        return page_class(page)
