import requests
import time


class ImagePropertiesExtractor:
    def __init__(self, page):
        self.page = page

    def extract_image_data(self, parent_locator=None):
        """Extract and compile data for all <img> elements."""
        # Step 1: Extract raw image data from the DOM
        img_elements_data = self.extract_image_elements_from_dom(parent_locator)

        # Step 2: Filter valid images
        valid_images = self.filter_valid_images(img_elements_data)

        # Step 3: Collect all src URLs for batch processing
        all_srcs = self.resolve_src_urls(valid_images)

        # Step 4: Batch process connection status and file size
        src_status_map = self.batch_get_connection_status_and_size(all_srcs)

        # Step 5: Compile image data into the final structure
        return self.compile_image_data(valid_images, src_status_map)

    def extract_image_elements_from_dom(self, parent_locator=None):
        """
        Extract raw image data from a specific parent element in the DOM, or the entire DOM if no parent_locator is provided.
        :param parent_locator: The CSS selector of the parent element to search within (default: None, which searches the entire DOM).
        :return: A list of dictionaries containing image attributes and properties.
        """
        if parent_locator:
            js_code = f"""
                () => {{
                    const parentElement = document.querySelector("{parent_locator}");
                    if (!parentElement) return [];

                    return Array.from(parentElement.querySelectorAll('img')).map(img => {{
                        const attributes = Object.fromEntries(
                            Array.from(img.attributes).map(attr => [attr.name, attr.value])
                        );

                        const resolvedSrcs = Object.fromEntries(
                            Object.entries(attributes)
                                .filter(([key]) => key.includes('src'))
                                .map(([key, value]) => [key, new URL(value, document.baseURI).href])
                        );

                        return {{
                            url: document.location.href,
                            resolvedSrcs,
                            attributes,
                            intrinsicWidth: img.naturalWidth,
                            intrinsicHeight: img.naturalHeight,
                            renderedWidth: img.clientWidth,
                            renderedHeight: img.clientHeight
                        }};
                    }});
                }}
            """
        else:
            js_code = """
                () => {
                    return Array.from(document.querySelectorAll('img')).map(img => {
                        const attributes = Object.fromEntries(
                            Array.from(img.attributes).map(attr => [attr.name, attr.value])
                        );

                        const resolvedSrcs = Object.fromEntries(
                            Object.entries(attributes)
                                .filter(([key]) => key.includes('src'))
                                .map(([key, value]) => [key, new URL(value, document.baseURI).href])
                        );

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
                }
            """

        return self.page.evaluate(js_code)

    def filter_valid_images(self, img_elements_data):
        """Filter images with valid intrinsic dimensions."""
        return [
            img_info for img_info in img_elements_data
            if img_info['intrinsicWidth'] > 0 or img_info['intrinsicHeight'] > 0
        ]

    def resolve_src_urls(self, valid_images):
        """Collect all src URLs from valid images."""
        return {src_url for img_info in valid_images for src_url in img_info['resolvedSrcs'].values()}

    def compile_image_data(self, valid_images, src_status_map):
        """Compile the final image data into a structured format."""
        img_data = [
            ["URL", "Image Src", "Connection Status", "Intrinsic Size", "Rendered Size", "File Size", "Alt Text"]]

        for img_info in valid_images:
            intrinsic_size = f"{img_info['intrinsicWidth']}x{img_info['intrinsicHeight']}"
            rendered_size = f"{img_info['renderedWidth']}x{img_info['renderedHeight']}"
            alt_values = [value for key, value in img_info['attributes'].items() if 'alt' in key]

            for src_url in img_info['resolvedSrcs'].values():
                connection_status, file_size = src_status_map.get(src_url, ("N/A", "N/A"))
                img_data.append([
                    img_info["url"],
                    src_url,
                    connection_status,
                    intrinsic_size,
                    rendered_size,
                    file_size,
                    ", ".join(alt_values)
                ])

        return img_data

    def batch_get_connection_status_and_size(self, src_urls, retries=3, delay=1):
        """
        Efficiently check connection status and file size for multiple image URLs.
        """
        session = requests.Session()

        try:
            # Extract cookies from the Playwright session
            cookies = self.page.context.cookies()

            # Add cookies to the session with proper domain handling
            for cookie in cookies:
                session.cookies.set(cookie['name'], cookie['value'], domain=cookie['domain'])

            # Get the User-Agent from the page context
            user_agent = self.page.evaluate("() => navigator.userAgent")

            headers = {
                "User-Agent": user_agent
            }
        except Exception as e:
            print(f"Failed to extract cookies or User-Agent: {e}")
            headers = {}

        src_status_map = {}

        for src_url in src_urls:
            retry_delay = delay
            for attempt in range(retries):
                try:
                    # Send a GET request to the URL with cookies and User-Agent
                    response = session.get(src_url, headers=headers, stream=True, timeout=5)

                    # Retrieve connection status
                    connection_status = response.status_code

                    # Retrieve file size from headers
                    file_size = response.headers.get("Content-Length")
                    if file_size is None:
                        # Calculate file size if not provided
                        file_size = sum(len(chunk) for chunk in response.iter_content(8192))

                    # Save results and break retry loop
                    src_status_map[src_url] = (connection_status, file_size)
                    time.sleep(0.5)
                    break
                except requests.RequestException as e:
                    print(f"Attempt {attempt + 1} failed for {src_url}: {e}")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
            else:
                # Mark as "N/A" after exhausting retries
                src_status_map[src_url] = ("N/A", "N/A")

        return src_status_map
