import pytest
from playwright.sync_api import sync_playwright
import time

# List of URLs to test
URLS = ["https://www.samsung.com/my/business/washers-and-dryers/washing-machines/wa5000c-top-load-ecobubble-digital-inverter-technology-super-speed-wa13cg5745bvfq/",
    "https://www.samsung.com/my/watches/galaxy-watch/galaxy-watch-ultra-titanium-gray-lte-sm-l705fdaaxme/buy/",
    "https://www.samsung.com/my/tablets/galaxy-tab-s10/buy/"]

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        yield p.chromium  # Return the browser to create persistent contexts as needed

@pytest.fixture(scope="session")
def persistent_contexts(browser):
    # Create 2 persistent contexts with separate user_data_dir
    context1 = browser.launch_persistent_context(user_data_dir="%LOCALAPPDATA%/Google/Chrome/User Data/Profile 4", headless=False)
    context2 = browser.launch_persistent_context(user_data_dir="%LOCALAPPDATA%/Google/Chrome/User Data/Profile 9", headless=False)

    yield context1, context2

    # Close contexts and delete user data directories after the test
    context1.close()
    context2.close()

def scroll_page(page):
    # Scroll page from top to bottom
    page.evaluate("""() => {
        window.scrollTo(0, document.body.scrollHeight);
    }""")

def test_open_url_and_scroll_in_persistent_contexts(persistent_contexts):
    context1, context2 = persistent_contexts
    errors = []  # List to store any errors encountered

    # Iterate over each URL and open in both contexts
    for url in URLS:
        try:
            page1 = context1.new_page()
            page2 = context2.new_page()

            # Navigate to the URL in both contexts
            page1.goto(url)
            page2.goto(url)

            # Perform actions on both contexts, e.g., scroll from top to bottom
            scroll_page(page1)
            scroll_page(page2)

            # Optionally, wait to observe the scroll effect
            time.sleep(2)

            # Verify URL and title to ensure correct page loaded
            assert page1.url == url, f"URL mismatch on context1 for {url}"
            assert page2.url == url, f"URL mismatch on context2 for {url}"
            assert page1.title() == page2.title(), f"Title mismatch for {url}"

        except AssertionError as e:
            # Record the error but continue with the next URL
            errors.append(str(e))

        finally:
            # Close pages for the current URL
            page1.close()
            page2.close()

    # If there are any errors, raise an AssertionError with all collected errors
    if errors:
        raise AssertionError("Errors occurred:\n" + "\n".join(errors))