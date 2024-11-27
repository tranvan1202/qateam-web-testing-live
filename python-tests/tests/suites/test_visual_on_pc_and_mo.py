import pytest
from src.pages.common_page import CommonCheckPage

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.samsung.com/vn",
    "https://www.samsung.com/sg/offer/",
    "https://www.samsung.com/th",
]
max_tabs = 10  # If >1, treat as multiple tabs
validate_urls = True  # Decide whether to validate navigated URLs

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_access_correct_url(browser_factory_fixture, analyze_url_and_apply_cookie, device_type):
    """Test page accessibility with multiple tabs and common actions."""
    #validation_errors = []  # To collect all validation errors

    print("Creating browser context...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=True,
        headless=False,
        extensions=True,
        open_devtools = True
    )
    print("Browser context created.")

    # Initialize CommonCheckPage
    page = context.pages[0] if context.pages else context.new_page()
    common_check_page = CommonCheckPage(page, device=device_type)

    # Apply cookies for all URLs
    for url in URLS_TO_TEST:
        analyze_url_and_apply_cookie(context, url)

    # Perform navigation and actions
    tab_results = common_check_page.navigate_and_perform_actions(
        urls=URLS_TO_TEST,
        max_tabs=max_tabs,
        collect_results=validate_urls
    )

    # Validate navigated URLs if validation is enabled
    if validate_urls:
        for tab_index, expected_url, actual_url in tab_results:
            pytest.assume(
                actual_url == expected_url,
                f"Tab {tab_index}: Expected URL {expected_url}, but got {actual_url}"
            )
        #pytest.fail("\n".join(validation_errors))

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_visual_on_pc_and_mo.py"
    ]
    pytest.main(pytest_args)
