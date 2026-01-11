
import time
from playwright.sync_api import sync_playwright, expect

def verify_setup_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to the app (ensure server is running on 5173 or check log)
        navigated = False
        for port in ("5173", "3000"):
            try:
                page.goto(f"http://localhost:{port}/StravaReview/", timeout=5000)
                print(f"Successfully connected to the app on port {port}")
                navigated = True
                break
            except Exception:
                print(f"Could not connect to the app on port {port}. Trying next...")

        if not navigated:
            print("Failed to connect to the application. Please ensure the dev server is running.")
            browser.close()
            return

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
