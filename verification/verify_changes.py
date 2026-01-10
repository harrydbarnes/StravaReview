
from playwright.sync_api import sync_playwright, expect
import os

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to verify responsive design if needed, but keeping desktop for clarity
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Navigate to app
        page.goto("http://localhost:5173/StravaReview/")

        # Click "Try Demo Mode" to load data
        page.get_by_text("Try Demo Mode").click()

        # Wait for "Ready" state (Curtain) - "LIFT THE CURTAIN ON YOUR YEAR"
        expect(page.get_by_text("LIFT THE CURTAIN")).to_be_visible(timeout=10000)

        # Start the story
        page.get_by_text("LIFT THE CURTAIN").click()

        # Helper to navigate slides
        def next_slide():
            page.keyboard.press("ArrowRight")
            page.wait_for_timeout(500) # Wait for transition

        # We need to find:
        # 1. Elevation Slide: "The Climb" + Quote
        # 2. Kudos Slide: "The Social Butterfly" + Integer check
        # 3. Slowest Slide: "Slow and Steady Wins... a Race"

        # Navigate through slides looking for titles

        # Depending on random order or fixed order, we might need to search.
        # But StoryContainer usually has a fixed order if not random.
        # Let's just click through and screenshot when we find them.

        found_elevation = False
        found_kudos = False
        found_slowest = False

        # Max slides approx 15
        for i in range(25):
            content = page.content()

            if "The Climb" in content and not found_elevation:
                print("Found Elevation Slide")
                # Wait for animation
                page.wait_for_timeout(3000)
                page.screenshot(path="verification/elevation_slide.png")
                found_elevation = True

            if "The Social Butterfly" in content and not found_kudos:
                print("Found Kudos Slide")
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/kudos_slide.png")
                found_kudos = True

            if "Slow and Steady Wins... a Race" in content and not found_slowest:
                print("Found Slowest Slide")
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/slowest_slide.png")
                found_slowest = True

            if found_elevation and found_kudos and found_slowest:
                break

            next_slide()
            page.wait_for_timeout(500)

        browser.close()

if __name__ == "__main__":
    verify_changes()
