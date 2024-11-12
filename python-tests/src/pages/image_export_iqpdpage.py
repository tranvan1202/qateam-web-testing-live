# python-tests/src/pages/image_export_iqpdpage.py
from src.pages.iq_pdpage import IQPDPage
import requests
import time

class ImageExportPage(IQPDPage):

    def get_image_data_from_dom(self):
        """Gather all <img> element data from the DOM dynamically."""
        # Use JavaScript to get all attributes of each <img> element and resolve URLs
        img_elements_data = self.page.evaluate("""
            () => Array.from(document.querySelectorAll('img')).map(img => {
                const attributes = {};
                for (const attr of img.attributes) {
                    attributes[attr.name] = attr.value;
                }

                // Resolve each 'src' attribute to its absolute URL
                const resolvedSrcs = {};
                Object.keys(attributes).forEach(key => {
                    if (key.includes('src')) {
                        resolvedSrcs[key] = new URL(attributes[key], document.baseURI).href;
                    }
                });

                return {
                    url: document.location.href,
                    resolvedSrcs,
                    attributes,
                    intrinsicWidth: img.naturalWidth,
                    intrinsicHeight: img.naturalHeight,
                    renderedWidth: img.clientWidth,
                    renderedHeight: img.clientHeight
                };
            });
        """)

        img_data = [["URL", "Image Src", "Connection Status", "Intrinsic Size", "Rendered Size", "File Size", "Alt Text"]]

        for img_info in img_elements_data:
            # Filter out images with both intrinsic and rendered sizes of 0x0
            if img_info['intrinsicWidth'] == 0 and img_info['intrinsicHeight'] == 0 and img_info['renderedWidth'] == 0 and img_info['renderedHeight'] == 0:
                continue

            # Separate resolved src URLs and alt values
            src_values = list(img_info['resolvedSrcs'].values())
            alt_values = [value for key, value in img_info['attributes'].items() if 'alt' in key]

            # Check connection status and file size for each resolved src value
            for src in src_values:
                connection_status, file_size = self.get_connection_status_and_size(src)

                # Intrinsic and rendered sizes from the DOM directly
                intrinsic_size = f"{img_info['intrinsicWidth']}x{img_info['intrinsicHeight']}"
                rendered_size = f"{img_info['renderedWidth']}x{img_info['renderedHeight']}"

                # Append data row to img_data list
                img_data.append([
                    img_info["url"],
                    src,
                    connection_status,
                    intrinsic_size,
                    rendered_size,
                    file_size,
                    ", ".join(alt_values)  # Join multiple alt values if they exist
                ])

        return img_data

    def get_connection_status_and_size(self, src_url, retries=3, delay=1):
        """Check connection status and file size of the given image src, with retry logic and authentication."""
        # Extract cookies from the Playwright session
        cookies = self.page.context.cookies()
        cookie_header = '; '.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])

        headers = {
            "Cookie": cookie_header
        }

        for attempt in range(retries):
            try:
                # Pass the cookies with the request for authorized access
                response = requests.get(src_url, headers=headers, stream=True)
                connection_status = response.status_code

                # Get Content-Length header if available; otherwise calculate file size
                file_size = response.headers.get("Content-Length")
                if file_size is None:
                    file_size = sum(len(chunk) for chunk in response.iter_content(8192))

                # Return successful result
                return connection_status, file_size

            except requests.RequestException as e:
                # If an exception occurs, wait and retry
                print(f"Attempt {attempt + 1} failed for {src_url}: {e}")
                time.sleep(delay)
                continue

        # If all attempts fail, return "N/A" values
        return "N/A", "N/A"
