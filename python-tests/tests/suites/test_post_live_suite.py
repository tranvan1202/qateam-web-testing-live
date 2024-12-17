# python-tests/tests/suites/test_post_live_suite.py

import pytest
from src.cores.page_factory import PageFactory

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://p6-qa.samsung.com/sg/offer/"
]
domain = "ss"
page_type = "normal_pdp"
max_tabs = 10  # If >1, treat as multiple tabs
SCROLL_CONFIG = {
    "scroll_speed": 0.2,  # Seconds between scroll steps
    "scroll_distance": 400,  # Pixels per scroll step
    "milestones": [
        "body > div:nth-child(3) > div:nth-child(44) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(8) > div:nth-child(1) > div:nth-child(1)",  # Wait when the header is reached
        "div[id='my-recommended-product'] h2",  # Wait when the footer is reached
    ],
}

@pytest.mark.parametrize(
    "device_type", ["pc", "mo"], ids=["device_pc", "device_mo"]
)
@pytest.mark.parametrize(
    "url", URLS_TO_TEST, ids=[f"url_{i+1}" for i in range(len(URLS_TO_TEST))]
)
def test_post_live(browser_factory_fixture, device_type, url):
    """Test page1 accessibility with multiple tabs and common actions."""
    logged_in_context = None
    print("Creating browser context1...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=False,
        headless=False,
        extensions=False,
        open_devtools = True
    )
    print("Browser context1 created.")

    page = context.pages[0] if context.pages else context.new_page()
    page_object = PageFactory.create_page(domain, page_type, page, device=device_type)

    page_object.goto_and_scroll_two_pages(url, SCROLL_CONFIG)