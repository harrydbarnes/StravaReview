
from playwright.sync_api import sync_playwright, expect
import os

def verify_setup_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173/StravaReview/")

        # In App.jsx, the help button has text "Help!"
        # <button ...> <HelpCircle size={14} /> Help! </button>

        # Click the "Help!" button
        page.get_by_role("button", name="Help!").click()

        # Wait for modal to appear
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_text("How to Connect Strava")).to_be_visible()

        # Find the copy button
        # The copy button has aria-label="Copy domain to clipboard"
        copy_button = page.get_by_label("Copy domain to clipboard")

        # Click copy
        copy_button.click()

        # Verify visual feedback
        # The component doesn't change aria-label immediately, but we can verify execution
        # Let's wait a bit and assume if no crash it works.
        # We can also check if the check icon is present.
        # The Check icon is rendered when 'copied' is true.
        # We can try to locate the Check icon, but it has no accessible name unless we check the class or svg.
        # Actually the button contents change.
        # Before: hostname + Copy icon
        # After: hostname + Check icon

        # We can take a screenshot which is the main goal.
        # Wait for the "Check" icon to appear to confirm the copy action.
        expect(copy_button.locator("svg.text-green-400")).to_be_visible()

        # Take a screenshot of the modal with the checkmark (or at least the modal open)
        page.screenshot(path="verification/setup_modal_copied.png")

        print("Screenshot taken: verification/setup_modal_copied.png")

        browser.close()

if __name__ == "__main__":
    verify_setup_modal()
