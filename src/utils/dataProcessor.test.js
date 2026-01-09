
import { analyzeData, generateMockActivities } from './dataProcessor';

describe('analyzeData', () => {
    test('calculates basic stats correctly', () => {
        const activities = generateMockActivities(2025);
        const result = analyzeData(activities, 2025);

        expect(result).not.toBeNull();
        expect(result.year).toBe(2025);
        expect(result.totalActivities).toBeGreaterThan(0);
        expect(result.totalDistance).toBeGreaterThanOrEqual(0);

        // New metrics
        expect(result.percentTimeMoving).toBeDefined();
        expect(result.charts.hourly).toHaveLength(24);
        expect(result.charts.daily).toHaveLength(7);
        expect(result.elevation.total).toBeDefined();
        expect(result.food.pizza).toBeDefined();
        expect(result.speed.max).toBeDefined();
        expect(result.olympics.sprints).toBeDefined();
    });

    test('handles empty activity list', () => {
        const result = analyzeData([], 2025);
        expect(result).toBeNull();
    });
});
