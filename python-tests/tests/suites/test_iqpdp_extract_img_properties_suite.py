# python-tests/tests/suites/test_iqpdp_extract_img_properties_suite.py
import os
import pytest
from src.cores.page_factory import PageFactory

# Define URL list directly in the test suite
URLS_TO_TEST = [
    "https://www.samsung.com/my/business/washers-and-dryers/washing-machines/wa5000c-top-load-ecobubble-digital-inverter-technology-super-speed-wa13cg5745bvfq/",
    "https://www.samsung.com/vn/watches/galaxy-fit/galaxy-fit3-dark-gray-bluetooth-sm-r390nzaaxxv/"
]
domain = "ss"
page_type = "normal_pdp"
max_tabs = 10  # If >1, treat as multiple tabs

@pytest.mark.parametrize(
    "device_type",
    ["pc", "mo"],
    ids=["device_pc", "device_mo"]
)
def test_extract_img_properties(browser_factory_fixture, device_type):
    """
    Test extracting image properties from multiple tabs.
    """
    try:
        print("Creating browser context...")
        context = browser_factory_fixture(
            device_type=device_type,
            persistent=False,
            headless=False,
            extensions=False
        )
        print("Browser context created.")

        # Initialize IQPDPage
        page = context.pages[0] if context.pages else context.new_page()
        page_object = PageFactory.create_page(domain, page_type, page, device=device_type)

        # Navigate to URLs, perform actions, and collect results
        collected_results = page_object.open_tabs_and_perform_actions(
            context,
            urls=URLS_TO_TEST,
            max_tabs=max_tabs,
            action_flags={"extract_image_properties_to_excel": True}
        )

    finally:
        # Perform assertions on collected results before closing the context
        if collected_results:
            missing_files = validate_results(collected_results)

            if missing_files:
                fail_test(missing_files)

def validate_results(collected_results):
    """
    Validate navigated URLs and exported files.
    :param collected_results: Results from the `navigate_and_collect_images` method.
    :return: Two lists - failed URLs and missing files.
    """
    missing_files = []

    # Ensure results are matched correctly
    for actual_url, filename in collected_results:
        # Validate exported files
        if filename is None or not os.path.isfile(os.path.abspath(filename)):
            missing_files.append(f"Missing file for URL: {actual_url}")
        else:
            print(f"File {filename} exists and passed validation.")

    return missing_files

def fail_test(missing_files):
    """
    Fail the test if there are any invalid URLs or missing files.
    :param missing_files: List of missing or invalid files.
    """
    error_messages = []
    if missing_files:
        error_messages.append("The following files were not generated or are invalid:\n" + "\n".join(missing_files))

    pytest.fail("\n\n".join(error_messages))

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",  # Disable output capturing to see console logs
        "python-tests/tests/suites/test_iqpdp_extract_img_properties_suite.py"
    ]
    pytest.main(pytest_args)
