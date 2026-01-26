from playwright.sync_api import sync_playwright, expect
import time

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/StravaReview/")

        # Click "Try Demo Mode"
        print("Clicking Demo Mode...")
        page.get_by_role("button", name="Try Demo Mode").click()

        # Wait for "Your Year in Activity" (IntroSlide)
        print("Waiting for intro...")
        # Intro slide appears after 0.8s animation
        expect(page.get_by_text("Your Year")).to_be_visible(timeout=20000)

        print("Starting the show...")
        # The "Start the Show" button is in the curtain overlay
        try:
             start_btn = page.get_by_role("button", name="Start the Show")
             if start_btn.is_visible():
                 start_btn.click()
                 print("Clicked Start Show")
                 time.sleep(2) # Wait for curtain exit
        except:
             print("Start button not found or already started")

        page.screenshot(path="verification/01_intro.png")

        def next_slide():
            # Click the right side of the screen
            page.mouse.click(350, 333) # Right side
            time.sleep(1.0) # Wait for transition

        targets = [
            "What Was This One, BTW?",
            "Slow and Steady",
            "Clockwatcher",
            "LA 2028 Calling?",
            "You Tried Something New",
            "STRAVA WRAPPED"
        ]

        found = set()

        for i in range(30):
            content = page.content()

            for target in targets:
                if target in content and target not in found:
                    print(f"Found {target}!")
                    found.add(target)
                    time.sleep(1) # Let animations run a bit

                    if target == "Clockwatcher":
                        if "Early Bird" in page.content() or "Night Owl" in page.content():
                            print(" - Verified Clockwatcher stats present")
                        else:
                            print(" - WARNING: Clockwatcher stats NOT found")

                    if target == "LA 2028 Calling?":
                        text_content = page.locator("body").inner_text()
                        if "Olympic Pool lengths" in text_content or "laps of Olympic track" in text_content:
                             print(" - Verified Olympic stats present")

                    if target == "You Tried Something New":
                        if page.get_by_text("View on Strava").is_visible():
                            print(" - Verified View on Strava button")
                        else:
                            print(" - WARNING: View on Strava button NOT found")

                    if target == "STRAVA WRAPPED":
                         if "DEMOUSER" in page.locator("body").inner_text().upper() or "DEMO RUNNER" in page.locator("body").inner_text().upper():
                             print(" - Verified Username present")
                         else:
                             print(" - WARNING: Username NOT found")

                    safe_name = target.replace("?", "").replace(" ", "_").replace(",", "").lower()
                    page.screenshot(path=f"verification/slide_{safe_name}.png")

            if len(found) == len(targets):
                print("Found all targets!")
                break

            next_slide()

        browser.close()

if __name__ == "__main__":
    verify_app()
