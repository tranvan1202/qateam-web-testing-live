# python-tests/tests/suites/test_visual_on_pc_and_mo.py
import logging
import pytest
from src.cores.browser_manager import BrowserManager
from src.cores.page_factory import PageFactory
from src.utils.url_utils import URLUtils

URLS_AND_PAGE_TYPES = [
    "https://loremipsum.io/,pdp"
]
TEST_SUITE_CONFIGS = {
    "domain": "iq",
    "s_test_env": "qa",
    "multiple_tabs": True,
    "auto_trigger_lazy_load": True,
    "validate_urls": True,
}
urls_and_page_types_tuples = URLUtils.convert_string_list_url_to_tuple_type(URLS_AND_PAGE_TYPES)

@pytest.mark.parametrize(
    "device_type", ["pc", "mo"], ids=["device_pc", "device_mo"]
)
def test_access_correct_url(browser_factory_fixture, device_type):
    """Test page accessibility with multiple tabs and common actions."""
    print("Creating browser context...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=True,
        headless=False,
        extensions=True,
        open_devtools = True
    )
    print("Browser context created.")
    # Step 1: Preprocess URLs
    BrowserManager.preprocess_urls(context, [url for url, _ in urls_and_page_types_tuples], TEST_SUITE_CONFIGS["s_test_env"])

    # Step 2.1: Process each page (multiple tabs)
    pages = []
    if TEST_SUITE_CONFIGS["multiple_tabs"]:
        for tab_number, (input_url, page_type) in enumerate(urls_and_page_types_tuples, start=1):
            page = context.pages[0] if context.pages else context.new_page()
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page, device_type)
            page_object.navigate_to_page(input_url)
            pages.append((page_object, input_url, tab_number))  # Collect page objects with their tab number

        for page_object, input_url, tab_number in pages:
            suite_processes(page_object, input_url, tab_number)
    else:
        # Step 2.2: Process each page (single tab)
        page = context.pages[0] if context.pages else context.new_page()
        for input_url, page_type in urls_and_page_types_tuples:
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page, device_type)
            page_object.navigate_to_page(input_url)
            #pages.append((page_object, input_url, None))  # No tab number for single tab
            suite_processes(page_object, input_url, None)

def suite_processes(page_object, input_url, tab_number=None):
    try:
        # Bring the page to the front
        page_object.page.bring_to_front()

        # Log and process page-specific actions
        logging.info(f"Processing actions for Tab {tab_number if tab_number else 'Single'}")
        if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
            page_object.execute_trigger_lazy_load_actions_flow()

        if TEST_SUITE_CONFIGS["validate_urls"]:
            actual_url = page_object.page.url
            logging.info(f"Tab {tab_number if tab_number else 'Single'}: Validating URL.")
            print(f"Tab {tab_number if tab_number else 'Single'}: Expected {input_url}, Actual {actual_url}")
            pytest.assume(
                actual_url == input_url, f"Tab {tab_number if tab_number else 'Single'}: Expected URL {input_url}, but got {actual_url}"
            )
    except Exception as e:
        print(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        logging.error(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s -v",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_visual_on_pc_and_mo.py"
    ]
    pytest.main(pytest_args)