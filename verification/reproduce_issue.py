from playwright.sync_api import sync_playwright, expect
import time
import os

def run():
    if not os.path.exists("verification/screenshots_after"):
        os.makedirs("verification/screenshots_after")

    with sync_playwright() as p:
        # Use a mobile viewport as requested by "Move up ... further" often implies mobile constraints
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/StravaReview/")

        # Wait for load
        time.sleep(2)

        # Click Demo Mode
        print("Clicking Demo Mode...")
        try:
            page.get_by_role("button", name="Try Demo Mode").click()
        except:
            # Maybe already authenticated or something, try looking for curtain
            pass

        # Capture Curtain
        print("Waiting for curtain...")
        try:
            page.wait_for_selector("text=LIFT THE CURTAIN", timeout=10000)
            time.sleep(1)
            page.screenshot(path="verification/screenshots_after/00_Curtain.png")
            page.get_by_role("button", name="Start the Show").click()
        except:
            print("Curtain not found or timed out")

        # Define targets
        targets = {
            "IntroSlide": "Your Year",
            "PercentSlide": "Life in Motion",
            "FuelSlide": "The Fuel Tank",
            "PaceSlide": "Consistent Cruiser",
            "HeatmapSlide": "Clockwatcher",
            "WeeklyPatternSlide": "Weekly Grind",
            "TopMonthsSlide": "Peak Performance Months",
            "NewActivitySlide": "Tried Something New",
            "FunStatsSlide": "Time Well Spent",
            "SpotlightSlide": "Crowd Went Wild",
            "ShortestSlide": "What Was This One",
            "LocationSlide": "Favourite Playground",
            "KudosSlide": "Social Butterfly",
            "SummarySlide": "STRAVA" # Header
        }

        captured = set()

        # Loop through slides
        for i in range(25):
            time.sleep(2.5) # Wait for animations (some are slow)

            content = page.content()

            # Check for targets
            for name, text in targets.items():
                if name not in captured and text in content:
                    print(f"Capturing {name}...")
                    # Give extra time for full animation if needed
                    if name == "SummarySlide":
                         time.sleep(6) # Increased for animation
                    page.screenshot(path=f"verification/screenshots_after/{name}.png")
                    captured.add(name)

            # Click next
            print(f"Clicking next ({i})...")
            try:
                page.get_by_test_id("click-next").click(force=True)
            except Exception as e:
                print(f"Click failed: {e}")
                break

            if "SummarySlide" in captured and len(captured) >= len(targets) - 1:
                # Summary is last usually
                pass

        print(f"Captured {len(captured)} slides.")
        browser.close()

if __name__ == "__main__":
    run()
