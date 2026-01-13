from playwright.sync_api import sync_playwright, expect
import time

def verify_viewport(playwright, viewport, name):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport=viewport)
    page = context.new_page()

    try:
        print(f"Testing {name}...")
        url = "http://localhost:5174/StravaReview/"
        page.goto(url)

        page.get_by_text("Try Demo Mode").click()

        curtain = page.get_by_text("LIFT THE CURTAIN ON YOUR YEAR")
        expect(curtain).to_be_visible(timeout=10000)

        page.get_by_text("Start the Show").click()

        # Wait for curtain to go away
        expect(curtain).to_be_hidden()

        # Wait for Intro Slide
        # Using heading role for specificity
        expect(page.get_by_role("heading", name="Your Year in Activity")).to_be_visible()

        page.wait_for_timeout(2000)

        # Go to next slide (PercentSlide)
        width = viewport['width']
        height = viewport['height']
        page.mouse.click(width * 0.9, height / 2)

        # Wait for "Life in Motion"
        expect(page.get_by_text("Life in Motion")).to_be_visible(timeout=10000)

        page.wait_for_timeout(2000)

        path = f"/app/verification/header_{name}.png"
        page.screenshot(path=path)
        print(f"Saved {path}")

    except Exception as e:
        print(f"Error in {name}: {e}")
        try:
            page.screenshot(path=f"/app/verification/error_{name}.png")
        except:
            pass
        raise e
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        verify_viewport(playwright, {'width': 375, 'height': 812}, "mobile")
        verify_viewport(playwright, {'width': 1280, 'height': 800}, "desktop")
