from playwright.sync_api import sync_playwright, expect
import os

def test_summary_slide_changes(page):
    base_url = os.getenv('BASE_URL', "http://localhost:5173")
    page.goto(base_url)

    # Act
    page.get_by_role("button", name="Try Demo Mode").click()
    expect(page.get_by_role("heading", name="LIFT THE CURTAIN ON YOUR YEAR")).to_be_visible(timeout=10000)
    page.get_by_role("button", name="Start the Show").click()
    expect(page.get_by_role("heading", name="Your Year in Activity")).to_be_visible()

    theme_btn = page.get_by_label("Toggle theme").first
    theme_btn.click()
    expect(page.locator('.bg-white').first).to_be_visible()
    theme_btn.click()
    expect(page.locator('.bg-brand-orange').first).to_be_visible()

    # Navigate to Summary
    found_summary = False
    for _ in range(30):
        if page.get_by_role("heading", name="Grand Total").is_visible():
            found_summary = True
            break

        page.locator('[data-testid="click-next"]').click(force=True)
        # Instead of fixed wait, maybe wait for a change?
        # But simple loop with check is robust enough if we don't click insanely fast
        page.wait_for_timeout(300)

    if not found_summary:
        raise Exception("Could not reach Summary Slide")

    expect(page.get_by_role("heading", name="Grand Total")).to_be_visible()

    wrapped_text = page.get_by_text("WRAPPED")
    expect(wrapped_text).to_have_css("color", "rgb(122, 3, 252)") # #7A03FC

    print("Verified Summary Slide 'WRAPPED' text color in Orange theme.")
    page.screenshot(path="verification/summary_slide_theme_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        headless = os.getenv('HEADLESS', 'true').lower() == 'true'
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            test_summary_slide_changes(page)
        finally:
            browser.close()
