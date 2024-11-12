# python-tests/src/cores/excel_writer.py
import pandas as pd
from datetime import datetime
import os
import socket
import platform


class ExcelWriter:
    def __init__(self, base_path=None):
        # Determine the project root and set the reports path
        if base_path is None:
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            base_path = os.path.join(root_dir, 'common', 'reports')

        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)

    def generate_filename(self, executed_file_name, device_type):
        computer_name = socket.gethostname() or platform.node()
        process_id = os.getpid()
        timestamp = datetime.now().strftime("%y%m%d_%H%M%S")
        filename = f"{computer_name}_{executed_file_name}_{process_id}_{device_type}_{timestamp}.xlsx"
        return os.path.join(self.base_path, filename)

    def write_data_to_excel(self, data, executed_file_name, device_type):
        # Check if data is valid
        if not data or len(data) <= 1:
            raise ValueError("Invalid or empty data. Skipping Excel export.")

        # Prepare DataFrame
        df = pd.DataFrame(data[1:], columns=data[0])  # Exclude header row for column names
        filename = self.generate_filename(executed_file_name, device_type)

        # Write DataFrame to Excel
        with pd.ExcelWriter(filename, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False)

        print(f"Data successfully exported to {filename}")
        return filename
