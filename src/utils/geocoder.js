
// Simple cache to avoid repeated requests for the same location
const cache = new Map();

/**
 * Reverse geocodes latitude and longitude to a city/town name using OpenStreetMap Nominatim.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>} The city name or null if not found.
 */
export const getCityFromCoords = async (lat, lng) => {
    // Round to 3 decimal places (~110m) for caching key
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (cache.has(key)) return cache.get(key);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            {
                headers: {
                    // It is good practice to identify the application
                    'User-Agent': 'StravaWrappedApp/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        const address = data.address;

        // Try to find the most relevant city-like name
        const city = address.city ||
                     address.town ||
                     address.village ||
                     address.suburb ||
                     address.hamlet ||
                     address.county ||
                     address.state_district;

        if (city) {
            cache.set(key, city);
            return city;
        }
        return null;

    } catch (error) {
        console.warn("Reverse geocoding error:", error);
        return null;
    }
};
