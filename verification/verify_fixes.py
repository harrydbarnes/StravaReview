from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        # Note: The base URL might need to be adjusted if vite config defines a base.
        # The grep output showed http://localhost:5173/StravaReview/
        page.goto("http://localhost:5173/StravaReview/")

        # 1. Verify body background color style
        # The user requested: <body ... style="background-color: #000000;">
        body = page.locator("body")
        # Playwright might normalize style strings, so we check if it contains the color
        style_attr = body.get_attribute("style")
        if "background-color: #000000" in style_attr or "background-color: rgb(0, 0, 0)" in style_attr:
             print(f"Verified body background-color style: {style_attr}")
        else:
             print(f"FAILURE: Body style not correct. Found: {style_attr}")
             exit(1)

        # 2. Verify Client ID input does not have autofocus
        # Wait for the input to appear (it might be inside Suspense or conditionally rendered)
        client_id_input = page.locator("#client-id")
        try:
            expect(client_id_input).to_be_visible(timeout=10000)
        except:
             print("FAILURE: Client ID input not found or not visible.")
             # Capture screenshot for debug
             page.screenshot(path="verification/debug_failure.png")
             exit(1)

        # Check if it is focused.
        # React's autoFocus happens on mount.
        # We wait a brief moment to be sure.
        time.sleep(1)

        is_focused = page.evaluate("document.activeElement === document.getElementById('client-id')")

        if is_focused:
            print("FAILURE: Client ID input is focused!")
            page.screenshot(path="verification/focus_failure.png")
            exit(1)
        else:
            print("Verified Client ID input is NOT focused.")

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved to verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
