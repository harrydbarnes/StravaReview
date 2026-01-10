
from playwright.sync_api import sync_playwright, expect
import time

def verify_story_viewer_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to ensure consistent layout
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        try:
            # 1. Navigate to the app (assuming default Vite port)
            page.goto("http://localhost:5173/StravaReview/")

            # Wait for app to load - using more specific selector
            expect(page.get_by_role("heading", name="STRAVA WRAPPED")).to_be_visible()

            # 2. Start Demo Mode (App level)
            page.get_by_role("button", name="Try Demo Mode").click()

            # Wait for StoryViewer to mount and show the Curtain
            expect(page.get_by_role("button", name="Start the Show")).to_be_visible(timeout=10000)

            # 3. Lift the Curtain (StoryViewer level)
            page.get_by_role("button", name="Start the Show").click()

            # Wait for the curtain to lift and slides to appear
            # The progress bars are a good indicator that the show has started
            expect(page.get_by_label("Slides navigation")).to_be_visible()

            # Wait a bit more for the curtain animation
            page.wait_for_timeout(2000)

            # 4. Test Keyboard Navigation (Right Arrow)
            print("Pressing ArrowRight...")
            page.keyboard.press("ArrowRight")

            # Verify we moved to slide 2
            # Use regex for exact match or exact=True to avoid matching "10", "11" etc.
            expect(page.get_by_role("tab", name="Go to slide 2", exact=True)).to_have_attribute("aria-selected", "true", timeout=5000)
            print("Moved to Slide 2")

            # 5. Test Keyboard Navigation (Left Arrow)
            print("Pressing ArrowLeft...")
            page.keyboard.press("ArrowLeft")

            # Verify we moved back to slide 1
            expect(page.get_by_role("tab", name="Go to slide 1", exact=True)).to_have_attribute("aria-selected", "true", timeout=5000)
            print("Moved back to Slide 1")

            # 6. Take Screenshot
            page.screenshot(path="verification/story_viewer_nav.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_story_viewer_navigation()
