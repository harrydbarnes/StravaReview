from playwright.sync_api import sync_playwright, expect
import time
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 667})
    page = context.new_page()

    page.goto("http://localhost:5173/StravaReview/")
    page.get_by_text("Try Demo Mode").click()

    # Wait for start
    try:
        page.get_by_text("LIFT THE CURTAIN").wait_for(timeout=10000)
        # Click the start button overlay
        # It's likely a button covering the screen or the "Start" button
        if page.get_by_role("button", name="Start").is_visible():
             page.get_by_role("button", name="Start").click()
        else:
             page.locator("body").click(position={"x": 187, "y": 333})
    except:
        pass

    print("Story started.")

    hint_count = 0

    # Iterate through slides slowly
    # We want to catch the first hint.
    # We also want to reach the end.

    # Max slides is about 15.
    for i in range(20):
        print(f"Checking slide {i}...")

        # Wait for potential hint appearance (DRAMATIC_DELAY is 3s, +1s for hint = 4s)
        # We don't want to wait 4s for EVERY slide if we are impatient, but for verification we must be sure.
        # But we can check if text appears.

        try:
            # Check for any variation of the hint text
            # "(Click twice to open!)" or "(Click twice to open activity!)"
            hint = page.locator("text=Click twice to open").first
            if hint.is_visible(timeout=5000): # Wait up to 5s for hint
                print(f"Hint found on slide {i}!")
                hint_count += 1
                if hint_count == 1:
                     page.screenshot(path=os.path.join("verification", "hint_visible.png"))
            else:
                print("No hint on this slide.")
        except:
             print("No hint (timeout).")

        # Check if we are at Summary
        if page.get_by_text("STRAVA").is_visible() and page.get_by_text("WRAPPED").is_visible() and page.get_by_text("Grand Total").is_visible():
            print("Reached Summary Slide!")
            break

        # Move to next slide
        # Tap right edge
        page.get_by_test_id("click-next").click(force=True)
        page.wait_for_timeout(1000)

    print(f"Total hints detected: {hint_count}")

    # Wait for Summary numbers to count up
    page.wait_for_timeout(3000)
    page.screenshot(path=os.path.join("verification", "summary_slide.png"))

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
