from playwright.sync_api import sync_playwright


def scroll_page(page):
    # Cuộn từ đầu đến cuối trang
    page.evaluate("window.scrollTo(0, 0);")  # Cuộn lên đầu
    page.wait_for_timeout(1000)  # Đợi 1 giây
    page.evaluate("window.scrollTo(0, document.body.scrollHeight);")  # Cuộn xuống cuối
    page.wait_for_timeout(1000)  # Đợi 1 giây


def process_tabs(pages):
    results = []
    for i, page in enumerate(pages):
        # Đưa tab hiện tại lên foreground
        page.bring_to_front()
        print(f"Processing Tab {i + 1}: {page.url}")

        # Cuộn trang
        scroll_page(page)

        # Lấy tiêu đề của tab
        title = page.title()
        print(f"Title of Tab {i + 1}: {title}")

        # Lưu kết quả
        results.append({"tab": i + 1, "url": page.url, "title": title})
    return results


def main():
    urls = [
        "https://www.samsung.com/my/business/washers-and-dryers/washing-machines/wa5000c-top-load-ecobubble-digital-inverter-technology-super-speed-wa13cg5745bvfq/",
        "https://www.samsung.com/my/watches/galaxy-watch/galaxy-watch-ultra-titanium-gray-lte-sm-l705fdaaxme/buy/",
        "https://www.samsung.com/my/tablets/galaxy-tab-s10/buy/"
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Mở trình duyệt
        context = browser.new_context()  # Tạo browser context

        # Mở nhiều tab
        pages = [context.new_page() for _ in urls]

        # Mở đồng thời các URL
        for page, url in zip(pages, urls):
            page.goto(url)  # Truy cập URL

        # Chờ tất cả các tab hoàn tất tải
        for page in pages:
            page.wait_for_load_state("load")

        # Xử lý từng tab
        results = process_tabs(pages)

        # In kết quả
        print("\nFinal Results:")
        for res in results:
            print(res)

        # Đóng trình duyệt
        browser.close()


if __name__ == "__main__":
    main()
