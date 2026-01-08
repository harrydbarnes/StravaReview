from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile view as per memory
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:5173/StravaReview/")

            # Wait for content to load
            page.wait_for_selector("text=STRAVA", timeout=10000)

            # Take a screenshot of the landing page
            page.screenshot(path="verification/landing_page.png")
            print("Screenshot taken: verification/landing_page.png")

            # Click 'Try Demo Mode' to enter StoryViewer
            page.get_by_role("button", name="Try Demo Mode").click()

            # Wait for StoryViewer "Ready?" screen or Loading
            # It might take a moment to generate data
            page.wait_for_selector("text=Ready?", timeout=10000)

            # Take a screenshot of the loading or ready state
            page.screenshot(path="verification/demo_loading.png")
            print("Screenshot taken: verification/demo_loading.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
