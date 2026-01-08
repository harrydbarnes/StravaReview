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
        try:
            page.wait_for_selector("text=Your Year", timeout=10000)
            print("Intro slide visible")
            time.sleep(1)
            page.screenshot(path="verification/slide_1_intro.png")
            print("Captured Intro")
        except Exception as e:
            print(f"Error finding intro slide: {e}")
            page.screenshot(path="verification/error_intro.png")

        # Wait for auto-advance to Sports (Intro duration is 5s)
        print("Waiting for auto-advance to Sports...")
        try:
            # Intro slide duration is 5s, let's wait a bit more
            page.wait_for_selector("text=Your Top Sports", timeout=10000)
            print("Auto-advanced to Sports")
            time.sleep(2)
            page.screenshot(path="verification/slide_2_sports.png")
            print("Captured Sports")
        except Exception as e:
            print("Auto-advance failed or too slow:", e)
            page.screenshot(path="verification/error_sports.png")

        # Navigate to Vibe
        # We need to click through remaining slides or assume we are on Sports
        # Slides: Intro -> Sports -> New Activity -> Fun Stats -> Spotlight -> Vibe
        # We are at Sports.

        print("Navigating to Vibe...")
        width = page.viewport_size['width']
        height = page.viewport_size['height']

        found_vibe = False
        for i in range(10): # Try clicking next a few times
            if page.locator("text=Vibe Check").is_visible():
                found_vibe = True
                break
            page.mouse.click(width * 0.9, height / 2) # Click right side
            time.sleep(0.8) # Wait for transition

        if found_vibe:
             print("Found Vibe Slide")
             time.sleep(2) # Wait for animation
             page.screenshot(path="verification/slide_vibe.png")
             print("Captured Vibe")
        else:
             print("Could not find Vibe Check slide")
             page.screenshot(path="verification/error_vibe.png")

        # Navigate to Location
        page.mouse.click(width * 0.9, height / 2)
        try:
            page.wait_for_selector("text=Your Favorite Playground", timeout=5000)
            print("Found Location Slide")
            time.sleep(2)
            page.screenshot(path="verification/slide_location.png")
            print("Captured Location")
        except Exception as e:
             print(f"Error finding location slide: {e}")
             page.screenshot(path="verification/error_location.png")

        browser.close()

if __name__ == "__main__":
    verify_slides()
