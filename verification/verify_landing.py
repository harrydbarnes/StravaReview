from playwright.sync_api import sync_playwright

def verify_landing(page, name):
    print(f"Verifying {name}...")
    page.goto("http://localhost:5173/StravaReview/")

    # Click Try Demo Mode
    try:
        page.get_by_role("button", name="Try Demo Mode").click()
    except Exception as e:
        print(f"Error clicking button: {e}")
        # Debug screenshot
        page.screenshot(path=f"debug_{name}.png")
        raise e

    # Wait for the curtain text
    print("Waiting for curtain text...")
    try:
        page.wait_for_selector("text=LIFT THE CURTAIN ON YOUR YEAR", timeout=10000)
    except Exception as e:
        print(f"Error waiting for text: {e}")
        page.screenshot(path=f"/home/jules/verification/debug_{name}.png")
        raise e

    # Wait a bit for animations if any
    page.get_by_role("button", name="Start the Show").wait_for(state="visible")

    page.screenshot(path=f"/home/jules/verification/landing_{name}.png")
    print(f"Screenshot saved to /home/jules/verification/landing_{name}.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            # Desktop
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            verify_landing(page, "desktop")
            page.close()

            # Mobile (iPhone 12/13/14ish dimensions)
            page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            verify_landing(page, "mobile")
            page.close()
        finally:
            browser.close()
