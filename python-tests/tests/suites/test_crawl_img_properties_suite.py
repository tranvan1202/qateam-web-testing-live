# python-tests/tests/suites/test_crawl_img_properties_suite.py
import logging
import pytest
from src.cores.browser_manager import BrowserManager
from src.cores.page_factory import PageFactory
from src.utils.actions_utils import ActionUtils
from src.utils.url_utils import URLUtils

URLS_AND_PAGE_TYPES = [
    "https://zingnews.vn/,normal_pdp"
]
TEST_SUITE_CONFIGS = {
    "domain": "ss",
    "s_test_env": "qa",
    "multiple_tabs": True,
    "auto_trigger_lazy_load": True,
    "extract_image_properties_to_excel": True,
    "extract_image_properties_to_excel_locator": "div[class='category-slider__contents scrollbar'] div[class='scrollbar__wrap']"
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

    # Step 2.1: Process each page (multiple tabs)
    if TEST_SUITE_CONFIGS["multiple_tabs"]:
        existing_pages = context.pages
        pages = []
        for tab_number, (input_url, page_type) in enumerate(urls_and_page_types_tuples, start=1):
            if tab_number == 1 and existing_pages:  # Reuse the blank tab for the first URL
                page = existing_pages[0]
            else:
                page = context.new_page()  # Create a new page for subsequent tabs

            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page)
            page_object.navigate_to_page(input_url)
            pages.append((page_object, tab_number))  # Collect page objects with their tab number

        for page_object, tab_number in pages:
            # Bring the page to the front
            page_object.page.bring_to_front()
            if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
                page_object.execute_trigger_lazy_load_actions_flow()

            ActionUtils.inject_button_script(page_object.page, ActionUtils.get_wait_time(device_type))
            ActionUtils.wait_for_button_trigger_or_timeout(page_object.page, device_type)

            if TEST_SUITE_CONFIGS["extract_image_properties_to_excel"]:
                execute_extract_image_properties_to_excel(page_object, tab_number, device_type)
    else:
        # Step 2.2: Process each page (single tab)
        page = context.pages[0] if context.pages else context.new_page()
        for input_url, page_type in urls_and_page_types_tuples:
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page)
            page_object.navigate_to_page(input_url)

            if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
                page_object.execute_trigger_lazy_load_actions_flow()

            ActionUtils.inject_button_script(page_object.page, ActionUtils.get_wait_time(device_type))
            ActionUtils.wait_for_button_trigger_or_timeout(page_object.page, device_type)

            if TEST_SUITE_CONFIGS["extract_image_properties_to_excel"]:
                execute_extract_image_properties_to_excel(page_object, None, device_type)

def execute_extract_image_properties_to_excel(page_object, tab_number=None, device_type="pc"):
    page_current_url = page_object.page.url
    try:
        logging.info(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Exporting img properties to excel file...")
        print(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Exporting img properties to excel file...")
        # Attempt to extract image properties
        img_properties_excel_file_name = page_object.extract_img_properties_to_exel(
            TEST_SUITE_CONFIGS["extract_image_properties_to_excel_locator"], device_type)
        # Validate the output with pytest.assume
        pytest.assume(
            img_properties_excel_file_name is not None,
            f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: File name should not be None"
        )
        pytest.assume(
            img_properties_excel_file_name.strip() != "",
            f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: File name should not be empty"
        )

    except Exception as e:
        print(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        logging.error(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        pytest.assume(False, f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: An error occurred: {e}")

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",  # Disable output capturing to see console logs
        "python-tests/tests/suites/test_crawl_img_properties_suite.py"
    ]
    pytest.main(pytest_args)
