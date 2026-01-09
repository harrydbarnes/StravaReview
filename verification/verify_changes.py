
from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/StravaReview/")
        page.wait_for_timeout(2000)

        print("Clicking Demo Mode...")
        page.get_by_text("Try Demo Mode").click()

        # Wait for start
        try:
            page.wait_for_selector("text=Start the Show", timeout=15000)
            page.get_by_text("Start the Show").click()
        except:
            print("Already started or skipped curtain")

        time.sleep(2)

        def next_slide():
            page.mouse.click(350, 300)

        # Slide 0: Intro
        print("Slide 0: Intro")
        time.sleep(1)
        next_slide()

        # Slide 1: Percent
        print("Slide 1: Percent")
        time.sleep(1)
        next_slide()

        # Slide 2: Elevation (Big Ben)
        print("Slide 2: Elevation")
        time.sleep(4) # Wait for DRAMATIC_DELAY (3s) + animation
        page.screenshot(path="verification/slide_2_elevation.png")

        # Verify text
        content = page.content()
        if "Big Ben" in content:
            print("✅ Big Ben text found")
        else:
            print("❌ Big Ben text NOT found")

        next_slide()

        # Slide 3: Fuel
        print("Slide 3: Fuel")
        time.sleep(1)
        next_slide()

        # Slide 4: Top Sports
        print("Slide 4: Top Sports")
        time.sleep(1)
        next_slide()

        # Slide 5: Pace
        print("Slide 5: Pace")
        time.sleep(1)
        next_slide()

        # Slide 6: Speed (mph)
        print("Slide 6: Speed")
        time.sleep(4)
        page.screenshot(path="verification/slide_6_speed.png")
        content = page.content()
        if "mph" in content:
            print("✅ mph text found")
        else:
            print("❌ mph text NOT found")

        next_slide()

        # Slide 7: Slowest (Mock has it)
        print("Slide 7: Slowest")
        time.sleep(1)
        next_slide()

        # Slide 8: Shortest (Mock has it)
        print("Slide 8: Shortest")
        time.sleep(1)
        next_slide()

        # Slide 9: Heatmap (Clockwatcher)
        print("Slide 9: Heatmap")
        time.sleep(4)
        page.screenshot(path="verification/slide_9_heatmap.png")

        next_slide()

        # Slide 10: Weekly Pattern
        print("Slide 10: Weekly Pattern")
        time.sleep(4)
        page.screenshot(path="verification/slide_10_weekly.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
