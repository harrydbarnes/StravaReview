
import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_story_viewer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate mobile viewport to match expected use case
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        try:
            # Wait for server
            time.sleep(5)

            # Navigate to app
            page.goto("http://localhost:5173/StravaReview/")

            # Wait for "Demo Mode" button and click it
            page.get_by_text("Try Demo Mode").click()

            # Wait for "Start the Show" button (Curtain)
            start_button = page.get_by_role("button", name="Start the Show")
            expect(start_button).to_be_visible(timeout=10000)
            start_button.click()

            # Wait for first slide content (Year) - More specific
            expect(page.get_by_text("Your Year in Activity")).to_be_visible(timeout=10000)

            # Interact with Controls (Theme)
            # Find Theme button in Controls (it has aria-label="Toggle theme")
            # Since we emulate mobile, we expect one specific instance to be visible or interactable
            # Use .first as a safe fallback if multiple are present in DOM but hidden
            theme_btn = page.get_by_role("button", name="Toggle theme").first
            expect(theme_btn).to_be_visible()

            # Take screenshot before toggle
            page.screenshot(path="verification/before_toggle.png")

            # Toggle Theme
            theme_btn.click()
            time.sleep(1) # Wait for transition

            # Take screenshot after toggle
            page.screenshot(path="verification/after_toggle.png")

            print("Verification successful: Screenshots captured.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_story_viewer()
