# python-tests/tests/suites/test_standard_smoke_check_suite.py
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
    "auto_trigger_lazy_load": False,
    "test_broken_links": True,
    "test_broken_images": False,
    "test_broken_videos": False,
    "test_broken_js": False
}
urls_and_page_types_tuples = URLUtils.convert_string_list_url_to_tuple_type(URLS_AND_PAGE_TYPES)

@pytest.mark.parametrize(
    "device_type", ["pc", "mo"], ids=["device_pc", "device_mo"]
)
def test_standard_smoke(browser_factory_fixture, device_type):
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
    pages = []
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

        if TEST_SUITE_CONFIGS["test_broken_links"]:
            try:
                grabbed_links = page_object.get_dom_links()
                logging.info(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, collecting links...")
                print(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, collecting links...")
                processed_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, grabbed_links)
                logging.info(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking links...")
                print(f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking links...")
                validate_urls_with_cache(processed_urls, "links")

            except Exception as e:
                # If an exception occurs, fail the test
                pytest.assume(False,f"Tab {tab_number if tab_number else 'Single'} => {current_url}: An error occurred: {e}")

        if TEST_SUITE_CONFIGS["test_broken_images"]:
            try:
                logging.info(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken images...")
                print(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken images...")

            except Exception as e:
                # If an exception occurs, fail the test
                pytest.assume(False,
                              f"Tab {tab_number if tab_number else 'Single'} => {current_url}: An error occurred: {e}")

        if TEST_SUITE_CONFIGS["test_broken_videos"]:
            try:
                logging.info(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken videos...")
                print(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken videos...")

            except Exception as e:
                # If an exception occurs, fail the test
                pytest.assume(False,
                              f"Tab {tab_number if tab_number else 'Single'} => {current_url}: An error occurred: {e}")

        if TEST_SUITE_CONFIGS["test_broken_js"]:
            try:
                logging.info(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken JS files...")
                print(
                    f"Tab {tab_number if tab_number else 'Single'} => {current_url}: Smoke test, checking broken JS files....")

            except Exception as e:
                # If an exception occurs, fail the test
                pytest.assume(False,
                              f"Tab {tab_number if tab_number else 'Single'} => {current_url}: An error occurred: {e}")

    except Exception as e:
        print(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        logging.error(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")

def validate_urls_with_cache(processed_urls, url_type):
    total_urls = len(processed_urls)
    print(f"Total grabbed URLs: {total_urls}\n")
    # Tiến hành kiểm tra từng url
    for idx, url in enumerate(processed_urls):
        # Kiểm tra trạng thái HTTP qua cache
        response_result = URLUtils.check_url_status_with_cache(url, url_type, timeout=10)
        # Xử lý kết quả
        if response_result is None:
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Unable to check Link: {url}")
        elif response_result == 404:
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Broken: {url} (HTTP {response_result})")
        else:
            print(f"[{idx + 1}/{total_urls}]: [PASS] {url} (HTTP {response_result})")

if __name__ == "__main__":
    pytest_args = [
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_standard_smoke_check_suite.py"
    ]
    pytest.main(pytest_args)