# python-tests/tests/conftest.py

import pytest
from fixtures.browser import browser_factory
from src.cores.json_reader import JsonReader
from playwright.sync_api import sync_playwright
import os

@pytest.fixture(scope="session")
def config():
    """Load global configuration from config.json."""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    config_path = os.path.join(root_dir, 'common', 'config', 'config.json')
    return JsonReader().read_json(config_path)


@pytest.fixture(scope="session")
def playwright_instance():
    """Provide a Playwright instance for the entire test session."""
    with sync_playwright() as playwright:
        yield playwright


@pytest.fixture(scope="function")
def browser_factory_fixture(playwright_instance, config):
    """
    Provide a browser factory for dynamic context creation.
    :param playwright_instance: An active Playwright instance.
    :param config: Global test configuration.
    :return: A factory function for creating browser contexts.
    """
    return lambda **kwargs: browser_factory(playwright_instance, config, **kwargs)


@pytest.fixture(scope="function")
def analyze_url_and_apply_cookie(config):
    """
    Fixture to analyze URL and apply cookies dynamically.
    If the auth_manager or cookie_manager modules are unavailable,
    this fixture gracefully falls back to a no-op function.
    """
    try:
        from src.cores.auth_manager import AuthManager
        from src.cores.cookie_manager import configure_cookies, set_cookies_in_context
    except ImportError:
        print("auth_manager or cookie_manager not found. Cookie application will be skipped.")
        return lambda context, url: None

    def _apply_cookies(context, url):
        auth_manager = AuthManager(config)
        url_info = auth_manager.analyze_url(url)
        base_domain = url.split("/")[2]

        # Configure and set cookies in the browser context
        cookies = configure_cookies(auth_manager, url_info, base_domain)
        set_cookies_in_context(context, cookies)

    return _apply_cookies
