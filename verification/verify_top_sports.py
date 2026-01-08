from playwright.sync_api import sync_playwright

def verify_top_sports_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to ensure full-width container
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        # Navigate to the app
        try:
            page.goto("http://localhost:5173/StravaReview/")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # Click "Try Demo Mode"
        page.click("text=Try Demo Mode")

        # Wait for "Ready?" overlay and click start
        page.wait_for_selector("text=Ready?", timeout=10000)
        page.click("text=Begin Your Journey")

        # Wait for first slide "Your Year"
        page.wait_for_selector("text=Your Year", timeout=5000)

        # Click the right side of the screen to advance to the next slide (Top Sports)
        # With mobile viewport, the container is full width.
        page.mouse.click(375 * 0.9, 667 / 2)

        # Wait for "Your Top Sports" header
        page.wait_for_selector("text=Your Top Sports", timeout=5000)

        # Wait a bit for animations
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="verification/top_sports_slide.png")
        print("Top sports slide screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_top_sports_layout()
