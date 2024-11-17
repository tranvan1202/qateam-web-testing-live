# python-tests/fixtures/browser.py

import os
from src.cores.browser_manager import BrowserManager
from playwright.sync_api import Playwright, sync_playwright

def browser_factory(
    playwright: Playwright,
    config,
    device_type="pc",
    persistent=True,
    headless=True,
    extensions=False,
    open_devtools=False,
    channel="chrome",
):
    """
    Factory to create a browser context dynamically based on test needs.
    :param playwright: An active Playwright instance.
    :param config: Loaded configuration (e.g., config.json).
    :param device_type: Type of device ("pc" or "mo").
    :param persistent: Whether to use a persistent browser context.
    :param headless: Run the browser in headless mode.
    :param extensions: Enable or disable browser extensions.
    :param open_devtools: Automatically open developer tools.
    :param channel: Browser channel to use (default is "chrome").
    :return: A browser context ready for use.
    """
    device_config_key = f"{device_type}Device"
    if device_config_key not in config["testSetup"]:
        raise ValueError(f"Invalid device type: {device_type}. Check your configuration.")

    device_config = config["testSetup"][device_config_key]

    # Resolve user_data_dir dynamically
    raw_user_data_dir = (
        device_config.get("profileChromePath_PC") if device_type == "pc"
        else device_config.get("profileChromePath_MO")
    )
    if not raw_user_data_dir:
        raise ValueError(f"user_data_dir for {device_type} is missing in config.json")

    user_data_dir = os.path.expandvars(raw_user_data_dir)

    browser_manager = BrowserManager(playwright)
    context = browser_manager.create_context(
        user_data_dir=user_data_dir,
        viewport={"width": device_config["viewport_width"], "height": device_config["viewport_height"]},
        is_mobile=device_config["is_mobile"],
        has_touch=device_config["has_touch"],
        user_agent=device_config.get("user_agent"),
        headless=headless,
        persistent=persistent,
        extensions=extensions,
        open_devtools=open_devtools,
        channel=channel,
    )
    return context
