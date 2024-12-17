# python-tests/tests/suites/test_crawl_img_properties_suite.py
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
    "extract_image_properties_to_excel": True,
    "extract_image_properties_to_excel_locator": ""
}
urls_and_page_types_tuples = URLUtils.convert_string_list_url_to_tuple_type(URLS_AND_PAGE_TYPES)

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_crawl_img_properties(browser_factory_fixture, device_type):
    print("Creating browser context...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=False,
        headless=False,
        extensions=False,
        open_devtools=True
    )
    print("Browser context created.")
    # Step 1: Preprocess URLs
    BrowserManager.preprocess_urls(context, [url for url, _ in urls_and_page_types_tuples], TEST_SUITE_CONFIGS["s_test_env"])

    pages = []
    # Step 2.1: Process each page (multiple tabs)
    if TEST_SUITE_CONFIGS["multiple_tabs"]:
        for tab_number, (input_url, page_type) in enumerate(urls_and_page_types_tuples, start=1):
            page = context.pages[0] if context.pages else context.new_page()
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page, device_type)
            page_object.navigate_to_page(input_url)
            pages.append((page_object, tab_number))  # Collect page objects with their tab number

        for page_object, tab_number in pages:
            suite_processes(page_object, tab_number)
    else:
        # Step 2.2: Process each page (single tab)
        page = context.pages[0] if context.pages else context.new_page()
        for input_url, page_type in urls_and_page_types_tuples:
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page, device_type)
            page_object.navigate_to_page(input_url)
            #pages.append((page_object, None))  # No tab number for single tab
            suite_processes(page_object, None)

def suite_processes(page_object, tab_number=None):
    try:
        # Bring the page to the front
        page_object.page.bring_to_front()
        current_url = page_object.page.url

        # Log and process page-specific actions
        logging.info(f"Processing actions for Tab {tab_number if tab_number else 'Single'} {current_url}")
        print(f"Processing actions for Tab {tab_number if tab_number else 'Single'} {current_url}")
        if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
            page_object.execute_trigger_lazy_load_actions_flow()

        if TEST_SUITE_CONFIGS["extract_image_properties_to_excel"]:
            try:
                logging.info(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Exporting img properties to excel file...")
                print(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Exporting img properties to excel file...")
                # Attempt to extract image properties
                img_properties_excel_file_name = page_object.extract_img_properties_to_exel(TEST_SUITE_CONFIGS["extract_image_properties_to_excel_locator"])
                # Validate the output with pytest.assume
                pytest.assume(
                    img_properties_excel_file_name is not None, f"Tab {tab_number if tab_number else 'Single'} => {current_url}: File name should not be None"
                )
                pytest.assume(
                    img_properties_excel_file_name.strip() != "", f"Tab {tab_number if tab_number else 'Single'} => {current_url}: File name should not be empty"
                )
            except Exception as e:
                # If an exception occurs, fail the test
                pytest.assume(False, f"Tab {tab_number if tab_number else 'Single'} => {current_url}: An error occurred: {e}")

    except Exception as e:
        print(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        logging.error(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",  # Disable output capturing to see console logs
        "python-tests/tests/suites/test_crawl_img_properties_suite.py"
    ]
    pytest.main(pytest_args)
