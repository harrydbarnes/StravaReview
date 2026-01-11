
import time
from playwright.sync_api import sync_playwright, expect

def verify_setup_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to the app (ensure server is running on 5173 or check log)
        try:
            page.goto("http://localhost:5173/StravaReview/", timeout=10000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            # Try alternate port if needed, but 5173 is standard Vite
            page.goto("http://localhost:3000/StravaReview/")

        # 2. Verify "Help!" button has aria-haspopup
        help_btn = page.get_by_role("button", name="Help!")
        expect(help_btn).to_be_visible()
        expect(help_btn).to_have_attribute("aria-haspopup", "dialog")
        expect(help_btn).to_have_attribute("title", "Get help with setup")

        # 3. Verify Client ID input has inputMode="numeric"
        client_id_input = page.locator("#client-id")
        expect(client_id_input).to_be_visible()
        expect(client_id_input).to_have_attribute("inputmode", "numeric")
        expect(client_id_input).to_have_attribute("pattern", "[0-9]*")

        # 4. Open "Help!" modal
        help_btn.click()

        # 5. Verify Modal Close button
        modal_close_btn = page.get_by_role("button", name="Close")
        expect(modal_close_btn).to_be_visible()
        expect(modal_close_btn).to_have_attribute("title", "Close")

        # 6. Verify Copy button
        # Note: "Copy callback domain to clipboard" is the aria-label I added
        copy_btn = page.get_by_label("Copy callback domain to clipboard")
        expect(copy_btn).to_be_visible()

        # Take screenshot of the modal open
        page.screenshot(path="verification/setup_modal.png")
        print("Verification successful! Screenshot saved to verification/setup_modal.png")

        browser.close()

if __name__ == "__main__":
    verify_setup_ux()
