# python-tests/src/cores/actions.py

import time
import json
import os

import logging
import re
from urllib.parse import urlparse

from playwright.sync_api import Page
import requests


class Actions:
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.config = self._load_config()

    def _load_config(self):
        # Load configuration from config.json with error handling
        try:
            config_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'config', 'config.json'))
            with open(config_path, 'r') as config_file:
                return json.load(config_file)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logging.error(f"Failed to load config.json: {e}")
            return {}

    def analyze_url_and_apply_cookie(self, context, url):
        """
        Analyze the URL and apply cookies dynamically.
        :param context: Playwright BrowserContext.
        :param url: The URL to analyze and apply cookies for.
        """
        try:
            from src.cores.auth_manager import AuthManager
            from src.cores.cookie_manager import configure_cookies_lib, set_cookies_in_context

            auth_manager = AuthManager(self.config)
            url_info = auth_manager.analyze_url(url)
            base_domain = url.split("/")[2]

            cookies = configure_cookies_lib(auth_manager, url_info, base_domain)
            set_cookies_in_context(context, cookies)
            logging.info(f"Cookies applied successfully for URL: {url}")

        except ImportError as e:
            logging.error(f"Failed to import required modules for URL '{url}': {e}")
            raise  # Re-raise the exception to signal failure

        except Exception as e:
            logging.error(f"Error analyzing URL '{url}' or applying cookies: {e}")
            raise  # Re-raise the exception to signal failure

    def scroll_to_bottom(self, step: int = 300, wait_time: float = 0.2, page=None):
        page = page or self.page
        page_height = page.evaluate("() => document.body.scrollHeight")
        scroll_position = 0

        while scroll_position < page_height:
            scroll_position += step
            page.evaluate(f"window.scrollTo(0, {scroll_position})")
            time.sleep(wait_time)
            # Update page height only if lazy-loaded content is expected
            new_page_height = page.evaluate("() => document.body.scrollHeight")
            if new_page_height > page_height:
                page_height = new_page_height

    def scroll_to_top(self, page=None):
        page = page or self.page  # Use the passed page, or default to self.page
        logging.info("Scrolling to the top of the page")
        page.evaluate("window.scrollTo(0, 0)")

    def inject_button_script(self, wait_time: int, page=None):
        page = page or self.page
        logging.info("Injecting button script with countdown timer")
        button_script = f"""
        (function() {{
          var button = document.createElement('button');
          button.id = 'nextStepButton';
          button.style.position = 'fixed';
          button.style.top = '100px';
          button.style.left = '20px';
          button.style.zIndex = '10000';
          button.style.padding = '15px';
          button.style.backgroundColor = '#4CAF50';
          button.style.color = 'white';
          button.style.border = 'none';
          button.style.fontSize = '16px';
          button.style.cursor = 'pointer';
          button.innerText = 'Next step in: ' + {wait_time};
          button.style.maxWidth = '95%'; button.style.wordBreak = 'break-word';
          document.body.appendChild(button);
          var countdown = {wait_time};
          var interval = setInterval(function() {{
            countdown--;
            button.innerText = 'Next step in: ' + countdown;
            if (countdown <= 0) {{
              clearInterval(interval);
              button.click();
            }}
          }}, 1000);
          button.addEventListener('click', function() {{
            clearInterval(interval);
            button.remove();
            window.nextStepTriggered = true;
          }});
        }})();
        """
        page.evaluate(button_script)

    def wait_for_button_trigger_or_timeout(self, device: str, page=None):
        # Use the concise wait time value from configuration based on the device type
        page = page or self.page
        wait_time = self.get_wait_time(device)
        logging.info(f"Waiting for button trigger or timeout of {wait_time} seconds")
        start_time = time.time()
        while (time.time() - start_time) < wait_time:
            next_step_triggered = page.evaluate("() => window.nextStepTriggered || false")
            if next_step_triggered:
                break
            time.sleep(0.5)

    def get_wait_time(self, device: str) -> int:
        # Fetch the wait time based on the device configuration from config.json
        return self.config.get("testSetup", {}).get(f"{device}Device", {}).get("button_waitTime", 1000)

    def wait_and_click_element(
            self,
            locator,
            timeout=2000,
            force_click=True,
            repeat_until_disabled=False,
            max_retries=200,
            interact_all=False,
            page=None
    ):
        """
        Wait for an element (or all matching elements) to become visible and click it/them.

        :param locator: The CSS or XPath selector for the element(s).
        :param timeout: Maximum time to wait for the element (in milliseconds).
        :param force_click: Whether to force the click action.
        :param repeat_until_disabled: If True, continues clicking until the element is disabled.
        :param max_retries: Maximum number of retries for clicking when repeat_until_disabled is True.
        :param interact_all: If True, interacts with all matching elements; otherwise, interacts with the first one.
        :return: True if at least one element was clicked successfully, False otherwise.
        """
        try:
            page = page or self.page
            # Wait for the first element to become visible
            locator.first.wait_for(state="attached", timeout=timeout)
            logging.info(f"Element(s) with locator '{locator}' is/are visible.")

            # Determine the elements to interact with
            elements_to_interact = locator.all() if interact_all else [locator.first]
            clicked_at_least_one = False

            for idx, element in enumerate(elements_to_interact):
                retries = 0
                while True:
                    try:
                        # Check if the element has an href attribute (optional)
                        href = element.get_attribute("href")
                        if href:
                            # Parse the href to check for navigation paths or URLs
                            parsed_href = urlparse(href)

                            # Skip navigation links to prevent redirection
                            if parsed_href.scheme or parsed_href.netloc or parsed_href.path:
                                logging.info(
                                    f"Skipping click on navigational element with href '{href}' to prevent redirection."
                                )
                                break  # Skip this element

                        # Proceed to click the element
                        logging.info(
                            f"Clicking on element {idx + 1} with locator '{locator}' (Attempt {retries + 1})."
                        )
                        element.click(force=force_click)
                        time.sleep(0.5)
                        clicked_at_least_one = True

                        # If not repeating until disabled, exit loop after one click
                        if not repeat_until_disabled:
                            break

                        # Check if the element is disabled
                        is_disabled = element.is_disabled()
                        if is_disabled:
                            logging.info(f"Element {idx + 1} with locator '{locator}' is now disabled.")
                            break

                        # Increment retry counter and check against max_retries
                        retries += 1
                        if retries >= max_retries:
                            logging.warning(
                                f"Maximum retries reached ({max_retries}) for element {idx + 1} with locator '{locator}'."
                            )
                            break

                    except Exception as e:
                        logging.error(f"Error interacting with element {idx + 1} '{locator}': {str(e)}")
                        break

            return clicked_at_least_one

        except Exception as e:
            logging.error(f"Error waiting for elements with locator '{locator}': {str(e)}")
            return False

    def scroll_pages_with_synchronization(self, pages, config):
        """
        Scroll multiple pages from top to bottom while synchronizing at specific element locator milestones.
        :param pages: List of Playwright Page objects to scroll.
        :param config: Configuration dictionary containing scroll speed, scroll distance, and milestones.
        """
        scroll_speed = config.get("scroll_speed", 0.1)  # Default: 0.1 seconds between scrolls
        scroll_distance = config.get("scroll_distance", 300)  # Default: 300 pixels per scroll step
        milestones = config.get("milestones", [])  # List of element locators to synchronize at

        # Scroll to the top of all pages
        for page in pages:
            page.evaluate("window.scrollTo(0, 0)")

        # Determine the maximum scroll height across all pages
        max_scroll_height = max(page.evaluate("document.body.scrollHeight") for page in pages)

        # Scroll pages step by step
        current_scroll_position = 0
        while current_scroll_position < max_scroll_height:
            for page in pages:
                # Scroll down by scroll_distance
                page.evaluate(f"window.scrollBy(0, {scroll_distance})")

            # Wait at milestones if any element matches
            for milestone in milestones:
                for page in pages:
                    if page.locator(milestone).is_visible():
                        # Wait for the milestone element to synchronize
                        print(f"Milestone reached: {milestone}")
                        time.sleep(scroll_speed)

            current_scroll_position += scroll_distance
            time.sleep(scroll_speed)

        print("Scrolling completed for all pages.")

    def check_url_status(self, url):
        """
        Check the HTTP status of a URL.
        :param url: The URL to check.
        :return: The HTTP status code.
        """
        try:
            response = requests.head(url, allow_redirects=True, timeout=5)
            return response.status_code
        except Exception as e:
            print(f"Error checking URL {url}: {e}")
            return None