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

        // Should have January and December
        const monthsFound = topMonths.map(m => m.month);
        expect(monthsFound).toContain('January');
        expect(monthsFound).toContain('December');
    });
});
