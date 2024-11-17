# python-tests/tests/suites/test_visual_on_pc_and_mo.py

import pytest
from src.pages.manual_check_page import ManualCheckPage

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.iqos.com/id/en/shop/iluma-prime-kit-golden-khaki.html?gr=false",
    "https://www.samsung.com/my/business/washers-and-dryers/washing-machines/wa5000c-top-load-ecobubble-digital-inverter-technology-super-speed-wa13cg5745bvfq/"
]

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_access_correct_url(browser_factory_fixture, analyze_url_and_apply_cookie, device_type):
    """Test page accessibility with optional cookie management."""
    failed_urls = []
    context = None  # Initialize context to ensure proper cleanup in case of an error

    try:
        print("Creating browser context...")
        context = browser_factory_fixture(
            device_type=device_type,
            persistent=False,
            headless=False,
            extensions=False
        )
        print("Browser context created.")

        # Use the initial blank tab created by the browser context
        page = context.pages[0] if context.pages else context.new_page()

        for url in URLS_TO_TEST:
            try:
                print(f"Processing URL: {url}")
                # Apply cookies if available
                analyze_url_and_apply_cookie(context, url)

                # Use the existing page to navigate to the URL
                manual_check_page = ManualCheckPage(page, device=device_type)
                manual_check_page.navigate(url)
                manual_check_page.perform_common_actions()

                assert manual_check_page.is_url_loaded(url), f"Expected URL: {url}, but got {page.url}"

                print(f"Successfully validated URL: {url}")

            except AssertionError as e:
                print(f"Test failed for URL: {url}")
                failed_urls.append(f"URL: {url}, Error: {e}")

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
