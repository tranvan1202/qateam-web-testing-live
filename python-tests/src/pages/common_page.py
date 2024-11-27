# python-tests/src/pages/common_page.py

from src.pages.base_page import BasePage

class CommonCheckPage(BasePage):
    def navigate_and_perform_actions(self, urls, max_tabs=1, collect_results=False):
        """
        Open multiple tabs or process URLs sequentially.
        :param urls: List of URLs to test.
        :param max_tabs: Maximum number of tabs to open simultaneously.
        :param collect_results: Whether to collect and return navigated URLs.
        :return: List of (tab_index, expected_url, actual_url) tuples if collect_results is True.
        """
        tab_results = []

        try:
            # Open tabs based on max_tabs
            pages = self.open_tabs(urls, max_tabs)

            # Perform actions on opened tabs
            for idx, (page, expected_url) in enumerate(pages):
                try:
                    page.bring_to_front()
                    print(f"Performing common actions on tab {idx + 1}")
                    self.perform_common_actions(page)

                    # Collect tab results if requested
                    if collect_results:
                        actual_url = page.url
                        tab_results.append((idx + 1, expected_url, actual_url))
                        print(f"Tab {idx + 1}: Completed actions for {actual_url}")

                except Exception as e:
                    print(f"Error during actions on tab {idx + 1}: {e}")
                    if collect_results:
                        tab_results.append((idx + 1, expected_url, "Error"))

        except Exception as main_error:
            print(f"Error during navigation and actions: {main_error}")

        # Return tab results for further assertions
        return tab_results if collect_results else None