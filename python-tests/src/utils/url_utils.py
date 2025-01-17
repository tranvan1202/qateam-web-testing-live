# python-tests/src/utils/url_utils.py
from src.cores.cache_manager import CacheManager

class URLUtils:
    @staticmethod
    def filter_grabbed_raw_urls(page, grabbed_raw_urls, is_convert_to_www=False):
        """
        Process a list of raw URLs by filtering, deduplicating, and resolving relative URLs.
        Args:
            page: Playwright page object to extract the base URL.
            grabbed_raw_urls: List of raw URLs to process.
        Returns:
            List of processed, absolute, and unique valid URLs.
        """
        # Step 1: Remove invalid URLs
        valid_urls = URLUtils.remove_invalid_urls(grabbed_raw_urls)

        # Step 2: Remove duplicates
        unique_valid_urls = URLUtils.remove_duplicated_urls(valid_urls)

        # Step 3: Resolve relative URLs
        absolute_unique_valid_urls = URLUtils.convert_relative_to_absolute_urls(page, unique_valid_urls)

        if is_convert_to_www:
            absolute_unique_valid_urls_converted_to_www = URLUtils.convert_p6_qa_to_www(absolute_unique_valid_urls)
            return absolute_unique_valid_urls_converted_to_www
        else:
            return absolute_unique_valid_urls

    @staticmethod
    def filter_inputted_urls(inputted_urls, is_convert_to_www=False):
        # Step 1: Remove invalid URLs
        valid_urls = URLUtils.remove_invalid_urls(inputted_urls)

        # Step 2: Remove duplicates
        unique_valid_urls = URLUtils.remove_duplicated_urls(valid_urls)

        if is_convert_to_www:
            absolute_unique_valid_urls_converted_to_www = URLUtils.convert_p6_qa_to_www(unique_valid_urls)
            return absolute_unique_valid_urls_converted_to_www
        else:
            return unique_valid_urls

    @staticmethod
    def remove_invalid_urls(urls):
        if not isinstance(urls, list):
            raise ValueError("URLs should be provided as a list.")
        return [
            url for url in urls
            if url and not url.lower().startswith("javascript") and not url.isspace()
        ]

    @staticmethod
    def remove_duplicated_urls(urls):
        return list(set(urls))

    @staticmethod
    def convert_relative_to_absolute_urls(page, urls):
        """
        Convert relative URLs to absolute URLs, handling both "/" and "//" cases.
        :param page: The Playwright page instance.
        :param urls: List of URLs to convert.
        :return: List of absolute URLs.
        """
        try:
            # Lấy base URL và protocol (https:// hoặc http://)
            base_url = page.evaluate("() => window.location.origin")
            protocol = page.evaluate("() => window.location.protocol")

            absolute_urls = []
            for url in urls:
                if url.startswith("//"):
                    # URL bắt đầu bằng "//", ghép thêm protocol (https:// hoặc http://)
                    absolute_urls.append(f"{protocol}{url}")
                elif url.startswith("/"):
                    # URL bắt đầu bằng "/", ghép thêm base_url
                    absolute_urls.append(f"{base_url}{url}")
                else:
                    absolute_urls.append(url)

            return absolute_urls
        except Exception as e:
            raise RuntimeError(f"Failed to evaluate base URL or protocol: {e}")

    @staticmethod
    def check_url_status_with_cache(url, cache_type, timeout=5, context=None):
        session = CacheManager().get_session_cache_by_type(cache_type)

        # Đồng bộ cookie từ Playwright context nếu có
        if context:
            cookies = context.cookies()  # Lấy cookies từ Playwright context
            for cookie in cookies:
                session.cookies.set(cookie['name'], cookie['value'], domain=cookie['domain'])

        try:
            # Kiểm tra trạng thái HTTP qua session cache
            response = session.get(url, allow_redirects=True, timeout=timeout)

            # Xác định nguồn dữ liệu (cache hoặc real-time)
            source = "Cache" if response.from_cache else "Real Time"
            return f"{response.status_code} - {source}"

        except Exception as e:
            print(f"[ERROR] Unable to check URL {url}: {e}")
            return "Unable to check - Real Time"

    @staticmethod
    def convert_string_list_url_to_tuple_type(string_list):
        return [
        (item.split(",", 1)[0], item.split(",", 1)[1]) for item in string_list
    ]

    @staticmethod
    def convert_p6_qa_to_www(urls):
        converted_urls = []
        for url in urls:
            if "p6-qa" in url:
                # Thay thế "p6-qa" bằng "www"
                converted_url = url.replace("p6-qa", "www")
                converted_urls.append(converted_url)
            else:
                # Giữ nguyên URL nếu không chứa "p6-qa"
                converted_urls.append(url)
        return converted_urls