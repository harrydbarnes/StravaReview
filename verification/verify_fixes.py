
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
            # Use the dedicated click zone for next slide
            page.get_by_test_id("click-next").click(force=True)
            # Wait for transition to complete (animations usually take ~0.5s)
            page.wait_for_timeout(500)

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

            # Ensure page content is loaded and available for other checks
            text_content = page.evaluate("document.body.innerText")

            if not found_shortest:
                try:
                    # Wait up to 2 seconds for the slide title to appear
                    expect(page.get_by_text("What was this one, btw?")).to_be_visible(timeout=2000)
                    print("Found 'Shortest Activity' slide", flush=True)

                    # Wait up to 4 seconds for the hint to appear (it has a delay)
                    expect(page.get_by_text("Click twice to open!", exact=False)).to_be_visible(timeout=4000)
                    print("Found 'Click twice' hint!", flush=True)
                    page.screenshot(path="verification/shortest_hint.png")

                    found_shortest = True
                except TimeoutError:
                    # Not found, continue
                    pass

            if found_colour and found_shortest:
                print("Found all target elements!", flush=True)
                break

            next_slide()

        browser.close()

if __name__ == "__main__":
    verify_frontend()
