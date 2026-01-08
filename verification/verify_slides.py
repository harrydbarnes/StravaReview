from playwright.sync_api import sync_playwright
import time

def verify_slides():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to app
        page.goto("http://localhost:5173/StravaReview/")

        # Click Demo Mode
        page.click("text=Try Demo Mode")

        # Wait for Intro Slide
        page.wait_for_selector("text=Your Year")
        time.sleep(1) # Let intro animation finish (it's fast now)
        page.screenshot(path="verification/slide_1_intro.png")
        print("Captured Intro")

        # Wait for next slide (Auto-advance or click)
        # Intro slide duration is 5s.
        # We can wait or click. Let's wait to verify auto-advance partially.
        print("Waiting for auto-advance to Sports...")
        # Intro duration 5s. + some buffer.
        try:
            page.wait_for_selector("text=Your Top Sports", timeout=8000)
            print("Auto-advanced to Sports")
            time.sleep(2) # Let stats reveal
            page.screenshot(path="verification/slide_2_sports.png")
        except Exception as e:
            print("Auto-advance failed or too slow:", e)
            page.screenshot(path="verification/error_sports.png")

        # Skip ahead to Vibe
        # Click right side of screen
        width = page.viewport_size['width']
        height = page.viewport_size['height']

        # Click through New Activity, Fun Stats, Spotlight to get to Vibe
        # We are at Sports.
        # Next: New Activity (if present in demo)
        # Next: Fun Stats
        # Next: Spotlight (if present)
        # Next: Vibe

        # Just click rapidly to find Vibe
        print("Navigating to Vibe...")
        for _ in range(5):
            if page.locator("text=Vibe Check").count() > 0:
                break
            page.mouse.click(width * 0.8, height / 2)
            time.sleep(0.5)

        page.wait_for_selector("text=Vibe Check")
        time.sleep(2) # Wait for animation
        page.screenshot(path="verification/slide_vibe.png")
        print("Captured Vibe")

        # Next is Location
        page.mouse.click(width * 0.8, height / 2)
        page.wait_for_selector("text=Your Favorite Playground")
        time.sleep(2) # Wait for animation
        page.screenshot(path="verification/slide_location.png")
        print("Captured Location")

        browser.close()

if __name__ == "__main__":
    verify_slides()
