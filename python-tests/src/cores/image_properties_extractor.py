import requests
import time

class ImagePropertiesExtractor:
    def __init__(self, page):
        self.page = page

    def extract_image_data(self):
        """Efficiently gather all <img> element data from the DOM dynamically."""
        # Evaluate all <img> elements and return their attributes
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

        # Pre-filter valid images
        valid_images = [
            img_info
            for img_info in img_elements_data
            if img_info['intrinsicWidth'] > 0 or img_info['intrinsicHeight'] > 0
        ]

        # Collect all src URLs for batch processing
        all_srcs = {src_url for img_info in valid_images for src_url in img_info['resolvedSrcs'].values()}

        # Batch process connection status and file size
        src_status_map = self.batch_get_connection_status_and_size(all_srcs)

        # Compile image data
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
        :param src_urls: List of image src URLs to process.
        :param retries: Number of retry attempts for failed requests.
        :param delay: Initial delay between retries (in seconds).
        :return: A dictionary mapping src_url to (connection_status, file_size).
        """
        session = requests.Session()

        # Extract cookies from the Playwright session
        cookies = self.page.context.cookies()
        cookie_header = '; '.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
        headers = {"Cookie": cookie_header}

        src_status_map = {}

        for src_url in src_urls:
            retry_delay = delay
            for attempt in range(retries):
                try:
                    # Use a short timeout to handle slow responses
                    response = session.get(src_url, headers=headers, stream=True, timeout=5)
                    connection_status = response.status_code
                    file_size = response.headers.get("Content-Length")

                    # Calculate file size if not provided
                    if file_size is None:
                        file_size = sum(len(chunk) for chunk in response.iter_content(8192))

                    # Save results and break retry loop
                    src_status_map[src_url] = (connection_status, file_size)
                    break
                except requests.RequestException as e:
                    print(f"Attempt {attempt + 1} failed for {src_url}: {e}")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
            else:
                # Mark as "N/A" after exhausting retries
                src_status_map[src_url] = ("N/A", "N/A")

        return src_status_map