# python-tests/tests/conftest.py
import os
import pytest
from fixtures.browser import browser_factory
from src.cores.cache_manager import CacheManager
from src.cores.json_reader import JsonReader
from playwright.sync_api import sync_playwright

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

@pytest.fixture(scope="session")
def browser_factory_fixture(playwright_instance, config):
    context = None  # Initialize context

    def create_browser_context(**kwargs):
        """Create a browser context with specified parameters."""
        nonlocal context
        try:
            context = browser_factory(playwright_instance, config, **kwargs)
            return context
        except Exception as e:
            print(f"Error creating browser context: {e}")
            raise

    yield create_browser_context  # Provide the factory function to the test

    # Teardown: Ensure the context is closed after the test
    try:
        if context is not None:
            print("Closing browser context...")
            context.close()
            print("Browser context closed.")
        else:
            print("No browser context to close.")
    except Exception as e:
        print(f"Error during browser context teardown: {e}")

# @pytest.fixture(scope="session", autouse=True)
# def scheduled_clean_up():
#     yield
#     CacheManager().scheduled_cache_clean_up()  # Clean-up at the end of the session