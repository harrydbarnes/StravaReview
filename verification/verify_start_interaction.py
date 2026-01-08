from playwright.sync_api import sync_playwright

def verify_start_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming it's running on port 5173, check logs if needed)
        try:
            page.goto("http://localhost:5173/StravaReview/")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # Click "Try Demo Mode" to trigger the StoryViewer
        page.click("text=Try Demo Mode")

        # Wait for the StoryViewer to appear (it renders after a short loading time)
        # We expect the "Begin Your Journey" overlay to be present.
        page.wait_for_selector("text=Ready?", timeout=10000)

        # Take a screenshot of the overlay
        page.screenshot(path="verification/start_overlay.png")
        print("Overlay screenshot taken.")

        # Click the "Begin Your Journey" button
        page.click("text=Begin Your Journey")

        # Wait for the overlay to disappear and the first slide to be visible
        # The first slide is "IntroSlide" which has "YOUR YEAR" text.
        page.wait_for_selector("text=Your Year", timeout=5000)

        # Wait for the emoji animation to complete
        page.wait_for_selector('text=🔥', timeout=5000)

        # Take a screenshot of the first slide
        page.screenshot(path="verification/first_slide.png")
        print("First slide screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_start_button()
