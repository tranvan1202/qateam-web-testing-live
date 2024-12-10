# python-tests/tests/suites/test_standard_smoke_check_suite.py
import pytest
from src.cores.page_factory import PageFactory
from tqdm import tqdm
import logging

# Cấu hình logging tích hợp với tqdm
class TqdmLoggingHandler(logging.Handler):
    def emit(self, record):
        msg = self.format(record)
        tqdm.write(msg)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        TqdmLoggingHandler(),  # Tích hợp tqdm
        logging.StreamHandler()  # Ghi trực tiếp ra console
    ]
)

logger = logging.getLogger()

URLS_TO_TEST = [
    "https://samsung.com/sg/offer/"
]
domain = "ss"
page_type = "normal_pdp"


@pytest.mark.parametrize(
    "device_type", ["pc", "mo"], ids=["device_pc", "device_mo"]
)
def test_standard_smoke(browser_factory_fixture, device_type):
    """Test page accessibility with multiple tabs and common actions."""

    logger.info("Creating browser context...")
    context = browser_factory_fixture(
        device_type=device_type,
        persistent=False,
        headless=False,
        extensions=False,
        open_devtools=True
    )
    logger.info("Browser context created.")

    page = context.pages[0] if context.pages else context.new_page()
    page_object = PageFactory.create_page(domain, page_type, page, device=device_type)

    progress_bar = tqdm(total=len(URLS_TO_TEST), desc="Testing URLs", unit="url")
    test_results = []

    for url in URLS_TO_TEST:
        try:
            progress_bar.set_description(f"Testing {url}")
            page_object.open_tabs_and_perform_actions(
                context,
                urls=[url],
                max_tabs=1,
                action_flags={"is_smoke_test": True}
            )
            progress_bar.update(1)
            test_results.append((url, "Pass"))
            logger.info(f"[PASS] URL: {url}")

        except Exception as e:
            progress_bar.update(1)
            test_results.append((url, "Fail"))
            logger.error(f"[FAIL] URL: {url} - Error: {e}")

    progress_bar.close()
    logger.info("Smoke Test Results:")
    for url, result in test_results:
        logger.info(f"URL: {url}, Status: {result}")

    assert all(result == "Pass" for _, result in test_results), "One or more URLs failed the smoke test!"

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",       # Disable output capturing to see console logs
        "python-tests/tests/suites/test_standard_smoke_check_suite.py"
    ]
    pytest.main(pytest_args)


