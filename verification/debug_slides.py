
from playwright.sync_api import sync_playwright, expect
import time

def debug_slides():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/StravaReview/")

        try:
            page.get_by_text("Try Demo Mode").click()
            print("Clicked Demo Mode")

            page.wait_for_timeout(2000) # Wait for demo data generation

            expect(page.get_by_text("LIFT THE CURTAIN")).to_be_visible(timeout=10000)
            page.get_by_text("LIFT THE CURTAIN").click()
            print("Started Story")

            page.wait_for_timeout(1000)

            # Dump headings of first few slides
            for i in range(20):
                # Try to find any h2
                headings = page.locator("h2").all_inner_texts()
                print(f"Slide {i} headings: {headings}")

                if "The Climb" in headings:
                    print("Found The Climb!")
                    page.screenshot(path="verification/elevation_debug.png")

                if "The Social Butterfly" in headings:
                    print("Found Social Butterfly!")
                    page.screenshot(path="verification/kudos_debug.png")

                page.keyboard.press("ArrowRight")
                page.wait_for_timeout(500)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    debug_slides()
