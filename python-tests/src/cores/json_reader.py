# python-tests/src/cores/json_reader.py

import json
import os

class JsonReader:
    @staticmethod
    def read_json(file_path: str):
        abs_path = os.path.abspath(file_path)
        try:
            with open(abs_path, 'r') as json_file:
                return json.load(json_file)
        except FileNotFoundError:
            raise FileNotFoundError(f"The configuration file at {abs_path} was not found.")
        except json.JSONDecodeError:
            raise ValueError(f"The configuration file at {abs_path} could not be parsed.")