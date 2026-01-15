
from playwright.sync_api import sync_playwright, expect

def run(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173/StravaReview/")

    # 1. Enter Demo Mode
    print("Clicking Demo Mode...")
    page.get_by_text("Try Demo Mode").click()

    # 2. Verify Intro Slide (LIFT THE CURTAIN)
    print("Waiting for Curtain...")
    heading = page.get_by_role("heading", name="LIFT THE CURTAIN ON YOUR YEAR")
    expect(heading).to_be_visible(timeout=10000)

    page.screenshot(path="verification/screenshot_1_curtain_initial.png")
    print("Screenshot 1 taken: Curtain Initial")

    # 3. Start Show to see Pause Button
    print("Starting show...")
    page.get_by_text("Start the Show").click()

    # Wait for Curtain to exit (animation duration ~1.2s + delay)
    # The pause button is on Slide 0.
    # We should wait for the pause button to be visible.
    print("Waiting for Pause Button...")
    pause_btn = page.get_by_text("PAUSE")
    expect(pause_btn).to_be_visible(timeout=10000)

    print("Pause Button visible. Waiting 3 seconds for auto-hide...")
    page.wait_for_timeout(3000)

    # It should be hidden (moved down).
    page.screenshot(path="verification/screenshot_2_pause_hidden.png")
    print("Screenshot 2 taken: Pause Hidden")

    # 4. Bring it back
    print("Clicking Trigger Zone...")
    # Trigger zone has role="button" aria-label="Show controls"
    # It might be tricky if "click-next" overlay covers it?
    # StoryViewer has:
    # {hasStarted && <div className="absolute inset-0 z-10 flex pointer-events-none">...</div>}
    # Pause Button container is z-40. Trigger Zone is z-0 relative to that container?
    # Container: <div className="pb-safe md:pb-12 flex justify-center pointer-events-auto relative">
    #   Trigger Zone: z-0
    #   Button: z-10
    # The Container is inside: <div className="absolute inset-0 pointer-events-none z-40 ...">
    # So Trigger Zone is effectively z-40 context.
    # The "click-next" overlay is z-10.
    # So Trigger Zone (z-40) should be on top of click overlays (z-10).
    # So it should be clickable.

    page.get_by_role("button", name="Show controls").click()

    # Wait for animation
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshot_3_pause_reshown.png")
    print("Screenshot 3 taken: Pause Re-shown")

    # 5. Go to PercentSlide
    print("Navigating to PercentSlide...")
    page.keyboard.press("ArrowRight")

    # Wait for "Life in Motion"
    expect(page.get_by_role("heading", name="Life in Motion")).to_be_visible()

    # Wait for content
    page.wait_for_timeout(2000)

    page.screenshot(path="verification/screenshot_4_percent_slide.png")
    print("Screenshot 4 taken: PercentSlide")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 393, "height": 852}) # Pixel-ish mobile viewport
        try:
            run(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()
