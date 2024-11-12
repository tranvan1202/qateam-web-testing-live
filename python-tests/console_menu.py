import os
from tests.suites import test_page_access_manual_check_suite

def display_menu():
    print("Select a test to run:")
    print("1. Common Page Test")
    print("2. Exit")

    choice = input("Enter choice (1-2): ")
    if choice == "1":
        test_page_access_manual_check_suite()
    elif choice == "2":
        print("Exiting.")
        exit()
    else:
        print("Invalid choice. Please select again.")

if __name__ == "__main__":
    while True:
        display_menu()