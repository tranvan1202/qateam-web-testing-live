# python-tests/tests/suites/test_standard_smoke_check_suite.py
import pytest
from src.cores.browser_manager import BrowserManager
from src.cores.page_factory import PageFactory
from src.utils.actions_utils import ActionUtils
from src.utils.url_utils import URLUtils

URLS_AND_PAGE_TYPES = [
    "https://p6-qa.samsung.com/ph/offer/online/2024/galaxy-grand-holiday-sale/,normal_pdp",
    "https://loremipsum.io/,normal_pdp",
    "https://p6-qa.samsung.com/ph/offer/online/2024/galaxy-grand-holiday-sale/,normal_pdp"
]
TEST_SUITE_CONFIGS = {
    "domain": "ss",
    "s_test_env": "qa",
    "multiple_tabs": False,
    "auto_trigger_lazy_load": True,
    "test_broken_links": False,
    "test_broken_images": False,
    "test_broken_videos": False,
    "test_broken_js_scripts": True,
    "test_broken_css_scripts": False
}
urls_and_page_types_tuples = URLUtils.convert_string_list_url_to_tuple_type(URLS_AND_PAGE_TYPES)

@pytest.mark.parametrize(
    "device_type", ["mo"], ids=["device_MO_to_PC"]
)
def test_standard_smoke(browser_factory_fixture, device_type):
    print("Creating browser context...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=True,
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

            page_object.page.set_viewport_size({"width": 1440, "height": 700})

            if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
                page_object.execute_trigger_lazy_load_actions_flow()

            ActionUtils.inject_button_script(page_object.page, ActionUtils.get_wait_time(device_type))
            ActionUtils.wait_for_button_trigger_or_timeout(page_object.page, device_type)

            execute_test_suite_processes(page_object, tab_number, context)
    else:
        # Step 2.2: Process each page (single tab)
        page = context.pages[0] if context.pages else context.new_page()
        for input_url, page_type in urls_and_page_types_tuples:
            page_object = PageFactory.create_page(TEST_SUITE_CONFIGS["domain"], page_type, page)
            page_object.navigate_to_page(input_url)
            if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
                page_object.execute_trigger_lazy_load_actions_flow()

            page_object.page.set_viewport_size({"width": 1440, "height": 700})

            if TEST_SUITE_CONFIGS["auto_trigger_lazy_load"]:
                page_object.execute_trigger_lazy_load_actions_flow()

            ActionUtils.inject_button_script(page_object.page, ActionUtils.get_wait_time(device_type))
            ActionUtils.wait_for_button_trigger_or_timeout(page_object.page, device_type)

            execute_test_suite_processes(page_object, None, context)

def execute_test_suite_processes(page_object, tab_number=None, context=None):
    page_current_url = page_object.page.url
    try:
        # Log and process page-specific actions
        print(f"Processing actions for Tab {tab_number if tab_number else 'Single'} {page_current_url}")
        if TEST_SUITE_CONFIGS["test_broken_links"]:
            print(f"-------------------------------START CHECKING BROKEN LINKS-------------------------------------------------")
            page_grabbed_links = page_object.get_dom_links()
            processed_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, page_grabbed_links, True)
            print(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Smoke test, checking links...")

            broken_links_result = check_if_broken_urls_with_cache(processed_urls, "links", context)
            pytest.assume(
                len(broken_links_result) == 0,
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Broken links: {broken_links_result}"
            )
            print(f"-------------------------------END CHECKING BROKEN LINKS-------------------------------------------------")

        if TEST_SUITE_CONFIGS["test_broken_images"]:
            print(f"-------------------------------START CHECKING BROKEN IMAGES-------------------------------------------------")
            page_grabbed_img_links = page_object.get_dom_image_links()
            processed_img_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, page_grabbed_img_links)
            print(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Smoke test, checking broken Images....")
            broken_img_links_result = check_if_broken_urls_with_cache(processed_img_urls, "images")
            pytest.assume(
                len(broken_img_links_result) == 0,
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Broken Images: {broken_img_links_result}"
            )
            print(f"-------------------------------END CHECKING BROKEN IMAGES-------------------------------------------------")

        if TEST_SUITE_CONFIGS["test_broken_videos"]:
            print(
                f"-------------------------------START CHECKING BROKEN VIDEOS-------------------------------------------------")
            page_grabbed_video_links = page_object.get_dom_video_links()
            processed_video_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, page_grabbed_video_links)
            print(
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Smoke test, checking broken Videos....")
            broken_video_links_result = check_if_broken_urls_with_cache(processed_video_urls, "videos")
            pytest.assume(
                len(broken_video_links_result) == 0,
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Broken Videos: {broken_video_links_result}"
            )
            print(
                f"-------------------------------END CHECKING BROKEN VIDEOS-------------------------------------------------")

        if TEST_SUITE_CONFIGS["test_broken_js_scripts"]:
            print(f"-------------------------------START CHECKING BROKEN JS LINKS-------------------------------------------------")
            page_grabbed_js_links = page_object.get_dom_js_links()
            processed_js_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, page_grabbed_js_links)
            print(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Smoke test, checking broken JS script files....")
            broken_js_links_result = check_if_broken_urls_with_cache(processed_js_urls, "js")
            pytest.assume(
                len(broken_js_links_result) == 0,
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Broken js files: {broken_js_links_result}"
            )
            print(f"-------------------------------END CHECKING BROKEN JS LINKS-------------------------------------------------")

        if TEST_SUITE_CONFIGS["test_broken_css_scripts"]:
            print(f"-------------------------------START CHECKING BROKEN CSS LINKS-------------------------------------------------")
            page_grabbed_css_links = page_object.get_dom_css_links()
            processed_css_urls = URLUtils.filter_grabbed_raw_urls(page_object.page, page_grabbed_css_links)
            print(f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Smoke test, checking broken CSS script files....")
            broken_css_links_result = check_if_broken_urls_with_cache(processed_css_urls, "css")
            pytest.assume(
                len(broken_css_links_result) == 0,
                f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: Broken css files: {broken_css_links_result}"
            )
            print(f"-------------------------------END CHECKING BROKEN CSS LINKS-------------------------------------------------")

    except Exception as e:
        print(f"Error processing Tab {tab_number if tab_number else 'Single'}: {e}")
        pytest.assume(False, f"Tab {tab_number if tab_number else 'Single'} => {page_current_url}: An error occurred: {e}")

def check_if_broken_urls_with_cache(processed_urls, url_type, context=None):
    url_response_results = []
    total_urls = len(processed_urls)
    print(f"Total grabbed URLs: {total_urls}\n")
    # Tiến hành kiểm tra từng url
    for idx, url in enumerate(processed_urls):
        # Kiểm tra trạng thái HTTP qua cache
        url_response_status = URLUtils.check_url_status_with_cache(url, url_type, timeout=10, context=context)
        # Xử lý kết quả
        if url_response_status is None:
            url_response_status = "Unable to check"
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Unable to check Link: {url}")
            url_response_results.append((f"{url}", url_response_status))
        elif url_response_status == 404:
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Broken: {url} (HTTP {url_response_status})")
            url_response_results.append((f"{url}", url_response_status))
        else:
            print(f"[{idx + 1}/{total_urls}]: [PASS] {url} (HTTP {url_response_status})")

    return url_response_results

if __name__ == "__main__":
    pytest_args = [
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_standard_smoke_check_suite.py"
    ]
    pytest.main(pytest_args)