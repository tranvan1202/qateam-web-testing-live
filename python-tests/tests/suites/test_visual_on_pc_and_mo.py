# python-tests/tests/suites/test_visual_on_pc_and_mo.py

import pytest
from src.pages.manual_check_page import ManualCheckPage

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.samsung.com/my/business/washers-and-dryers/washing-machines/wa5000c-top-load-ecobubble-digital-inverter-technology-super-speed-wa13cg5745bvfq/",
    "https://www.samsung.com/my/watches/galaxy-watch/galaxy-watch-ultra-titanium-gray-lte-sm-l705fdaaxme/buy/"
]

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_access_correct_url(browser_factory_fixture, analyze_url_and_apply_cookie, device_type):
    """Test page accessibility with multiple tabs and common actions."""
    max_tabs = 10  # If >1, treat as multiple tabs
    failed_urls = []
    context = None

    try:
        print("Creating browser context...")
        context = browser_factory_fixture(
            device_type=device_type,
            persistent=True,
            headless=False,
            extensions=True
        )
        print("Browser context created.")

        # Initialize ManualCheckPage
        page = context.pages[0] if context.pages else context.new_page()
        manual_check_page = ManualCheckPage(page, device=device_type)

        # Apply cookies for all URLs
        for url in URLS_TO_TEST:
            analyze_url_and_apply_cookie(context, url)

        # Perform navigation and actions
        failed_urls = manual_check_page.navigate_and_perform_actions(
            urls=URLS_TO_TEST,
            max_tabs=max_tabs
        )

    finally:
        if context:
            context.close()
            print("Browser context closed.")

    if failed_urls:
        pytest.fail("\n".join(failed_urls))

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_visual_on_pc_and_mo.py"
    ]
    pytest.main(pytest_args)
