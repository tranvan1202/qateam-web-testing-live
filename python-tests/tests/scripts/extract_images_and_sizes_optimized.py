import json
from playwright.sync_api import sync_playwright
from urllib.parse import urljoin


def navigate_and_record_har(page, url):
    """ Điều hướng tới URL và ghi lại HAR file """
    page.goto(url, wait_until="networkidle")

    # Cuộn trang để kích hoạt lazy load (nếu có)
    page.evaluate("""
        () => {
            window.scrollTo(0, 0);
            let scrollHeight = document.body.scrollHeight;
            let currentPosition = 0;

            while (currentPosition < scrollHeight) {
                currentPosition += window.innerHeight / 2;
                window.scrollTo(0, currentPosition);
            }
        }
    """)
    page.wait_for_timeout(2000)  # Chờ để đảm bảo hình ảnh lazy-loaded đã tải


def extract_images_from_har(har_path):
    """ Phân tích HAR file để lấy các URL của hình ảnh """
    with open(har_path, 'r', encoding='utf-8') as har_file:
        har_data = json.load(har_file)

    image_urls = []

    # Phân tích HAR file để lấy thông tin các yêu cầu hình ảnh
    for entry in har_data['log']['entries']:
        request = entry['request']
        url = request['url']
        mime_type = entry['response']['content'].get('mimeType', '')

        # Kiểm tra nếu MIME type là hình ảnh hoặc đuôi URL là định dạng hình ảnh phổ biến
        if mime_type.startswith('image/') or url.lower().endswith(
                ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg')):
            image_urls.append(url)

    return image_urls


def normalize_url(url, page_url):
    """ Chuyển đổi URL tương đối thành URL tuyệt đối """
    if url.startswith('//'):
        return 'https:' + url
    elif url.startswith('/'):
        return urljoin(page_url, url)
    elif not url.startswith('http'):
        return 'https://' + url
    return url


def get_image_sizes_from_dom(page, image_urls, base_url):
    """ Lấy Rendered Size và Intrinsic Size của các hình ảnh từ DOM """
    image_size_results = []

    # Normalizing các URL hình ảnh
    normalized_image_urls = [normalize_url(image_url, base_url) for image_url in image_urls]

    for image_url in normalized_image_urls:
        try:
            # Tìm tất cả phần tử hình ảnh
            img_elements = page.query_selector_all("img")

            for img_element in img_elements:
                # Lấy tất cả các thuộc tính có chứa từ "src" (bao gồm src, data-src, srcset,...)
                attributes = img_element.evaluate("""
                    (img) => Array.from(img.attributes)
                                .filter(attr => attr.name.includes('src'))
                                .map(attr => ({ name: attr.name, value: img.getAttribute(attr.name) }))
                """)

                # Kiểm tra nếu thuộc tính nào khớp với URL
                matched = False
                for attr in attributes:
                    normalized_attr_value = normalize_url(attr['value'], base_url)
                    if image_url == normalized_attr_value:
                        matched = True
                        break

                if matched:
                    # Lấy kích thước hiển thị và kích thước gốc của hình ảnh
                    rendered_width = img_element.evaluate("img => img.width")
                    rendered_height = img_element.evaluate("img => img.height")
                    intrinsic_width = img_element.evaluate("img => img.naturalWidth")
                    intrinsic_height = img_element.evaluate("img => img.naturalHeight")

                    image_size_results.append({
                        "url": image_url,
                        "rendered_size": (rendered_width, rendered_height),
                        "intrinsic_size": (intrinsic_width, intrinsic_height)
                    })
        except Exception as e:
            print(f"Không thể lấy kích thước cho hình ảnh URL: {image_url}. Lỗi: {e}")

    return image_size_results


if __name__ == "__main__":
    url_to_test = "https://www.samsung.com/sg/offer/"
    har_file_path = "network_data.har"

    with sync_playwright() as p:
        # Khởi tạo trình duyệt với context ghi lại HAR
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(record_har_path=har_file_path)
        page = context.new_page()

        # Bước 1: Navigate tới URL và ghi lại HAR file
        print(f"Đang điều hướng và ghi lại HAR file cho URL: {url_to_test}")
        navigate_and_record_har(page, url_to_test)

        # Bước 2: Extract URL của hình ảnh từ HAR file (trong khi vẫn giữ nguyên trang đã điều hướng)
        print(f"Đang phân tích HAR file để lấy danh sách hình ảnh...")
        image_urls = extract_images_from_har(har_file_path)

        # Bước 3: Sử dụng phiên đã điều hướng để lấy kích thước hình ảnh từ DOM
        print(f"Đang lấy thông tin kích thước cho hình ảnh từ DOM...")
        image_sizes = get_image_sizes_from_dom(page, image_urls, url_to_test)

        # Đóng context và browser
        context.close()
        browser.close()

        # In ra kết quả kích thước của các hình ảnh
        print("Kích thước của các hình ảnh:")
        for image_info in image_sizes:
            print(f"URL: {image_info['url']}")
            print(f"  Rendered Size: {image_info['rendered_size'][0]}x{image_info['rendered_size'][1]}")
            print(f"  Intrinsic Size: {image_info['intrinsic_size'][0]}x{image_info['intrinsic_size'][1]}")
