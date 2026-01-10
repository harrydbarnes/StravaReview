
from playwright.sync_api import sync_playwright, expect

def verify_story_viewer_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport to ensure consistent layout
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173/StravaReview/")

            # Wait for app to load
            expect(page.get_by_role("heading", name="STRAVA WRAPPED")).to_be_visible()

            # 2. Start Demo Mode (App level)
            page.get_by_role("button", name="Try Demo Mode").click()

            # Wait for StoryViewer to mount and show the Curtain
            start_button = page.get_by_role("button", name="Start the Show")
            expect(start_button).to_be_visible(timeout=10000)

            # 3. Lift the Curtain (StoryViewer level)
            start_button.click()

            # Wait for the curtain to lift (Start button should disappear)
            expect(start_button).to_be_hidden(timeout=5000)

            # Verify we are on Slide 1 (using aria-selected="true")
            slide_1_tab = page.get_by_role("tab", name="Go to slide 1", exact=True)
            expect(slide_1_tab).to_be_visible()
            expect(slide_1_tab).to_have_attribute("aria-selected", "true")

            # 4. Test Spacebar Pause
            print("Pressing Space to PAUSE...")
            page.keyboard.press(" ")

            # Wait 6 seconds (Slide 1 duration is 5s). If not paused, it would advance.
            print("Waiting 6s to verify pause...")
            page.wait_for_timeout(6000)

            # Verify we are STILL on Slide 1
            expect(slide_1_tab).to_have_attribute("aria-selected", "true")
            print("Pause confirmed: Still on Slide 1")

            # 5. Test Spacebar Resume
            print("Pressing Space to RESUME...")
            page.keyboard.press(" ")

            # It should now advance to Slide 2.
            # Since we waited 6s (which is > 5s), but we were paused, the timer should resume.
            # Actually, `setTimeout` in React pauses?
            # Looking at the code:
            # useEffect(() => { ... const timer = setTimeout(handleNext, currentDuration); ... }, [currentIndex, isPaused])
            # When `isPaused` changes to true, the effect cleans up (clearTimeout).
            # When `isPaused` changes to false, the effect re-runs and sets a NEW timer for `currentDuration`.
            # So it will wait another full 5000ms.

            print("Waiting for advance to Slide 2...")
            # We expect it to advance in ~5s. giving it 7s buffer.
            slide_2_tab = page.get_by_role("tab", name="Go to slide 2", exact=True)
            expect(slide_2_tab).to_have_attribute("aria-selected", "true", timeout=7000)
            print("Resume confirmed: Advanced to Slide 2")

            # 6. Test Keyboard Navigation (Right Arrow)
            print("Pressing ArrowRight...")
            page.keyboard.press("ArrowRight")

            # Verify we moved to slide 3
            slide_3_tab = page.get_by_role("tab", name="Go to slide 3", exact=True)
            expect(slide_3_tab).to_have_attribute("aria-selected", "true", timeout=2000)
            print("Moved to Slide 3")

            # 7. Test Keyboard Navigation (Left Arrow)
            print("Pressing ArrowLeft...")
            page.keyboard.press("ArrowLeft")

            # Verify we moved back to slide 2
            expect(slide_2_tab).to_have_attribute("aria-selected", "true", timeout=2000)
            print("Moved back to Slide 2")

            # 8. Take Screenshot
            page.screenshot(path="verification/story_viewer_nav.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_story_viewer_navigation()
