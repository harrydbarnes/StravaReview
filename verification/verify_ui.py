
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
        time.sleep(2)

        # Navigate through slides to reach SpotlightSlide (slide 5)
        # Intro -> Top Sports -> New Activity -> Fun Stats -> Spotlight
        # Assuming demo data has New Activity and Spotlight.

        # Tap right side to advance
        # Slide 1 (Intro) -> 2 (Top Sports)
        page.mouse.click(300, 300)
        time.sleep(1)

        # Slide 2 -> 3 (New Activity)
        page.mouse.click(300, 300)
        time.sleep(1)

        # Slide 3 -> 4 (Fun Stats)
        page.mouse.click(300, 300)
        time.sleep(1)

        # Slide 4 -> 5 (Spotlight)
        page.mouse.click(300, 300)
        time.sleep(1)

        # Wait for animation
        time.sleep(2)

        # Take screenshot of Spotlight Slide to verify "Fan Favorite" sticker
        expect(page.get_by_text("🏆 Fan Favorite")).to_be_visible()
        page.screenshot(path="verification/spotlight_slide.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
