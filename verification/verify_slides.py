
import re
import sys
from playwright.sync_api import sync_playwright, expect

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 800})
        page = context.new_page()

        print("Navigating...", flush=True)
        page.goto("http://localhost:5173/StravaReview/")

        print("Clicking Demo...", flush=True)
        page.get_by_text("Try Demo Mode").click()

        page.wait_for_timeout(3000)

        print("Starting Story...", flush=True)
        # Click "Start the Show" button
        page.get_by_text("Start the Show").click()
        page.wait_for_timeout(1000)

        # Helper for next slide
        def next_slide():
            # Use the dedicated click zone for next slide
            page.get_by_test_id("click-next").click(force=True)
            # Wait for content to render and animations to start
            page.wait_for_timeout(500)

        found_climb = False
        found_months = False
        found_social = False
        found_slowest = False

        # Iterate through slides
        for i in range(25):
            print(f"Checking slide {i}...", flush=True)
            page.wait_for_timeout(1000) # Ensure slide mounted

            content = page.content()
            text_content = page.evaluate("document.body.innerText")

            # 1. The Climb (Renamed from Vertical Limit)
            if "The Climb" in text_content and "There's always gonna be another mountain" in text_content and not found_climb:
                print("Found 'The Climb' slide", flush=True)
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/climb_slide.png")
                found_climb = True

            # 2. Peak Performance Months (Redesigned)
            if "Peak Performance Months" in text_content and not found_months:
                print("Found 'Peak Performance Months' slide", flush=True)
                # Wait longer for stagger animation
                page.wait_for_timeout(3000)
                page.screenshot(path="verification/months_slide.png")
                found_months = True

            # 3. Social Butterfly (Kudos)
            if "The Social Butterfly" in text_content and not found_social:
                print("Found 'Social Butterfly' slide", flush=True)
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/social_slide.png")
                found_social = True

            # 4. Slow and Steady
            if "Slow and Steady Wins... a Race" in text_content and not found_slowest:
                print("Found 'Slow and Steady' slide", flush=True)
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/slowest_slide.png")
                found_slowest = True

            if found_climb and found_months and found_social and found_slowest:
                print("Found all target slides!", flush=True)
                break

            next_slide()

        browser.close()

if __name__ == "__main__":
    verify_frontend()
