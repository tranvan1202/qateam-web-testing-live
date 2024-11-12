from urllib.parse import urlparse
import json
import io
import os
import time

class HarParser:
    def __init__(self, har_file_path):
        self.har_file_path = har_file_path
        self.base_url = None

    def extract_image_data(self):
        # Check if HAR file exists and has content
        if not os.path.exists(self.har_file_path) or os.path.getsize(self.har_file_path) == 0:
            raise Exception(f"HAR file is empty or missing: {self.har_file_path}")

        # Retry reading the file if it's in the process of being written
        retries = 3
        for _ in range(retries):
            try:
                # Open HAR file with 'utf-8' encoding and error handling
                with io.open(self.har_file_path, 'r', encoding='utf-8', errors='replace') as har_file:
                    har_data = json.load(har_file)
                break  # Exit loop if successful
            except json.JSONDecodeError as e:
                # Wait a moment and retry if JSON loading fails
                time.sleep(0.5)
        else:
            raise Exception(f"Failed to parse JSON in HAR file {self.har_file_path}: JSON data could not be read.")

        image_data = []

        # Retrieve base URL from the first entry
        if har_data['log']['entries']:
            first_url = har_data['log']['entries'][0]['request']['url']
            self.base_url = '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(first_url))

        # Traverse through entries to find image requests
        for entry in har_data['log']['entries']:
            request_url = entry['request']['url']
            mime_type = entry['response']['content'].get('mimeType', '')

            # Filter for image MIME types
            if mime_type.startswith('image'):
                parsed_url = urlparse(request_url)
                relative_path = parsed_url.path  # Only the path part, without domain

                image_info = {
                    "image_path_absolute": request_url,
                    "image_path_relative": relative_path,
                    "connection_status": entry['response']['status'],
                    "content_length": entry['response']['content'].get('size', 0)
                }
                image_data.append(image_info)

        return {
            "image_paths": {
                "absolute": [item["image_path_absolute"] for item in image_data],
                "relative": [item["image_path_relative"] for item in image_data]
            },
            "image_details": image_data
        }
