from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 812}) # Mobile viewport
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/StravaReview/")

        # Click Demo Mode
        print("Clicking Demo Mode...")
        page.get_by_role("button", name="Try Demo Mode").click()

        # Wait for curtain
        print("Waiting for curtain...")
        page.wait_for_selector("text=LIFT THE CURTAIN", timeout=10000)
        page.get_by_role("button", name="Start the Show").click()

        # Wait for first slide
        print("Waiting for first slide...")
        page.wait_for_selector("text=Your Year", timeout=10000)

        # Helper to click next
        def click_next():
            # Use a robust selector instead of coordinates to avoid brittle tests.
            page.get_by_test_id("click-next").click(force=True)
            time.sleep(1) # Wait for transition

        # Iterate and capture
        slides_to_capture = {
            "IntroSlide": "Your Year",
            "NewActivitySlide": "You Tried Something New",
            "VibeSlide": "Vibe " # catch Vibe Check or Vibe Stack
        }

        captured = set()
        max_slides = 20

        for i in range(max_slides):
            # Check current slide content
            content = page.content()

            for name, text in slides_to_capture.items():
                if name not in captured and text in content:
                    # Wait for animation to settle roughly
                    time.sleep(2)
                    print(f"Capturing {name}...")
                    page.screenshot(path=f"/home/jules/verification/{name}.png")
                    captured.add(name)

            if len(captured) == len(slides_to_capture):
                break

            print(f"Clicking next ({i})...")
            click_next()

        print("Done.")
        browser.close()

if __name__ == "__main__":
    run()
