# python-tests/src/utils/url_utils.py
from src.cores.cache_manager import CacheManager

class URLUtils:
    @staticmethod
    def filter_grabbed_raw_urls(page, grabbed_raw_urls):
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

        return absolute_unique_valid_urls

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
        try:
            # Lấy base URL
            base_url = page.evaluate(f"() => window.location.origin")
            absolute_urls = [f"{base_url}{url}" if url.startswith("/") else url for url in urls]

            return absolute_urls
        except Exception as e:
            raise RuntimeError(f"Failed to evaluate base URL: {e}")

    @staticmethod
    def check_url_status_with_cache (url, cache_type, timeout=5):
        session = CacheManager().get_session_cache_by_type(cache_type)
        try:
            response = session.get(url, allow_redirects=True, timeout=timeout)
            #print(session.cache.db_path)
            return response.status_code
        except Exception as e:
            print(f"[ERROR] Unable to check URL {url}: {e}")
            return None

    @staticmethod
    def convert_string_list_url_to_tuple_type(string_list):
        return [
        (item.split(",", 1)[0], item.split(",", 1)[1]) for item in string_list
    ]
