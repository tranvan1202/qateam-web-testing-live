# python-tests/tests/suites/test_visual_on_pc_and_mo.py

import pytest
from src.pages.s_normal_pdpage import SSPDPage

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.pp.iqos.com/id/en/shop/iluma-prime-kit-jade-green.html",
    "https://www.pp.iqos.com/id/en/shop/iluma-prime-kit-obsidian-black.html",
    "https://www.pp.iqos.com/id/en/iqos-heated-tobacco/buy-terea.html"
]
max_tabs = 10  # If >1, treat as multiple tabs
validate_urls = True  # Decide whether to validate navigated URLs
s_login_env = "qa"

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

    # Initialize Page Object
    page = context.pages[0] if context.pages else context.new_page()
    ss_normal_pd_page = SSPDPage(page, device=device_type)

    # Perform navigation and actions
    validate_url_tab_results = ss_normal_pd_page.open_tabs_and_perform_actions(
        context,
        urls=URLS_TO_TEST,
        max_tabs=max_tabs,
        collect_url_by_tab=validate_urls,
        s_login_env=s_login_env
    )

    # Validate navigated URLs if validation is enabled
    if validate_urls:
        for tab_index, expected_url, actual_url in validate_url_tab_results:
            pytest.assume(
                actual_url == expected_url,
                f"Tab {tab_index}: Expected URL {expected_url}, but got {actual_url}"
            )

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_visual_on_pc_and_mo.py"
    ]
    pytest.main(pytest_args)