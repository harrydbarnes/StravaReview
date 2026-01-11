import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to test mobile compatibility
        context = browser.new_context(viewport={"width": 375, "height": 667}, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1")
        page = context.new_page()

        # 1. Navigate to app
        page.goto("http://localhost:5173/StravaReview/")

        # Wait for loading
        page.wait_for_selector("text=Try Demo Mode", timeout=10000)

        # 2. Check Setup Instructions (How to Setup)
        # It's the "Help!" button
        page.get_by_role("button", name="Help!").click()

        # Verify "Copied!" button logic
        page.wait_for_selector("text=Authorization Callback Domain")
        copy_button = page.get_by_role("button", name="Copy")

        # Screenshot Setup
        page.screenshot(path="verification/setup_instructions.png")

        # Click copy and verify text change
        # Note: Clipboard API might not work in headless without permissions, but we can try
        context.grant_permissions(["clipboard-read", "clipboard-write"])
        copy_button.click()
        try:
            expect(page.get_by_role("button", name="Copied!")).to_be_visible(timeout=3000)
            print("Setup Copy feedback verified.")
        except:
            print("Setup Copy feedback failed (could be headless clipboard issue).")

        page.get_by_role("button", name="Close").click()

        # 3. Enter Demo Mode
        page.get_by_text("Try Demo Mode").click()

        # 4. Start the Show
        page.get_by_role("button", name="Start the Show").click()

        # Wait for transition
        time.sleep(2)

        # 5. Navigate to find ShortestSlide or similar with new button
        # We need to click next multiple times.
        # Slides order: Intro, Percent, Olympics, Shortest...
        # Let's try to find text "What was this one, btw?"

        found = False
        for i in range(25):
            if page.get_by_text("What was this one, btw?").is_visible():
                found = True
                break
            # Click next (right side of screen)
            # Mobile viewport: width 375. Next is > 2/3 width => > 250
            page.mouse.click(350, 300)
            time.sleep(1.5) # wait for animation

        if found:
            print("Found ShortestSlide")
            # Verify button exists
            btn = page.get_by_role("link", name="View on Strava")
            expect(btn).to_be_visible()
            page.screenshot(path="verification/shortest_slide_button.png")
        else:
            print("Could not find ShortestSlide")

        # 6. Navigate to Summary Slide (Last slide)
        # Keep clicking next until we see "Save & Share"

        found_summary = False
        for i in range(25):
            if page.get_by_role("button", name="Save & Share").is_visible():
                found_summary = True
                break
            page.mouse.click(350, 300)
            time.sleep(1.0)

        if found_summary:
            print("Found SummarySlide")
            page.screenshot(path="verification/summary_slide_share.png")
        else:
            print("Could not find SummarySlide")

        browser.close()

if __name__ == "__main__":
    verify_changes()
