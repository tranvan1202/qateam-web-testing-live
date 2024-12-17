from requests_cache import CachedSession

class CacheManager:
    def __init__(self):
        # Khởi tạo các cache sessions với thời gian khác nhau
        self.sessions = {
            "links": CachedSession("./caches/links_cache", expire_after=300, allowable_codes = [200]),  # 8 giờ
            "images": CachedSession("./caches/images_cache", expire_after=300, allowable_codes = [200]),  # 2 giờ
            "videos": CachedSession("./caches/videos_cache", expire_after=300, allowable_codes = [200]),  # 1 giờ
        }

    def get_session_cache_by_type(self, cache_type):
        """
        Trả về session cache theo loại.
        :param cache_type: Loại cache ('links', 'images', 'videos', ...)
        :return: CachedSession object.
        """
        if cache_type in self.sessions:
            return self.sessions[cache_type]
        raise ValueError(f"Cache type '{cache_type}' not exists.")

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