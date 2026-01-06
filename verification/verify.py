from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for the server to be ready
            page.goto("http://localhost:5173/StravaReview/")

            # Wait for the main text to be visible
            page.wait_for_selector(f"text=See your {__import__('datetime').date.today().year - 1} year in review")

            # Take a screenshot of the landing page
            page.screenshot(path="verification/landing_page.png")
            print("Landing page screenshot taken.")

            # Test Demo Mode
            page.click("text=Try Demo Mode")

            # Wait for demo data generation and viewer to start
            # The viewer usually has a close button or some identifiable element
            # Assuming 'StoryViewer' renders something distinct.
            # From reading the code, it renders slides. The first slide is IntroSlide.
            # Let's wait for a generic element that might appear in IntroSlide.
            # Or just wait for the 'StoryViewer' container if it has a class.

            # Waiting for the loader to disappear might be good enough for this quick check,
            # or checking for the absence of the landing page text.
            page.wait_for_selector(".w-8.h-8", state="detached") # Wait for spinner to disappear

            # Take another screenshot of the demo mode
            # Giving it a second to render animation
            page.wait_for_timeout(2000)
            page.screenshot(path="verification/demo_mode.png")
            print("Demo mode screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
