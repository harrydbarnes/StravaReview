import os
import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to match likely use case, or desktop
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            # Go to the app
            page.goto("http://localhost:3000")

            # Wait for the "Help!" button and click it
            # It's inside the "needsCreds" block which appears by default since env vars are missing
            help_button = page.get_by_role("button", name="Help!")
            expect(help_button).to_be_visible(timeout=10000)
            help_button.click()

            # Wait for modal
            modal = page.get_by_role("dialog", name="How to Connect Strava")
            expect(modal).to_be_visible()

            # Find the copy button
            # It has aria-label "Copy domain to clipboard"
            copy_button = page.get_by_role("button", name="Copy domain to clipboard")
            expect(copy_button).to_be_visible()

            # Take a screenshot of the modal with the button
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
