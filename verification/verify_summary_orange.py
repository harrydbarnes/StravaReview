from playwright.sync_api import sync_playwright, expect
import os

def test_summary_slide_changes(page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:5173")

    # 2. Act: Click "Try Demo Mode" to load the app with demo data
    page.get_by_role("button", name="Try Demo Mode").click()

    # Wait for the "LIFT THE CURTAIN" screen
    expect(page.get_by_role("heading", name="LIFT THE CURTAIN ON YOUR YEAR")).to_be_visible(timeout=10000)

    # Click "Start the Show"
    page.get_by_role("button", name="Start the Show").click()

    # Wait for the first slide content to appear (Your Year in Activity)
    # Use exact match or heading role to avoid ambiguity
    expect(page.get_by_role("heading", name="Your Year in Activity")).to_be_visible()

    # Wait for buttons to be interactable
    page.wait_for_timeout(1000)

    theme_btn = page.get_by_label("Toggle theme").first
    expect(theme_btn).to_be_visible()

    # Initial: Black
    theme_btn.click() # -> White
    page.wait_for_timeout(500)
    theme_btn.click() # -> Orange
    page.wait_for_timeout(500)

    # Now we need to navigate to the last slide.
    for _ in range(20):
        # Check if we are on the summary slide
        # We look for "Grand Total" heading which is specific to SummarySlide
        if page.get_by_role("heading", name="Grand Total").is_visible():
            break

        # Click next
        next_zone = page.locator('[data-testid="click-next"]')
        if next_zone.is_visible():
            next_zone.click(force=True)
        else:
            page.mouse.click(800, 300)

        page.wait_for_timeout(500)

    expect(page.get_by_role("heading", name="Grand Total")).to_be_visible()

    # 3. Assert:
    # Check text color of "WRAPPED".
    wrapped_text = page.get_by_text("WRAPPED")
    expect(wrapped_text).to_have_css("color", "rgb(122, 3, 252)")

    # Take screenshot
    page.screenshot(path="verification/summary_slide_orange.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            test_summary_slide_changes(page)
        finally:
            browser.close()
