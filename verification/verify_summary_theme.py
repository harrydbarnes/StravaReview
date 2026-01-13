from playwright.sync_api import sync_playwright, expect
import os

def test_summary_slide_changes(page):
    # 1. Arrange: Go to the app
    # Use BASE_URL env var if available, else localhost
    base_url = os.getenv('BASE_URL', "http://localhost:5173")
    page.goto(base_url)

    # 2. Act: Click "Try Demo Mode" to load the app with demo data
    page.get_by_role("button", name="Try Demo Mode").click()

    # Wait for the "LIFT THE CURTAIN" screen
    expect(page.get_by_role("heading", name="LIFT THE CURTAIN ON YOUR YEAR")).to_be_visible(timeout=10000)

    # Click "Start the Show"
    page.get_by_role("button", name="Start the Show").click()

    # Wait for the first slide content to appear (Your Year in Activity)
    expect(page.get_by_role("heading", name="Your Year in Activity")).to_be_visible()

    # Use locator for theme button
    theme_btn = page.get_by_label("Toggle theme").first
    expect(theme_btn).to_be_visible()

    # Check Black Theme (Default)
    # Verify some default state if needed, or just switch to Orange

    # Switch to White
    theme_btn.click()
    # Wait for background change
    expect(page.locator('.bg-white').first).to_be_visible()

    # Switch to Orange
    theme_btn.click()
    # Wait for background change
    expect(page.locator('.bg-brand-orange').first).to_be_visible()

    # Now we need to navigate to the last slide.
    # We loop until we find "Grand Total"
    found_summary = False
    for _ in range(30):
        if page.get_by_role("heading", name="Grand Total").is_visible():
            found_summary = True
            break

        # Click next using the robust test id
        page.locator('[data-testid="click-next"]').click(force=True)
        # Small wait for transition
        page.wait_for_timeout(300) # Short wait for animation start is acceptable in loop

    if not found_summary:
        raise Exception("Could not reach Summary Slide")

    expect(page.get_by_role("heading", name="Grand Total")).to_be_visible()

    # 3. Assert:
    # Check text color of "WRAPPED" in Orange theme.
    # #7A03FC -> rgb(122, 3, 252)
    wrapped_text = page.get_by_text("WRAPPED")
    expect(wrapped_text).to_have_css("color", "rgb(122, 3, 252)")

    print("Verified Summary Slide 'WRAPPED' text color in Orange theme.")

    # Take screenshot
    page.screenshot(path="verification/summary_slide_theme_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Respect HEADLESS env var
        headless = os.getenv('HEADLESS', 'true').lower() == 'true'
        browser = p.chromium.launch(headless=headless)
        # Mobile viewport similar to verification scripts or desktop?
        # The previous scripts used 1280x720, but StoryViewer is often mobile-first.
        # Using 1280x720 as per original script.
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            test_summary_slide_changes(page)
        finally:
            browser.close()
