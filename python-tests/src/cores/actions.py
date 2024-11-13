# python-tests/src/cores/actions.py

import time
import json
import os
import logging
from urllib.parse import urlparse

from playwright.sync_api import Page

class Actions:
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.config = self._load_config()
        self.locators = self._load_locators()

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

    def _load_locators(self):
        # Load locators from locators.json with error handling
        try:
            locators_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'config', 'locators.json'))
            with open(locators_path, 'r') as locators_file:
                return json.load(locators_file)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logging.error(f"Failed to load locators.json: {e}")
            return {}

    from urllib.parse import urlparse

    def click_js_declared_elements(self, jsonValues, force_click=True):
        # Get the list of class names from locators.json
        class_names = self.locators.get(jsonValues, [])

        for class_name in class_names:
            elements = self.page.locator(f".{class_name}")

            for element in elements.all():
                # Check if the element is visible
                if element.is_visible():
                    # Check if the element has a href attribute
                    href = element.get_attribute("href")

                    if href:
                        # Parse the href to check for navigation paths or URLs
                        parsed_href = urlparse(href)

                        # Determine if it's a navigation link by checking for scheme, netloc, or path
                        if parsed_href.scheme or parsed_href.netloc or parsed_href.path:
                            logging.info(
                                f"Skipping click on navigational element with href '{href}' to prevent redirection.")
                            continue  # Skip if href contains a URL or relative path

                    # Otherwise, proceed to click the element
                    logging.info(f"Clicking on element with class {class_name}")
                    element.click(force=force_click)

    def scroll_to_bottom(self, step: int = 300, wait_time: float = 0.2):
        page_height = self.page.evaluate("() => document.body.scrollHeight")
        scroll_position = 0
        while scroll_position < page_height:
            scroll_position += step
            self.page.evaluate(f"window.scrollTo(0, {scroll_position})")
            time.sleep(wait_time)
            # Update page height only if lazy-loaded content is expected
            if self.page.evaluate("() => document.body.scrollHeight") > page_height:
                page_height = self.page.evaluate("() => document.body.scrollHeight")

    def scroll_to_top(self):
        logging.info("Scrolling to the top of the page")
        self.page.evaluate("window.scrollTo(0, 0)")

    def inject_button_script(self, wait_time: int):
        logging.info("Injecting button script with countdown timer")
        button_script = f"""
        (function() {{
          var button = document.createElement('button');
          button.id = 'nextStepButton';
          button.style.position = 'fixed';
          button.style.top = '20px';
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
        self.page.evaluate(button_script)

    def wait_for_button_trigger_or_timeout(self, device: str):
        # Use the concise wait time value from configuration based on the device type
        wait_time = self.get_wait_time(device)
        logging.info(f"Waiting for button trigger or timeout of {wait_time} seconds")
        start_time = time.time()
        while (time.time() - start_time) < wait_time:
            next_step_triggered = self.page.evaluate("() => window.nextStepTriggered || false")
            if next_step_triggered:
                break
            time.sleep(0.5)

    def get_wait_time(self, device: str) -> int:
        # Fetch the wait time based on the device configuration from config.json
        return self.config.get("testSetup", {}).get(f"{device}Device", {}).get("button_waitTime", 1000)
