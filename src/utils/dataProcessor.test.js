import { analyzeData, generateMockActivities } from './dataProcessor';

describe('dataProcessor', () => {
    test('analyzeData correctly processes basic activity data', () => {
        const activities = generateMockActivities(2025);
        expect(activities.length).toBeGreaterThan(0);

        const result = analyzeData(activities, 2025);

        expect(result).not.toBeNull();
        expect(result.year).toBe(2025);
        expect(result.totalActivities).toBeGreaterThan(0);
        expect(result.topMonthsByDistance).toBeDefined();
        expect(Array.isArray(result.topMonthsByDistance)).toBe(true);
        expect(result.topMonthsByDistance.length).toBeLessThanOrEqual(3);
    });

    test('analyzeData returns null for empty activities', () => {
        const result = analyzeData([], 2025);
        expect(result).toBeNull();
    });

    test('analyzeData correctly identifies months', () => {
        // Create specific activities to test month mapping
        const activities = [
            {
                start_date: '2025-01-15T12:00:00Z',
                distance: 1000,
                moving_time: 300,
                type: 'Run'
            },
            {
                start_date: '2025-12-25T12:00:00Z',
                distance: 2000,
                moving_time: 600,
                type: 'Run'
            }
        ];

        const result = analyzeData(activities, 2025);
        const topMonths = result.topMonthsByDistance;

        // Should have December then January, sorted by distance
        expect(topMonths).toHaveLength(3);
        expect(topMonths[0].month).toBe('December');
        expect(topMonths[1].month).toBe('January');
        expect(topMonths[2].distance).toBe(0);
    });

    test('slowest activity is selected from top 2 sports only', () => {
        // MPH_CONVERSION = 2.23694
        const activities = [
            // Sport 1: Run (Top Sport by count/dist)
            // Run 1: 10 m/s avg. Max 12 m/s.
            {
                id: 1, type: 'Run', start_date: '2023-01-01T10:00:00Z', distance: 10000, moving_time: 1000,
                max_speed: 12
            },
            // Run 2: 8 m/s avg. Max 12 m/s.
            {
                id: 2, type: 'Run', start_date: '2023-01-02T10:00:00Z', distance: 10000, moving_time: 1250,
                max_speed: 12
            },

            // Sport 2: Ride (2nd Top Sport) - Consistent speed
            // Ride 1: 20 m/s avg. Max 21 m/s. (Small diff)
            {
                id: 3, type: 'Ride', start_date: '2023-01-03T10:00:00Z', distance: 30000, moving_time: 1500,
                max_speed: 21
            },
            {
                id: 4, type: 'Ride', start_date: '2023-01-03T11:00:00Z', distance: 30000, moving_time: 1500,
                max_speed: 21
            },

            // Sport 3: Swim (3rd Sport) - HUGE diff
            // Swim 1: 1 m/s avg. Max 6 m/s. Diff (6-1)/6 = 83%.
            // This should be IGNORED because it's not top 2
            {
                id: 5, type: 'Swim', start_date: '2023-01-04T10:00:00Z', distance: 500, moving_time: 500,
                max_speed: 6
            },
            {
                id: 6, type: 'Swim', start_date: '2023-01-05T10:00:00Z', distance: 500, moving_time: 500,
                max_speed: 6
            }
        ];

        // Run Diff: Max 12m/s (~26.8mph). Min Avg 8m/s (~17.9mph). Diff ~33%.
        // Ride Diff: Max 21m/s. Min Avg 20m/s. Diff ~5%.
        // Swim Diff: Max 6m/s. Min Avg 1m/s. Diff ~83%.

        // Result should be Run (because Swim is ignored).

        const result = analyzeData(activities, 2023);

        expect(result.topSports.length).toBeGreaterThanOrEqual(2);
        expect(result.topSports[0].type).toBe('Ride'); // 60km > 20km
        expect(result.topSports[1].type).toBe('Run'); // 20km

        expect(result.speed.slowestActivity).not.toBeNull();
        expect(result.speed.slowestActivity.type).toBe('Run');
    });
});
