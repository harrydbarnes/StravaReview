
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Mobile viewport
    context = browser.new_context(viewport={"width": 375, "height": 667})
    page = context.new_page()

    # Navigate
    page.goto("http://localhost:5173/StravaReview/")

    # Click Demo Mode
    try:
        page.get_by_text("Try Demo Mode").click(timeout=5000)
    except Exception as e:
        print(f"Demo mode button not found, maybe already loaded or different text: {e}")

    # Wait for curtain/start
    try:
        # Wait for "LIFT THE CURTAIN" or similar start indicator
        page.wait_for_selector("text=LIFT THE CURTAIN", timeout=10000)

        # Try finding the button explicitly
        start_btn = page.get_by_role("button", name="Start the Show")
        if start_btn.is_visible():
            start_btn.click()
        else:
            # Fallback to clicking the center of the screen
            print("Button not found by text, trying to click center of screen...")
            page.mouse.click(page.viewport_size["width"] / 2, page.viewport_size["height"] / 2)

    except Exception as e:
        print(f"Start curtain interaction failed: {e}")

    print("Story started (hopefully).")

    # Wait for 'click-next' to appear to confirm start
    try:
        page.wait_for_selector('[data-testid="click-next"]', timeout=5000)
        print("Controls visible, story active.")
    except Exception as e:
        print(f"Controls NOT visible. Start failed: {e}")
        # Attempt recovery?
        page.screenshot(path="verification/failed_start.png")
        return

    found_vibe = False
    for i in range(25): # Increased limit
        print(f"Checking slide {i}...")
        try:
            # Check for Vibe Slide content
            # We look for the texts we expect in the Vibe Stack
            if page.locator("text=Vibe Stack").is_visible(timeout=500):
                print(f"Found Vibe Stack at step {i}")
                found_vibe = True
                # Wait for animations
                page.wait_for_timeout(4000)
                page.screenshot(path=os.path.join("verification", "vibe_stack.png"))
                break

            # Check if we hit summary without finding Vibe
            if page.locator("text=Grand Total").is_visible(timeout=500):
                print("Hit Summary slide without finding Vibe Stack.")
                break

            # Next slide
            page.get_by_test_id("click-next").click(force=True)

            # Instead of fixed wait, wait for some content change or just a short safety buffer
            # Since we don't know the next slide content, we can wait for the transition to likely complete
            # or try to catch the click.
            # Ideally we'd wait for the slide index to update, but we don't have access to React state here.
            # Using a slightly shorter wait as we just want to spam next until we find our slide.
            page.wait_for_timeout(500)

        except Exception as e:
            print(f"Error checking slide {i}: {e}")
            # Try clicking anyway if locator failed?
            try:
                page.get_by_test_id("click-next").click(force=True)
            except Exception as click_err:
                print(f"  Also failed to click next: {click_err}")

    if not found_vibe:
        print("Failed to locate Vibe Slide.")

    # Now navigate to Summary Slide
    if not page.locator("text=Grand Total").is_visible():
        print("Navigating to Summary Slide...")
        for i in range(10):
            if page.locator("text=Grand Total").is_visible():
                print("Found Summary Slide")
                break
            try:
                page.get_by_test_id("click-next").click(force=True)
                page.wait_for_timeout(500)
            except Exception:
                pass

    if page.locator("text=Grand Total").is_visible():
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join("verification", "summary_slide.png"))
        print("Summary slide captured.")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
