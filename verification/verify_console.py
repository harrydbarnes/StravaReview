from playwright.sync_api import sync_playwright
import time

def verify_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        print("Navigating...")
        page.goto("http://localhost:5173/StravaReview/")

        print("Clicking Demo Mode...")
        page.click("text=Try Demo Mode")

        print("Waiting for Intro Slide...")
        try:
            page.wait_for_selector("text=Your Year", timeout=10000)
            print("Intro slide found in DOM.")

            # Check visibility and styles
            time.sleep(2) # Wait for animation
            opacity = page.locator("text=Your Year").evaluate("el => getComputedStyle(el).opacity")
            print(f"Intro text opacity: {opacity}")

            bbox = page.locator("text=Your Year").bounding_box()
            print(f"Intro text bounding box: {bbox}")

            # Check container
            container_visible = page.locator(".fixed.inset-0").is_visible()
            print(f"StoryViewer container visible: {container_visible}")

            page.screenshot(path="verification/debug_intro.png")

        except Exception as e:
            print(f"Intro slide failed: {e}")
            page.screenshot(path="verification/debug_fail.png")

        browser.close()

if __name__ == "__main__":
    verify_console()
