# python-tests/tests/suites/test_iqpdp_extract_img_properties_suite.py
import os
import pytest
from src.pages.iq_pdpage import IQPDPage

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.samsung.com/vn/offer/price-promise/"
]
MAX_TABS = 3
VALIDATE_URLS = True  # Decide whether to validate navigated URLs

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_extract_img_properties(browser_factory_fixture, analyze_url_and_apply_cookie, device_type):
    """
    Test extracting image properties from multiple tabs.
    """
    context = None
    collected_results = []  # Store results of navigation and image extraction

    try:
        print("Creating browser context...")
        context = browser_factory_fixture(
            device_type=device_type,
            persistent=False,
            headless=False,
            extensions=False
        )
        print("Browser context created.")

        # Initialize IQPDPage
        page = context.pages[0] if context.pages else context.new_page()
        iqpd_page = IQPDPage(page, device=device_type)

        # Apply cookies to all URLs before navigation
        for url in URLS_TO_TEST:
            analyze_url_and_apply_cookie(context, url)

        # Navigate to URLs, perform actions, and collect results
        collected_results = iqpd_page.navigate_and_collect_images(
            urls=URLS_TO_TEST,
            max_tabs=MAX_TABS,
            validate_urls=VALIDATE_URLS
        )

    finally:
        # Perform assertions on collected results before closing the context
        if collected_results:
            failed_urls, missing_files = validate_results(collected_results)

            if failed_urls or missing_files:
                fail_test(failed_urls, missing_files)

def validate_results(collected_results):
    """
    Validate navigated URLs and exported files.
    :param collected_results: Results from the `navigate_and_collect_images` method.
    :return: Two lists - failed URLs and missing files.
    """
    failed_urls = []
    missing_files = []

    # Ensure results are matched correctly
    for expected_url, actual_url, filename in collected_results:
        # Validate navigated URLs
        if expected_url != actual_url:
            failed_urls.append(f"URL mismatch: Expected {expected_url}, got {actual_url}")

        # Validate exported files
        if filename is None or not os.path.isfile(os.path.abspath(filename)):
            missing_files.append(f"Missing file for URL: {expected_url}")
        else:
            print(f"File {filename} exists and passed validation.")

    return failed_urls, missing_files


def fail_test(failed_urls, missing_files):
    """
    Fail the test if there are any invalid URLs or missing files.
    :param failed_urls: List of failed URLs.
    :param missing_files: List of missing or invalid files.
    """
    error_messages = []
    if failed_urls:
        error_messages.append("The following URL mismatches occurred:\n" + "\n".join(failed_urls))
    if missing_files:
        error_messages.append("The following files were not generated or are invalid:\n" + "\n".join(missing_files))

    pytest.fail("\n\n".join(error_messages))


# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",  # Disable output capturing to see console logs
        "python-tests/tests/suites/test_iqpdp_extract_img_properties_suite.py"
    ]
    pytest.main(pytest_args)
