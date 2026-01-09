
from playwright.sync_api import sync_playwright
import time

def verify_slides():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate mobile to see the slides well
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        # Navigate to app
        page.goto("http://localhost:5173/StravaReview/")
        time.sleep(2) # Allow load

        # Click Demo Mode
        page.get_by_text("Try Demo Mode").click()

        # Click Start The Show
        page.wait_for_selector("text=START THE SHOW", timeout=10000)
        page.get_by_text("START THE SHOW").click()

        # Wait for "Your Year in Activity" (IntroSlide)
        page.wait_for_selector("text=Your Year", timeout=10000)
        time.sleep(2)
        page.screenshot(path="verification/1_intro.png")

        # Advance to PercentSlide
        # Clicking right side of screen advances
        page.mouse.click(350, 300)
        time.sleep(1) # transition
        page.wait_for_selector("text=Life in Motion")
        time.sleep(2) # wait for countup
        page.screenshot(path="verification/2_percent.png")

        # Advance to ElevationSlide
        page.mouse.click(350, 300)
        time.sleep(1)
        page.wait_for_selector("text=The Vertical Limit")
        time.sleep(2)
        page.screenshot(path="verification/3_elevation.png")

        # Advance to FuelSlide
        page.mouse.click(350, 300)
        time.sleep(1)
        page.wait_for_selector("text=The Fuel Tank")
        time.sleep(2)
        page.screenshot(path="verification/4_fuel.png")

        # Advance to TopSportsSlide
        page.mouse.click(350, 300)
        time.sleep(1)
        page.wait_for_selector("text=Your Top Sports")
        time.sleep(2)
        page.screenshot(path="verification/5_sports.png")

        # Advance to PaceSlide
        page.mouse.click(350, 300)
        time.sleep(1)
        page.wait_for_selector("text=The Consistent Cruiser")
        time.sleep(2)
        page.screenshot(path="verification/6_pace.png")

        browser.close()

if __name__ == "__main__":
    verify_slides()
