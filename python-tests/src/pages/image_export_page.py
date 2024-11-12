from src.pages.base_page import BasePage
import requests

class ImageExportPage(BasePage):

    def get_image_data_from_dom(self):
        """Gather all <img> element data from the DOM dynamically."""
        # Use JavaScript to get all attributes of each <img> element in the DOM
        img_elements_data = self.page.evaluate("""
            () => Array.from(document.querySelectorAll('img')).map(img => {
                const attributes = {};
                for (const attr of img.attributes) {
                    attributes[attr.name] = attr.value;
                }
                return {
                    url: document.location.href,
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
            # Separate all src and alt attribute values
            src_values = [value for key, value in img_info['attributes'].items() if 'src' in key]
            alt_values = [value for key, value in img_info['attributes'].items() if 'alt' in key]

            # Check connection status and file size for each src value
            for src in src_values:
                connection_status, file_size = self.get_connection_status_and_size(src)

                # Intrinsic and rendered sizes
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

    def get_connection_status_and_size(self, src_url):
        """Check connection status and file size of the given image src."""
        if not src_url.startswith("http"):
            # Convert relative URLs to absolute
            src_url = self.page.url.rstrip("/") + "/" + src_url.lstrip("/")

        try:
            response = requests.get(src_url, stream=True)
            connection_status = response.status_code

            # Get Content-Length header if available, otherwise calculate from response content
            file_size = response.headers.get("Content-Length")
            if file_size is None:
                # If Content-Length is missing, calculate the file size by downloading the content
                file_size = sum(len(chunk) for chunk in response.iter_content(8192))

        except requests.RequestException:
            connection_status = "N/A"
            file_size = "N/A"

        return connection_status, file_size
