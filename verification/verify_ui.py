
import time
from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        # 1. Navigate to the app (assuming default Vite port)
        page.goto(os.environ.get("APP_URL", "http://localhost:5173/StravaReview/"))

        # Wait for loading to finish (or click Demo Mode if needed)
        # The app requires interaction to start.
        # Click "Try Demo Mode"
        page.get_by_text("Try Demo Mode").click()

        # Wait for "LIFT THE CURTAIN" text (loading finished)
        page.wait_for_selector("text=LIFT THE CURTAIN", timeout=10000)

        # Click "Start the Show"
        page.get_by_text("Start the Show").click()

        # Wait for the first slide (Intro)
        # Wait for the first slide to load
        page.wait_for_selector('text=Your Year in Activity')

        story_container = page.locator('div[class*="md:rounded-xl"]').first

        def advance_slide(expected_text):
            # Click on the right side of the container to advance.
            # Using a position is better than global mouse coordinates.
            story_container.click(position={'x': 300, 'y': 300})
            page.wait_for_selector(f'text={expected_text}')

        # Navigate through the slides by waiting for expected content
        advance_slide('Your Top Sports')
        advance_slide('You Tried Something New')
        # The location slide is likely present in demo data
        advance_slide('Your Favorite Playground')
        advance_slide('Time Well Spent')
        advance_slide('The Crowd Went Wild') # This is the Spotlight slide

        # Wait for animation
        time.sleep(2)

        # Take screenshot of Spotlight Slide to verify "Fan Favorite" sticker
        expect(page.get_by_text("🏆 Fan Favorite")).to_be_visible()
        page.screenshot(path="verification/spotlight_slide.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
