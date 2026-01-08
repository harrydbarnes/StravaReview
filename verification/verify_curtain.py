from playwright.sync_api import sync_playwright

def verify_curtain(page):
    page.goto(os.environ.get("E2E_TARGET_URL", "http://localhost:5173/StravaReview/"))

    # Click "Try Demo Mode"
    page.get_by_text("Try Demo Mode").click()

    # Wait for the text to appear (Story Viewer curtain)
    page.wait_for_selector("text=LIFT THE CURTAIN ON YOUR YEAR", timeout=10000)

    # Take a deterministic screenshot by disabling animations, avoiding flaky waits.
    page.screenshot(path="verification/curtain.png", animations="disabled")
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_curtain(page)
        except Exception as e:
            print(f"Failed: {e}")
        finally:
            browser.close()
