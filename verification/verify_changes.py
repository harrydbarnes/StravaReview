import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test 1: Verify Loading Screen on iPhone Safari (Production Build)
        print("Starting Test 1: iPhone Loading Screen (Prod)")
        context_iphone = browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={"width": 375, "height": 667}
        )
        page_iphone = context_iphone.new_page()

        # Block JS to simulate slow loading, but ALLOW CSS.
        # We abort requests ending in .js
        page_iphone.route("**/*.js", lambda route: route.abort())

        try:
            page_iphone.goto("http://localhost:8080/StravaReview/")
            page_iphone.wait_for_timeout(1000)

            # Check for the text
            expect(page_iphone.locator("text=Loading...")).to_be_visible()

            # Screenshot
            page_iphone.screenshot(path="verification/loading_screen_prod.png")
            print("Verified loading screen on iPhone Safari UA (Prod)")
        except Exception as e:
            print(f"Failed Test 1: {e}")
            page_iphone.screenshot(path="verification/loading_screen_prod_failed.png")
        finally:
            context_iphone.close()

        # Test 2: Verify No AutoFocus (Production Build)
        print("Starting Test 2: No AutoFocus (Prod)")
        context_desktop = browser.new_context()
        page_desktop = context_desktop.new_page()

        try:
            page_desktop.goto("http://localhost:8080/StravaReview/")

            # We need JS here, so we don't block it.

            expect(page_desktop.locator("label", has_text="Client ID")).to_be_visible(timeout=10000)

            page_desktop.wait_for_load_state('networkidle')

            active_element_id = page_desktop.evaluate("document.activeElement.id")

            if active_element_id == "client-id":
                print("FAIL: Client ID input is focused!")
            else:
                print("PASS: Client ID input is NOT focused.")

            page_desktop.screenshot(path="verification/desktop_loaded_prod.png")

        except Exception as e:
            print(f"Failed Test 2: {e}")
            page_desktop.screenshot(path="verification/desktop_failed_prod.png")
        finally:
            context_desktop.close()

        browser.close()

if __name__ == "__main__":
    run()
