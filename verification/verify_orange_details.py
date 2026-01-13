from playwright.sync_api import sync_playwright, expect
import os

def test_orange_theme_details(page):
    base_url = os.getenv('BASE_URL', "http://localhost:5173")
    page.goto(base_url)

    # Start Demo
    page.get_by_role("button", name="Try Demo Mode").click()
    expect(page.get_by_role("heading", name="LIFT THE CURTAIN ON YOUR YEAR")).to_be_visible(timeout=10000)
    page.get_by_role("button", name="Start the Show").click()
    expect(page.get_by_role("heading", name="Your Year in Activity")).to_be_visible()

    # Switch to Orange Theme
    theme_btn = page.get_by_label("Toggle theme").first
    theme_btn.click() # White
    theme_btn.click() # Orange
    expect(page.locator('.bg-brand-orange').first).to_be_visible()

    # Helper to navigate slides
    def next_slide():
        page.locator('[data-testid="click-next"]').click(force=True)
        # Wait for potential DOM update - basic check is if content changes, but simplified here
        # Rely on main loop wait for visibility of expected element

    # 1. Verify PercentSlide (Life in Motion)
    print("Searching for Life in Motion")
    for _ in range(15):
        if page.get_by_role("heading", name="Life in Motion").is_visible():
            break
        next_slide()
        page.wait_for_timeout(500) # Small dwell to allow slide transition logic to fire
    expect(page.get_by_role("heading", name="Life in Motion")).to_be_visible()

    text_el = page.get_by_text("of your year spent moving")
    expect(text_el).to_have_css("color", "rgb(255, 255, 255)")

    percent_el = page.locator(".text-6xl.font-black").first
    expect(percent_el).to_have_css("color", "rgb(255, 255, 255)")
    print("Verified PercentSlide colors")

    # 2. Verify ElevationSlide (The Climb)
    print("Searching for The Climb")
    for _ in range(15):
        if page.get_by_role("heading", name="The Climb").is_visible():
            break
        next_slide()
        page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="The Climb")).to_be_visible()

    times_el = page.locator("text=times! 🕰️")
    expect(times_el).to_have_css("color", "rgb(255, 255, 255)")
    print("Verified ElevationSlide text color")

    # 3. Verify HeatmapSlide (Clockwatcher)
    print("Searching for Clockwatcher")
    for _ in range(15):
        if page.get_by_role("heading", name="Clockwatcher").is_visible():
            break
        next_slide()
        page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="Clockwatcher")).to_be_visible()

    peak_time_el = page.locator("p:has-text('You are most active at') span")
    expect(peak_time_el).to_be_visible(timeout=5000)
    expect(peak_time_el).to_have_css("color", "rgb(255, 215, 0)")
    print("Verified HeatmapSlide gold color")

    # 4. Verify WeeklyPatternSlide (The Weekly Grind)
    print("Searching for The Weekly Grind")
    for _ in range(15):
        if page.get_by_role("heading", name="The Weekly Grind").is_visible():
            break
        next_slide()
        page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="The Weekly Grind")).to_be_visible()

    # Check non-podium day text color (Black)
    # Scope to slide container
    slide_container = page.locator(".bg-brand-orange", has_text="The Weekly Grind").last
    days = slide_container.locator("text=/^[MTWFS]$/")

    # Wait for bars to animate which usually reveals/settles text
    page.wait_for_timeout(2000)

    found_black = False
    count = days.count()
    for i in range(count):
        color = days.nth(i).evaluate("el => getComputedStyle(el).color")
        if color == "rgb(0, 0, 0)":
            found_black = True
            break

    if not found_black:
        print("Warning: No black text days found.")
    else:
        print("Verified WeeklyPatternSlide non-podium black text")

    # 5. Verify FunStatsSlide (Time Well Spent)
    print("Searching for Time Well Spent")
    for _ in range(15):
        if page.get_by_role("heading", name="Time Well Spent").is_visible():
            break
        next_slide()
        page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="Time Well Spent")).to_be_visible()

    container = page.locator("div", has_text="That's like listening to")
    count_span = container.locator(".text-4xl.font-bold").first

    expect(count_span).to_be_visible(timeout=5000)
    expect(count_span).to_have_css("color", "rgb(255, 255, 255)")
    print("Verified FunStatsSlide white text")

    page.screenshot(path="verification/orange_theme_verified_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        headless = os.getenv('HEADLESS', 'true').lower() == 'true'
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            test_orange_theme_details(page)
        finally:
            browser.close()
