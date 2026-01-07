from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (using default Vite port)
        page.goto("http://localhost:5173/")

        # Wait for the landing page
        page.wait_for_selector("text=Connect with Strava")

        # Click "Try Demo Mode"
        page.click("text=Try Demo Mode")

        # Wait for StoryViewer to load (Intro Slide)
        page.wait_for_selector("text=Your Year")

        # Wait a bit for animations
        page.wait_for_timeout(4000)

        # Take screenshot of Intro Slide
        page.screenshot(path="verification/1_intro_slide.png")

        # Check for Mute button
        # Assuming Volume2 or VolumeX icon is rendered inside a button
        # We can check for the button with title "Mute" or "Unmute"
        mute_btn = page.locator('button[title="Mute"]')
        if mute_btn.count() == 0:
            print("Mute button not found initially (might be Unmute)")
            mute_btn = page.locator('button[title="Unmute"]')

        if mute_btn.count() > 0:
            print("Mute button found")
            mute_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/2_muted.png")
        else:
            print("Mute button NOT found")

        # Navigate to Top Sports Slide (next slide)
        # Click right side of container
        # The container is roughly full width.
        # We can simulate click on right side.
        page.mouse.click(600, 300) # Right side

        # Wait for Top Sports title
        page.wait_for_selector("text=Your Top Sports")

        # Wait 3s (DRAMATIC_DELAY) + some stagger
        page.wait_for_timeout(1000) # Should be empty or starting
        page.screenshot(path="verification/3_top_sports_start.png")

        page.wait_for_timeout(3000) # Should show first
        page.screenshot(path="verification/4_top_sports_revealed.png")

        browser.close()

if __name__ == "__main__":
    verify_app()
