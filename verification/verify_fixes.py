
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
        page.get_by_text("Start the Show").click()
        page.wait_for_timeout(1000)

        # Helper for next slide
        def next_slide():
            page.mouse.click(350, 400)
            page.wait_for_timeout(1000)

        found_colour = False
        found_shortest = False

        # Take a screenshot of the controls immediately to verify "Colour" text
        print("Verifying Controls...", flush=True)
        # Assuming Controls are visible on first slide or soon after
        # On mobile layout, they are inside.
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/controls_check.png")

        # Check text content for "Colour"
        content = page.content()
        if "Colour" in content:
            print("Found 'Colour' button text", flush=True)
            found_colour = True
        else:
            print("Did NOT find 'Colour' button text", flush=True)

        # Search for Shortest Activity slide to verify hint
        for i in range(25):
            print(f"Checking slide {i}...", flush=True)
            page.wait_for_timeout(1000)

            text_content = page.evaluate("document.body.innerText")

            if "What was this one, btw?" in text_content and not found_shortest:
                print("Found 'Shortest Activity' slide", flush=True)
                page.wait_for_timeout(3000) # Wait for hint animation
                page.screenshot(path="verification/shortest_hint.png")

                # Check for hint text
                if "Click twice to open!" in page.content():
                    print("Found 'Click twice' hint!", flush=True)
                else:
                    print("Did NOT find 'Click twice' hint", flush=True)

                found_shortest = True

            if found_colour and found_shortest:
                print("Found all target elements!", flush=True)
                break

            next_slide()

        browser.close()

if __name__ == "__main__":
    verify_frontend()
