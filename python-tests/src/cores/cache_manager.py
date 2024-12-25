from requests_cache import CachedSession

class CacheManager:
    def __init__(self):
        # Khởi tạo các cache sessions với thời gian khác nhau
        self.sessions = {
            "links": CachedSession("./caches/links_cache", expire_after=28800, allowable_codes=[200]),  # Cache links
            "images": CachedSession("./caches/images_cache", expire_after=28800, allowable_codes=[200]),  # Cache images
            "videos": CachedSession("./caches/videos_cache", expire_after=28800, allowable_codes=[200, 206]),  # Cache videos
            "js": CachedSession("./caches/js_cache", expire_after=28800, allowable_codes=[200]),  # Cache JS Scripts
            "css": CachedSession("./caches/css_cache", expire_after=28800, allowable_codes=[200]),  # Cache CSS Files
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

    def clear_cache(self, cache_type=None):
        """
        Xóa cache cho một loại hoặc tất cả.
        :param cache_type: Loại cache để xóa (hoặc None để xóa tất cả).
        """
        if cache_type:
            if cache_type in self.sessions:
                self.sessions[cache_type].cache.clear()
            else:
                raise ValueError(f"Cache type '{cache_type}' not exists.")
        else:
            for session in self.sessions.values():
                session.cache.clear()