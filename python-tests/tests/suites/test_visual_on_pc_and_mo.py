# python-tests/tests/suites/test_visual_on_pc_and_mo.py
import pytest
from src.cores.page_factory import PageFactory

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://samsung.com/sg/offer",
    "https://samsung.com/sg",
    "https://samsung.com/vn"
]
domain = "ss"
page_type = "normal_pdp"
max_tabs = 1  # If >1, treat as multiple tabs
validate_urls = True  # Decide whether to validate navigated URLs

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

    page = context.pages[0] if context.pages else context.new_page()
    page_object = PageFactory.create_page(domain, page_type, page, device=device_type)

    # Perform navigation and actions
    page_object.open_tabs_and_perform_actions(
        context=context,
        urls=URLS_TO_TEST,
        max_tabs=max_tabs,
        action_flags={"collect_url_by_tab": validate_urls}
    )

    # Validate navigated URLs if validation is enabled
    if validate_urls:
        collected_url_results = getattr(page_object, "collected_url_results", [])
        for tab_index, input_url, actual_url in collected_url_results:
            pytest.assume(
                actual_url == input_url,
                f"Tab {tab_index}: Expected URL {input_url}, but got {actual_url}"
            )

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_visual_on_pc_and_mo.py"
    ]
    pytest.main(pytest_args)