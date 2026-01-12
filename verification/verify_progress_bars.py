import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_progress_bars():
    with sync_playwright() as p:
        # Check if HEADLESS env var is set to false (string) to run headed
        is_headless = os.getenv('HEADLESS', 'true').lower() == 'true'
        browser = p.chromium.launch(headless=is_headless)

        # Use a mobile-like viewport to ensure we test responsive behavior if needed,
        # but desktop is fine for checking progress bar presence.
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Check if BASE_URL env var is set, otherwise default to localhost:5173
        base_url = os.getenv('BASE_URL', 'http://localhost:5173')

        try:
            print(f"Navigating to {base_url}")
            page.goto(base_url)

            # 1. Wait for "Try Demo Mode" button and click it
            demo_btn = page.get_by_text("Try Demo Mode")
            demo_btn.wait_for(state="visible", timeout=10000)
            demo_btn.click()

            # 2. Wait for loading to finish and "Start the Show" curtain
            print("Waiting for Start the Show button...")
            start_btn = page.get_by_text("Start the Show")
            start_btn.wait_for(state="visible", timeout=30000)

            # 3. Click Start
            start_btn.click()

            # 4. Verify StoryViewer is active and Progress Bars are present
            # The progress bars container has aria-label="Slides navigation"
            print("Verifying progress bars...")
            nav_container = page.locator('[aria-label="Slides navigation"]')
            expect(nav_container).to_be_visible()

            # Check we have multiple progress bars (buttons)
            bars = nav_container.locator('button')
            count = bars.count()
            print(f"Found {count} progress bars")
            assert count > 0, "No progress bars found"

            # 5. Take Screenshot
            # Wait for the first progress bar (active) to have non-zero width
            # The progress bar is a div inside the button.
            active_bar = bars.nth(0).locator('div')

            # Wait function to check if width style is not 0% or computed width > 0
            # We can check bounding box width
            print("Waiting for animation to start...")
            page.wait_for_function(
                """(element) => {
                    const rect = element.getBoundingClientRect();
                    return rect.width > 0;
                }""",
                arg=active_bar.element_handle()
            )

            screenshot_path = "verification/progress_bars.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_progress_bars()
