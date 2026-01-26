from playwright.sync_api import sync_playwright, expect
import time
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to check responsive changes and scrolling
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        print("Loading app...")
        page.goto("http://localhost:5173/StravaReview/")

        # Verify App.jsx scrolling class
        print("Verifying App.jsx scrolling...")
        root_div = page.locator("#root > div").first
        class_attr = root_div.get_attribute("class")
        if "overflow-y-auto" in class_attr:
            print("SUCCESS: App.jsx has overflow-y-auto")
        else:
            print(f"FAILURE: App.jsx class is {class_attr}")

        # Start Demo
        print("Starting Demo...")
        page.get_by_role("button", name="Try Demo Mode").click()

        # Wait for "Start the Show"
        start_btn = page.get_by_role("button", name="Start the Show")
        expect(start_btn).to_be_visible(timeout=10000)

        start_btn.click()
        print("Started Show. Waiting for curtain...")
        time.sleep(3) # Wait for curtain exit

        # We are on Slide 0 (Intro)

        def click_next():
            # Click on the right side of the screen (viewport width 375)
            # x=350, y=333 (center vertical)
            page.mouse.click(350, 333)
            time.sleep(1) # Wait for transition/animation start

        # Move to Slide 1 (PercentSlide)
        click_next()
        print("Checking PercentSlide...")
        time.sleep(2)
        page.screenshot(path="verification/slide_percent.png")

        # Move to Slide 2 (Elevation)
        click_next()
        time.sleep(1)

        # Move to Slide 3 (Fuel)
        click_next()
        print("Checking FuelSlide...")
        time.sleep(2)
        page.screenshot(path="verification/slide_fuel.png")

        # Move to Slide 4 (TopSports)
        click_next()
        print("Checking TopSportsSlide...")
        time.sleep(2)
        page.screenshot(path="verification/slide_topsports.png")

        # Move to Slide 5 (Pace)
        click_next()

        # Move to Slide 6 (Speed)
        click_next()
        print("Checking SpeedSlide...")
        time.sleep(2)
        page.screenshot(path="verification/slide_speed.png")

        # Navigate until FunStatsSlide ("Time Well Spent")
        print("Searching for FunStatsSlide...")
        found = False
        for i in range(10): # Try next 10 slides
             # Check for header
             if page.get_by_role("heading", name="Time Well Spent").is_visible():
                 print("Found FunStatsSlide!")
                 found = True
                 break
             click_next()
             time.sleep(1)

        if found:
            print("Found it! Pausing...")
            page.keyboard.press("Space")
            print("Waiting for animations...")
            time.sleep(6)
            page.screenshot(path="verification/slide_funstats_padded.png")
        else:
            print("FunStatsSlide not found.")

        browser.close()

if __name__ == "__main__":
    run()
