from playwright.sync_api import sync_playwright, expect
import time

def verify_slides():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={'width': 412, 'height': 915})
        page = context.new_page()

        try:
            page.goto("http://localhost:5173/StravaReview/")

            # Click Demo Mode
            print("Clicking Demo Mode...")
            page.get_by_text("Try Demo Mode").click()

            # Wait for Curtain
            print("Waiting for Curtain...")
            page.get_by_role("button", name="Start the Show").wait_for(state="visible")

            # Click "Start the Show"
            print("Clicking Start the Show...")
            page.get_by_role("button", name="Start the Show").click()

            # Wait for curtain exit animation (approx 2s)
            page.wait_for_timeout(2000)

            # Slides we want to capture
            slides_to_capture = {
                "Life in Motion": "01_percent.png",
                "The Climb": "02_elevation.png",
                "The Consistent Cruiser": "03_pace.png",
                "Slow and Steady": "04_slowest.png",
                "You Tried Something New": "05_new_activity.png",
                "Your Favourite Playground": "06_location.png",
                "Time Well Spent": "07_fun_stats.png",
                "The Crowd Went Wild": "08_spotlight.png",
                "LA 2028 Calling?": "09_olympics.png",
                "Peak Performance Months": "10_top_months.png",
                "STRAVA": "11_summary.png" # STRAVA WRAPPED
            }

            captured = set()

            # Navigate through slides
            max_slides = 30
            for i in range(max_slides):
                # Get visible header
                try:
                    # Look for h1 or h2 that is visible
                    # We use a broad locator and filter for visibility
                    headers = page.locator("h1, h2")
                    current_header = ""

                    # Iterate to find the visible one
                    count = headers.count()
                    for j in range(count):
                        h = headers.nth(j)
                        if h.is_visible():
                            current_header = h.inner_text()
                            break

                    print(f"Slide {i}: Header '{current_header.replace(chr(10), ' ')}'")

                    # Normalization for matching
                    match_key = None
                    for key in slides_to_capture:
                        if key.upper() in current_header.upper().replace("\n", " "):
                            match_key = key
                            break

                    if match_key and match_key not in captured:
                        print(f"Capturing {match_key}...")
                        page.wait_for_timeout(3000) # Wait for full animation
                        page.screenshot(path=f"verification/{slides_to_capture[match_key]}")
                        captured.add(match_key)

                    # Check if we are at the end (Summary slide)
                    if "STRAVA" in current_header.upper() and "WRAPPED" in current_header.upper():
                        print("Reached Summary Slide")
                        # Take one last screenshot to be sure
                        page.wait_for_timeout(3000)
                        page.screenshot(path="verification/11_summary_final.png")
                        break

                except Exception as e:
                    print(f"Error checking slide: {e}")

                # Next slide
                page.keyboard.press("ArrowRight")
                page.wait_for_timeout(1000)

        except Exception as e:
            print(f"Script error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    verify_slides()
