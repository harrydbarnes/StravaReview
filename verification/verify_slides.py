
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

            # Optimization: Check if any remaining target is visible to avoid long waits
            patterns = []
            if not found_climb: patterns.append("The Climb")
            if not found_months: patterns.append("Peak Performance Months")
            if not found_social: patterns.append("The Social Butterfly")
            if not found_slowest: patterns.append("Slow and Steady Wins")

            if not patterns:
                break

            regex_pattern = "|".join(patterns)

            try:
                # Wait for any of the target texts to appear
                expect(page.locator("body")).to_contain_text(re.compile(regex_pattern), timeout=2000)
            except TimeoutError:
                # None of the targets found, move to next slide
                next_slide()
                continue

            # If we are here, at least one target is present. Check specific slides.

            # Use content() to check for text presence (handles partial rendering/fading)
            content = page.content()

            # 1. The Climb
            if "The Climb" in content and not found_climb:
                try:
                    expect(page.get_by_text("The Climb")).to_be_visible(timeout=1000)
                    expect(page.get_by_text("There's always gonna be another mountain")).to_be_visible(timeout=1000)
                    print("Found 'The Climb' slide", flush=True)
                    page.screenshot(path="verification/climb_slide.png")
                    found_climb = True
                except Exception:
                    pass

            # 2. Peak Performance Months
            if "Peak Performance Months" in content and not found_months:
                try:
                    expect(page.get_by_text("Peak Performance Months")).to_be_visible(timeout=1000)
                    print("Found 'Peak Performance Months' slide", flush=True)
                    # Wait for stagger animation
                    page.wait_for_timeout(3000)
                    page.screenshot(path="verification/months_slide.png")
                    found_months = True
                except Exception:
                    pass

            # 3. Social Butterfly
            if "The Social Butterfly" in content and not found_social:
                try:
                    expect(page.get_by_text("The Social Butterfly")).to_be_visible(timeout=1000)
                    print("Found 'Social Butterfly' slide", flush=True)
                    page.screenshot(path="verification/social_slide.png")
                    found_social = True
                except Exception:
                    pass

            # 4. Slow and Steady
            if "Slow and Steady Wins" in content and not found_slowest:
                try:
                    expect(page.get_by_text("Slow and Steady Wins... a Race")).to_be_visible(timeout=1000)
                    print("Found 'Slow and Steady' slide", flush=True)
                    page.screenshot(path="verification/slowest_slide.png")
                    found_slowest = True
                except Exception:
                    pass

            if found_climb and found_months and found_social and found_slowest:
                print("Found all target slides!", flush=True)
                break

            next_slide()

        browser.close()

if __name__ == "__main__":
    verify_frontend()
