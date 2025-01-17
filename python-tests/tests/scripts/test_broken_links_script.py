import pytest
from src.utils.url_utils import URLUtils

URLS_TO_TEST= [
    "https://www.samsung.com/sgz/offer/#content","https://www.samsung.com/zsg/offer/#accHelp","https://www.samsung.com/sg/info/privacy/"
]
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
def test_connection_status(browser_factory_fixture):
    context = browser_factory_fixture(
        device_type="pc",
        persistent=False,
        headless=True,
        extensions=False,
        open_devtools=False
    )
    broken_link_result = []
    processed_urls = URLUtils.filter_inputted_urls(URLS_TO_TEST, False)
    total_urls = len(processed_urls)
    print(f"Total inputted URLs: {total_urls}\n")

    for idx, url in enumerate(processed_urls):
        # Kiểm tra trạng thái HTTP qua cache
        url_response_status = URLUtils.check_url_status_with_cache(url, "links", timeout=10, context=context)
        # Xử lý kết quả
        if url_response_status is None:
            url_response_status = "Unable to check"
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Unable to check Link: {url}")
            broken_link_result.append((f"{url}", url_response_status))
        elif url_response_status.__contains__("404"):
            print(f"[{idx + 1}/{total_urls}]: [FAIL] Broken: {url} (HTTP {url_response_status})")
            broken_link_result.append((f"{url}", url_response_status))
        else:
            print(f"[{idx + 1}/{total_urls}]: [PASS] {url} (HTTP {url_response_status})")

    pytest.assume(
        len(broken_link_result) == 0,
        f"Broken links:\n" + "\n".join([f"URL: {url}, Status: {status}" for url, status in broken_link_result])
    )