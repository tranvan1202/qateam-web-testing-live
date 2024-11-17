# python-tests/tests/suites/test_page_access_manual_check_suite.py

import pytest
import os
from tests.base_test_bk import setup_existing_profile_with_extensions_context, apply_cookies_and_navigate
from src.pages.manual_check_page import ManualCheckPage
from src.cores.json_reader import JsonReader

# Adjust the relative path to locate the config file correctly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
config_path = os.path.join(project_root, 'common', 'config', 'config.json')
config = JsonReader().read_json(config_path)
urls = config.get("urlList", [])
test_setup = config.get("testSetup", {})

@pytest.mark.parametrize("device_config, url", [
    (test_setup["moDevice"], url) for url in urls
] + [
    (test_setup["pcDevice"], url) for url in urls
])
def test_page_access_with_manual_check(device_config, url, setup_existing_profile_with_extensions_context):
    # Use the fixture-provided context, logger, and browser manager
    context, logger, browser_manager = setup_existing_profile_with_extensions_context

    # Apply cookies and navigate to the URL with all cookies pre-set
    page = apply_cookies_and_navigate(context, logger, url)

    # Initialize BasePage to perform page-specific actions after navigation
    logger.info("Initializing BasePage to perform common actions")
    manual_check_page = ManualCheckPage(page, device="mo" if device_config["is_mobile"] else "pc")
    manual_check_page.perform_common_actions()
    logger.info(f"Completed actions for {url} on {'mobile' if device_config['is_mobile'] else 'desktop'}")

    # Example assertion to verify successful navigation
    assert page.url == url, f"Expected URL: {url}, but got: {page.url}"

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_page_access_manual_check_suite.py"
    ]
    pytest.main(pytest_args)