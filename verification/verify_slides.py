
import os
from playwright.sync_api import sync_playwright

def verify_slides():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate mobile to match the typical view of this app
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173/StravaReview/")

        # Wait for the app to load
        page.wait_for_timeout(2000)

        # We need to simulate the flow to get to the Summary slide where CountUp is used
        # or verify specific components. The CountUp component is used in SummarySlide.
        # But we don't have real data easily injected without mocking.
        # However, checking the rendered text in a "Demo" mode if available would be good.
        # Assuming there is a demo mode or we can see the Intro slide.

        # Let's try to click "View Demo" if it exists, or just verify the Intro slide loads.
        try:
             demo_button = page.get_by_role("button", name="View Demo")
             if demo_button.is_visible():
                 demo_button.click()
                 page.wait_for_timeout(5000) # Wait for processing
        except:
             print("No demo button found or error clicking it")

        # Take a screenshot
        page.screenshot(path="verification/screenshot.png")
        browser.close()

if __name__ == "__main__":
    verify_slides()
