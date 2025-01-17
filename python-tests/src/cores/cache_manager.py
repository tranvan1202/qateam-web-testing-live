from requests_cache import CachedSession
from requests_cache.backends.base import create_key

class CacheManager:
    def __init__(self, auto_clean=True):
        # Khởi tạo các cache sessions với thời gian khác nhau
        self.sessions = {
            "links": CachedSession("./caches/links_cache", expire_after=43200, allowable_codes=[200]),  # Cache links
            "images": CachedSession("./caches/images_cache", expire_after=43200, allowable_codes=[200]),  # Cache images
            "videos": CachedSession("./caches/videos_cache", expire_after=43200, allowable_codes=[200, 206]),  # Cache videos
            "js": CachedSession("./caches/js_cache", expire_after=43200, allowable_codes=[200]),  # Cache JS Scripts
            "css": CachedSession("./caches/css_cache", expire_after=43200, allowable_codes=[200]),  # Cache CSS Files
        }

    def get_session_cache_by_type(self, cache_type):
        """
        Lấy session cache theo loại.
        :param cache_type: Loại cache ('links', 'images', 'videos', 'js', 'css').
        :return: CachedSession tương ứng.
        """
        if cache_type in self.sessions:
            return self.sessions[cache_type]
        raise ValueError(f"Cache type '{cache_type}' does not exist.")

    def scheduled_cache_clean_up(self):
        """
        Clear expired cache entries and log details of cleared URLs.
        """
        for cache_type, session in self.sessions.items():
            # Lấy danh sách các mục đã hết hạn trước khi xóa
            expired_entries = [key for key, response in session.cache.responses.items() if response.is_expired]

            # Xóa các mục hết hạn
            session.cache.delete(expired=True)

            # In thông tin về các URL đã xóa
            if expired_entries:
                print(f"[INFO] Cleared expired cache for {cache_type} ({len(expired_entries)} entries):")
                for entry in expired_entries:
                    print(f" - {entry}")
            else:
                print(f"[INFO] No expired entries found for {cache_type} caches.")

        print(f"[INFO]Scheduled cache clean-up completed.")