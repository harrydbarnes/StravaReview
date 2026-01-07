from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (using default Vite port)
        app_url = os.environ.get("APP_URL", "http://localhost:5173/")
        page.goto(app_url)

        # Wait for the landing page
        page.wait_for_selector("text=Connect with Strava")

        # Click "Try Demo Mode"
        page.click("text=Try Demo Mode")

        # Wait for StoryViewer to load (Intro Slide)
        page.wait_for_selector("text=Your Year")

        # Take screenshot of Intro Slide
        page.screenshot(path="verification/1_intro_slide.png")

        # Check for Mute button (simplified locator)
        # Matches either Mute (volume on) or Unmute (volume off) title
        mute_btn = page.locator('button[title="Mute"], button[title="Unmute"]')

        if mute_btn.count() > 0:
            print("Mute button found")
            mute_btn.click()
            # Wait for any potential state change if needed, but here it's just a toggle
            page.screenshot(path="verification/2_muted.png")
        else:
            print("Mute button NOT found")

        # Navigate to Top Sports Slide (next slide)
        # Click right side of container using relative coordinates
        # 1. Get the container element (the main viewer card)
        # Using a selector that matches the container div (it has overflow-hidden and rounded-xl usually)
        # Looking at StoryViewer.jsx, the container has `md:w-[400px]` and relative positioning.
        # A good unique hook might be the progress bars container which is inside it, or just target the center div.
        # Let's target the slide content area which has the click handler.

        # We can find the element that wraps the slide content.
        # It has `onClick={handleTap}` in the source.
        # In the rendered DOM, it's the div inside the main container.
        # Let's just target the main visible card.
        # The text "Your Year" is inside the slide container.

        intro_text = page.locator("text=Your Year")
        # Go up to the slide container (flex-1)
        slide_container = intro_text.locator("..").locator("..")
        # Note: Playwright locators are strict.
        # Let's instead just click the right side of the page body for mobile emulation,
        # or specifically the centered card for desktop.

        # Better approach: Get the viewport size or the container bounding box if we can identify it.
        # The container has class `flex-col` and `md:w-[400px]`.

        # Let's assume the user is clicking the right side of the screen as it's full width on mobile view default,
        # or centered on desktop.

        # We can use page.viewport_size to calculate.
        vp = page.viewport_size
        width = vp['width']
        height = vp['height']

        # Click at 85% width, 50% height
        page.mouse.click(width * 0.85, height * 0.5)

        # Wait for Top Sports title to confirm navigation
        # This replaces the brittle fixed timeout
        page.wait_for_selector("text=Your Top Sports", timeout=10000)

        print("Navigated to Top Sports")

        # Wait for the first sport to appear (checking for #1)
        # This confirms the delay/stagger logic is working if we were timing it,
        # but for verification we just want to ensure it eventually appears.
        page.wait_for_selector("text=#1", timeout=10000)

        page.screenshot(path="verification/4_top_sports_revealed.png")
        print("Top sports revealed")

        browser.close()

if __name__ == "__main__":
    verify_app()
