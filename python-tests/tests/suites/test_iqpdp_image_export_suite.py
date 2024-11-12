# python-tests/tests/suites/test_iqpdp_image_export_suite.py
import pytest
import os
import pandas as pd
from tests.base_test import setup_existing_profile_context, apply_cookies_and_navigate
from src.pages.image_export_iqpdpage import ImageExportPage
from src.cores.json_reader import JsonReader
from src.cores.excel_writer import ExcelWriter

# Adjust the relative path to locate the config file correctly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
config_path = os.path.join(project_root, 'common', 'config', 'config.json')
config = JsonReader().read_json(config_path)
urls = config.get("urlList", [])
test_setup = config.get("testSetup", {})

@pytest.mark.parametrize("device_config, url", [
    (test_setup["moDevice"], url) for url in urls
] + [
    (test_setup["pcDevice"], url) for url in urls
])
def test_iqpdp_image_export(device_config, url, setup_existing_profile_context):
    # Use the standard context fixture
    context, logger, browser_manager = setup_existing_profile_context

    try:
        # Apply cookies and navigate to the URL with all cookies pre-set
        page = apply_cookies_and_navigate(context, logger, url)

        # Initialize ImageExportPage for data extraction and export
        logger.info("Initializing ImageExportPage to extract image data and export to Excel")
        image_export_page = ImageExportPage(page, device="mo" if device_config["is_mobile"] else "pc")
        image_export_page.perform_common_actions()

        # Gather all <img> element data from the DOM
        img_data = image_export_page.get_image_data_from_dom()

        # Data validation: Proceed if data is valid; otherwise, skip export
        if not img_data or len(img_data) <= 1:
            pytest.fail("No valid image data found; skipping Excel export.")

        # Export data to Excel
        excel_writer = ExcelWriter()
        filename = excel_writer.write_data_to_excel(
            img_data,
            executed_file_name="test_image_export_suite",
            device_type="mobile" if device_config["is_mobile"] else "desktop"
        )

        # Assertions for export success
        assert filename, "Excel file was not generated."
        assert os.path.isfile(filename), "Failed to save Excel file."
        assert pd.read_excel(filename).shape[0] > 1, "Excel file is empty or only contains headers."

        # Log success
        logger.info(f"Data export to {filename} successful with more than one row.")

    finally:
        # Cleanup handled by the fixture
        pass

# Run tests in parallel with console logging when the script is executed directly
if __name__ == "__main__":
    pytest_args = [
        "-n", "2",  # Run tests in parallel on 2 CPUs
        "-s",  # Disable output capturing to see console logs
        "python-tests/tests/suites/test_iqpdp_image_export_suite.py"
    ]
    pytest.main(pytest_args)
