# python-tests/src/cores/actions.py

import time
import json
import os
from playwright.sync_api import Page

class Actions:
    def __init__(self, page: Page, device: str):
        self.page = page
        self.device = device
        self.config = self._load_config()
        self.locators = self._load_locators()

    def _load_config(self):
        # Load configuration from config.json
        config_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'config', 'config.json'))
        with open(config_path, 'r') as config_file:
            return json.load(config_file)

    def _load_locators(self):
        # Load locators from locators.json
        locators_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common', 'config', 'locators.json'))
        with open(locators_path, 'r') as locators_file:
            return json.load(locators_file)

    def click_js_declared_elements(self, jsonValues):
        # Click all elements with class names declared in locators.json
        class_names = self.locators.get(jsonValues, [])
        # Click all elements with class names declared
        for class_name in class_names:
            elements = self.page.locator(f".{class_name}")
            for element in elements.all():
                if element.is_visible():
                    element.click(force=True)

    def doubleclick_js_declared_elements(self, jsonValues):
        # Click all elements with class names declared in locators.json
        class_names = self.locators.get(jsonValues, [])
        # Click all elements with class names declared
        for class_name in class_names:
            elements = self.page.locator(f".{class_name}")
            for element in elements.all():
                if element.is_visible():
                    element.dblclick(force=True)

    def scroll_to_bottom(self, step: int = 300, wait_time: float = 0.2):
        page_height = self.page.evaluate("() => document.body.scrollHeight")
        scroll_position = 0
        while scroll_position < page_height:
            scroll_position += step
            self.page.evaluate(f"window.scrollTo(0, {scroll_position})")
            time.sleep(wait_time)
            page_height = self.page.evaluate("() => document.body.scrollHeight")

    def scroll_to_top(self):
        self.page.evaluate("window.scrollTo(0, 0)")

    def inject_button_script(self, wait_time: int):
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
        start_time = time.time()
        while (time.time() - start_time) < wait_time:
            next_step_triggered = self.page.evaluate("() => window.nextStepTriggered || false")
            if next_step_triggered:
                break
            time.sleep(0.5)

    def get_wait_time(self, device: str) -> int:
        # Fetch the wait time based on the device configuration from config.json
        return self.config.get("testSetup", {}).get(f"{device}Device", {}).get("button_waitTime", 1000)