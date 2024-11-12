import os
import pytest
import sys
import tempfile
import shutil
from playwright.sync_api import sync_playwright
from src.cores.json_reader import JsonReader
from src.cores.browser_manager import BrowserManager
from src.cores.auth_manager import AuthManager
from src.cores.logger import setup_logger
from src.cores.cookie_manager import configure_cookies, set_cookies_in_context

# Determine the project root directory dynamically
current_dir = os.path.dirname(__file__)
root_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))
src_path = os.path.join(root_dir, 'python-tests', 'src')
sys.path.append(src_path)

# Load configurations once for parameterization
config = JsonReader().read_json(os.path.join(root_dir, 'common', 'config', 'config.json'))
urls = config.get("urlList", [])
test_setup = config.get("testSetup", {})


def _initialize_logger(request):
    """Helper function to initialize a logger for the test."""
    script_name = os.path.splitext(os.path.basename(request.module.__file__))[0]
    computer_name = os.getenv("COMPUTERNAME", "default_computer")
    return setup_logger(computer_name, script_name)


def _get_device_config(device_config):
    """Extract device configuration settings."""
    user_data_dir = os.path.expandvars(
        device_config["profileChromePath_MO"] if device_config["is_mobile"] else device_config["profileChromePath_PC"]
    )
    viewport = {
        "width": device_config["viewport_width"],
        "height": device_config["viewport_height"]
    }
    is_mobile = device_config["is_mobile"]
    has_touch = device_config["has_touch"]
    user_agent = device_config["user_agent"]

    return user_data_dir, viewport, is_mobile, has_touch, user_agent


@pytest.fixture(scope="function")
def setup_existing_profile_extensions_context(device_config, request):
    """Setup browser context with user profile and extensions, without HAR recording."""
    user_data_dir, viewport, is_mobile, has_touch, user_agent = _get_device_config(device_config)
    logger = _initialize_logger(request)

    with sync_playwright() as playwright:
        browser_manager = BrowserManager(playwright)
        context = browser_manager.create_existing_profile_extensions_context(
            user_data_dir=user_data_dir,
            viewport=viewport,
            is_mobile=is_mobile,
            has_touch=has_touch,
            user_agent=user_agent
        )

        yield context, logger, browser_manager

        # Teardown: close context
        logger.info("Closing browser context")
        browser_manager.close_context(context)
        logger.info("Browser context closed")


@pytest.fixture(scope="function")
def setup_existing_profile_extensions_context_har(device_config, request):
    """Setup browser context with HAR recording, user profile, and extensions."""
    user_data_dir, viewport, is_mobile, has_touch, user_agent = _get_device_config(device_config)
    logger = _initialize_logger(request)

    # Create a temporary directory for HAR files
    temp_dir = tempfile.mkdtemp()
    har_file_path = os.path.join(temp_dir, "network_capture.har")

    with sync_playwright() as playwright:
        browser_manager = BrowserManager(playwright)
        context = browser_manager.create_existing_profile_extensions_context_har(
            har_file_path=har_file_path,
            user_data_dir=user_data_dir,
            viewport=viewport,
            is_mobile=is_mobile,
            has_touch=has_touch,
            user_agent=user_agent
        )

        yield context, logger, browser_manager, har_file_path

        # Teardown: close context and clean up HAR files
        logger.info("Closing HAR-enabled browser context")
        browser_manager.close_context(context)
        shutil.rmtree(temp_dir)
        logger.info("HAR directory removed and context closed")


def apply_cookies_and_navigate(context, logger, url):
    """Analyze URL, configure cookies, and navigate to URL with cookies applied."""
    auth_manager = AuthManager(config)
    url_info = auth_manager.analyze_url(url)

    # Configure and set cookies in the browser context
    base_domain = url.split("/")[2]
    cookies = configure_cookies(auth_manager, url_info, base_domain)
    set_cookies_in_context(context, cookies)

    # Navigate to the URL
    page = context.pages[0] if context.pages else context.new_page()
    logger.info(f"Navigating to URL with all cookies pre-set: {url}")
    page.goto(url, timeout=60000)
    return page
