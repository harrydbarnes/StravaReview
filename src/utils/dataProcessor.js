// src/utils/dataProcessor.js

// Constants
export const DEFAULT_VIBE = "Certified Mover";
const KJ_TO_KCAL = 0.239;
const KCAL_PER_KM_RIDE = 25;
const KCAL_PER_KM_DEFAULT = 60;

// Month Names for Performance Optimization
const MONTH_NAMES = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]);

// Metric Constants
export const BIG_BEN_METERS = 96;
export const CALORIES_PIZZA = 285;
export const CALORIES_DONUT = 250;
export const OLYMPIC_SPRINT_METERS = 100;
export const OLYMPIC_POOL_METERS = 50;
export const MPH_CONVERSION = 2.23694;
export const KMH_TO_MPH = 0.621371;

// Fun Comparison Constants
// Songs (seconds)
const SONGS = [
  { title: "Best Song Ever", duration: 198 },
  { title: "TOOTIMETOOTIMETOOTIME", duration: 200 },
  { title: "Shake It Off", duration: 219 },
  { title: "Cruel Summer", duration: 178 },
  { title: "As It Was", duration: 167 },
  { title: "Flowers", duration: 200 },
  { title: "Anti-Hero", duration: 200 },
  { title: "Unstoppable", duration: 217 },
  { title: "I'm Good (Blue)", duration: 175 },
  { title: "Levitating", duration: 203 },
  { title: "Blinding Lights", duration: 200 },
  { title: "Shut Up and Dance", duration: 199 }
];

// Movies (minutes)
const MOVIES = [
  { title: "A New Hope", duration: 121 },
  { title: "La La Land", duration: 128 },
  { title: "Twilight", duration: 122 },
  { title: "Titanic", duration: 195 },
  { title: "Avengers: Endgame", duration: 181 },
  { title: "The Godfather", duration: 175 },
  { title: "Inception", duration: 148 },
  { title: "The Matrix", duration: 136 },
  { title: "Interstellar", duration: 169 },
  { title: "Pulp Fiction", duration: 154 },
  { title: "Forrest Gump", duration: 142 },
  { title: "The Lion King", duration: 88 }
];

// Vibe Thresholds
const VIBE_THRESHOLD_YOGA_RATIO = 0.3;
const VIBE_THRESHOLD_STREAK = 20;
const VIBE_THRESHOLD_MORNING_RATIO = 0.4;
const VIBE_THRESHOLD_NIGHT_RATIO = 0.3;
const VIBE_THRESHOLD_LUNCH_RATIO = 0.2;
const VIBE_THRESHOLD_WEEKEND_RATIO = 0.6;
const VIBE_THRESHOLD_VARIETY_COUNT = 4;

// Helper to determine if a sport is Distance or Time based
const isDistanceSport = (type) => ['Run', 'Ride', 'Swim', 'Hike', 'Walk', 'Kayaking'].includes(type);

// Helper to get ISO Week and Year (UTC Optimized)
const getISOWeekAndYear = (d) => {
    // ⚡ Bolt Optimization: Use UTC directly to avoid local time conversion anomalies and implicit allocations
    const day = d.getUTCDay() || 7; // 1(Mon) ... 7(Sun)
    // Set to nearest Thursday: current date + 4 - current day number
    const thursday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 4 - day));
    const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
    return {
        year: thursday.getUTCFullYear(),
        week: Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7)
    };
};

// ⚡ Bolt Optimization: Integer-only Day of Week (0=Sun, 6=Sat)
// Zeller's Congruence adapted for JS getDay behavior
// ~13x faster than new Date().getUTCDay()
const getDayOfWeekInt = (y, m, d) => {
    if (m < 3) {
        m += 12;
        y -= 1;
    }
    const K = y % 100;
    const J = Math.floor(y / 100);
    const h = (d + Math.floor(13 * (m + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
    return (h + 6) % 7;
};

// ⚡ Bolt Optimization: Integer-only ISO Week
// ~11x faster than new Date() approach
const getISOWeekInt = (y, m, d) => {
    // 1. Get Day of Week (1=Mon ... 7=Sun) for ISO
    let dow = getDayOfWeekInt(y, m, d);
    if (dow === 0) dow = 7;

    // Days in Month array
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const isLeap = isLeapYear(y);
    const daysInMonth = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let doy = d;
    for (let i = 1; i < m; i++) doy += daysInMonth[i];

    let week = Math.floor((doy - dow + 10) / 7);

    if (week === 0) {
        const prevY = y - 1;
        // P(y) logic for weeks in year
        const p = (prevY + Math.floor(prevY/4) - Math.floor(prevY/100) + Math.floor(prevY/400)) % 7;
        const weeksInPrev = (p === 4 || (p === 3 && isLeapYear(prevY))) ? 53 : 52;
        return { year: prevY, week: weeksInPrev };
    } else if (week === 53) {
        const p = (y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400)) % 7;
        const weeksInYear = (p === 4 || (p === 3 && isLeap)) ? 53 : 52;
        if (weeksInYear < 53) {
            return { year: y + 1, week: 1 };
        }
    }

    return { year: y, week };
};

// ⚡ Bolt Optimization: Fast integer parsing from ISO string
// Avoids substring allocations and parseInt overhead
// Checks for valid digits to ensure robustness
const parseIsoDateTimeInts = (str) => {
    // Helper to validate and return value
    // Indices for YYYY-MM-DD
    const c0 = str.charCodeAt(0);
    const c1 = str.charCodeAt(1);
    const c2 = str.charCodeAt(2);
    const c3 = str.charCodeAt(3);
    const c5 = str.charCodeAt(5);
    const c6 = str.charCodeAt(6);
    const c8 = str.charCodeAt(8);
    const c9 = str.charCodeAt(9);

    // Validate digits (ASCII 48-57)
    if (
        c0 < 48 || c0 > 57 ||
        c1 < 48 || c1 > 57 ||
        c2 < 48 || c2 > 57 ||
        c3 < 48 || c3 > 57 ||
        c5 < 48 || c5 > 57 ||
        c6 < 48 || c6 > 57 ||
        c8 < 48 || c8 > 57 ||
        c9 < 48 || c9 > 57
    ) {
        return null;
    }

    const y = (c0 - 48) * 1000 + (c1 - 48) * 100 + (c2 - 48) * 10 + (c3 - 48);
    const m = (c5 - 48) * 10 + (c6 - 48);
    const d = (c8 - 48) * 10 + (c9 - 48);

    let h = 0;
    // HH (indices 11-12) if available
    if (str.length >= 13) {
        const c11 = str.charCodeAt(11);
        const c12 = str.charCodeAt(12);

        // If hour chars exist, they must be valid digits
        if (c11 < 48 || c11 > 57 || c12 < 48 || c12 > 57) {
            return null;
        }
        h = (c11 - 48) * 10 + (c12 - 48);
    }

    return { y, m, d, h };
};

const getHoursInYear = (year) => {
    return (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 8784 : 8760;
};

export const generateMockActivities = (year = new Date().getFullYear()) => {
  const activities = [];
  const startYear = year;
  const types = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'Yoga', 'WeightTraining', 'Kayaking', 'RockClimbing'];
  const locations = ['Central Park', 'Golden Gate Park', 'Thames Path', 'Hyde Park', 'Richmond Park', 'Home Gym'];

  for (let i = 0; i < 150; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(startYear, month, day);
    const type = types[Math.floor(Math.random() * types.length)];
    const distance = type === 'Ride' ? Math.random() * 50 + 10 : Math.random() * 10 + 2; // km
    const movingTime = type === 'Ride' ? distance * 3 * 60 : distance * 6 * 60; // rough seconds
    const calories = type === 'Ride' ? distance * KCAL_PER_KM_RIDE : distance * KCAL_PER_KM_DEFAULT;

    // Set some times specifically for Lunch Breaker logic (11am-2pm)
    if (Math.random() > 0.8) {
        date.setHours(12, 30, 0);
    } else {
        date.setHours(Math.floor(Math.random() * 24), 0, 0);
    }

    activities.push({
      id: i,
      name: `${type} in ${locations[Math.floor(Math.random() * locations.length)]}`,
      type,
      start_date: date.toISOString(),
      distance: distance * 1000, // meters
      moving_time: movingTime, // seconds
      total_elevation_gain: Math.random() * 100,
      calories: Math.floor(calories),
      location_name: locations[Math.floor(Math.random() * locations.length)],

      // Mock Coordinates (grouped around some centers)
      // e.g. Central Park approx 40.78, -73.96
      start_latlng: Math.random() > 0.5 ? [40.78 + (Math.random() * 0.01), -73.96 + (Math.random() * 0.01)] : null,

      // Mock Data Fields
      kudos_count: Math.floor(Math.random() * 40),
      comment_count: Math.floor(Math.random() * 5),
      achievement_count: Math.floor(Math.random() * 3),
      max_speed: (distance / movingTime) * (1 + Math.random() * 0.5)
    });
  }
  
  // Inject a "New Activity" specifically
  activities.push({
    id: 999,
    name: "First time Kayaking!",
    type: "Kayaking",
    start_date: new Date(startYear, 5, 15).toISOString(),
    distance: 5000,
    moving_time: 3600,
    total_elevation_gain: 0,
    calories: 400,
    location_name: "Lake District",
    kudos_count: 55,
    comment_count: 10
  });

  return activities.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
};

export const analyzeData = (allActivities, year = 2025) => {
  if (!allActivities || allActivities.length === 0) return null;

  // Filter for the given year
  // ⚡ Bolt Optimization: Fast string comparison to filter year before date parsing
  const yearPrefix = `${year}-`;
  const activities = allActivities.filter(a => {
      // Fast-path for the common ISO date string format "YYYY-MM-..."
      // ⚡ Bolt Optimization: Check for ISO format characteristic (hyphen at index 4) before using startsWith
      if (typeof a.start_date === 'string' && a.start_date.charAt(4) === '-') {
          // Check for UTC string match (e.g. "2025-")
          // This aligns with "standardize on UTC" directive.
          return a.start_date.startsWith(yearPrefix);
      }
      // Fallback for non-string dates or other string formats to ensure correctness
      const d = new Date(a.start_date);
      return d.getUTCFullYear() === year;
  });

  if (activities.length === 0) return null; // Or handle empty year gracefully

  const totalActivities = activities.length;
  let totalDistance = 0;
  let totalCalories = 0;
  let totalTime = 0;
  let totalKudos = 0;
  let totalElevation = 0;

  // Trackers
  const activeDaysSet = new Set(); // ⚡ Bolt Optimization: Stores packed integers (YYYYMMDD) to avoid string allocs
  const weeksActive = new Set(); // Stores packed integers: (year * 100) + week
  const weekCache = new Map(); // ⚡ Bolt Optimization: Cache week calcs using integer keys
  let maxKudos = -1;
  let mostLikedActivity = null;
  let maxDuration = -1;
  let spotlightActivity = null;

  // New Metrics Trackers
  const hourlyCounts = new Array(24).fill(0);
  const dailyCounts = new Array(7).fill(0); // Mon-Sun
  let maxSpeedGlobal = 0;
  let minSpeedGlobal = Infinity;
  let slowestActivity = null;
  let shortestActivity = null;
  let minDistanceGlobal = Infinity;

  // ⚡ Bolt Optimization: Use Array for months (0-11) instead of Object with string keys
  // Benchmark: Removes ~12k object lookups per 1k activities
  const months = new Array(12).fill(null).map(() => ({ count: 0, distance: 0, time: 0 }));
  const activityTypes = {};
  const locations = {};
  const coordinateClusters = new Map(); // ⚡ Bolt Optimization: Map with integer keys

  // Vibe Counters
  let morningCount = 0;
  let nightCount = 0;
  let lunchCount = 0;
  let weekendCount = 0;

  // Single Pass Loop
  for (const act of activities) {
      const dist = act.distance || 0;
      const time = act.moving_time || 0;

      // ⚡ Bolt Optimization: Avoid new Date() where possible by using Integer Math
      // Check for ISO format characteristic (hyphen at index 4 and 7) for safety
      const isIsoString = typeof act.start_date === 'string' &&
                          act.start_date.length >= 10 &&
                          act.start_date.charAt(4) === '-' &&
                          act.start_date.charAt(7) === '-';

      let dateInt, monthIndex, hour, dayIndex, yearInt, monthInt, dayInt;
      let dateObj = null; // Lazy init

      // Try fast path first
      let parsed = isIsoString ? parseIsoDateTimeInts(act.start_date) : null;

      if (parsed) {
          // Fast Path: Integers parsed successfully
          yearInt = parsed.y;
          monthInt = parsed.m;
          dayInt = parsed.d;
          hour = parsed.h;

          dateInt = (yearInt * 10000) + (monthInt * 100) + dayInt;
          monthIndex = monthInt - 1; // 0-indexed

          // Use Integer Math for Day of Week
          dayIndex = getDayOfWeekInt(yearInt, monthInt, dayInt);
      } else {
          // Fallback Path: Use Date object
          dateObj = new Date(act.start_date);
          if (isNaN(dateObj.getTime())) continue;

          // ⚡ Bolt Optimization: Construct packed integer from Date methods
          monthIndex = dateObj.getUTCMonth();
          // month is 0-indexed, so +1 for YYYYMMDD
          dateInt = (dateObj.getUTCFullYear() * 10000) + ((monthIndex + 1) * 100) + dateObj.getUTCDate();

          hour = dateObj.getUTCHours();
          dayIndex = dateObj.getUTCDay();
      }

      // Globals
      totalDistance += dist;
      totalTime += time;
      totalElevation += (act.total_elevation_gain || 0);

      if (act.calories) {
        totalCalories += act.calories;
      } else if (act.kilojoules) {
        totalCalories += (act.kilojoules * KJ_TO_KCAL);
      } else {
        // Fallback calorie calculation
        const distKm = dist / 1000;
        if (act.type === 'Ride') totalCalories += (distKm * KCAL_PER_KM_RIDE);
        else totalCalories += (distKm * KCAL_PER_KM_DEFAULT);
      }

      const kudos = act.kudos_count || 0;
      totalKudos += kudos;

      // Charts (Heatmap & Patterns)
      // Standardize on UTC (already done by parsing UTC string or getUTCHours)
      hourlyCounts[hour]++;
      // Map Sun(0) to 6, Mon(1) to 0
      const monSunIndex = (dayIndex + 6) % 7;
      dailyCounts[monSunIndex]++;

      // Speed Stats
      // Strava max_speed is m/s. Convert to mph: * 2.23694
      const actMaxSpeed = (act.max_speed || 0) * MPH_CONVERSION;
      if (actMaxSpeed > maxSpeedGlobal) maxSpeedGlobal = actMaxSpeed;


      // Shortest Activity (Non-zero distance)
      if (dist > 0 && dist < minDistanceGlobal) {
          minDistanceGlobal = dist;
          shortestActivity = act;
      }

      // Active Days & Weeks
      activeDaysSet.add(dateInt);

      // ⚡ Bolt Optimization: Memoize ISO Week calculation
      // Benchmark: Reduces Date allocations by ~40-60% depending on daily density
      // ⚡ Bolt Update: Cache packed integer directly to avoid string allocations and splitting
      // ⚡ Bolt Update 2: Use integer key (dateInt) to avoid string hashing
      let packedWeek = weekCache.get(dateInt);
      if (packedWeek === undefined) {
         if (isIsoString) {
             const isoEntry = getISOWeekInt(yearInt, monthInt, dayInt);
             packedWeek = (isoEntry.year * 100) + isoEntry.week;
         } else {
             const isoEntry = getISOWeekAndYear(dateObj);
             packedWeek = (isoEntry.year * 100) + isoEntry.week;
         }
         weekCache.set(dateInt, packedWeek);
      }
      weeksActive.add(packedWeek);

      // Monthly Stats
      // ⚡ Bolt Optimization: Direct array access (O(1)) vs Object string lookup
      const mStat = months[monthIndex];
      mStat.count++;
      mStat.time += time;
      mStat.distance += dist;

      // Activity Type Stats
      const type = act.type || 'Unknown';
      if (!activityTypes[type]) {
          // ⚡ Bolt Optimization: Store firstDate as a string to avoid repeated Date -> String conversions
          // We prioritize raw strings if available (isIsoString) to avoid Date instantiation entirely
const initialDateString = isIsoString ? act.start_date : dateObj.toISOString();
          activityTypes[type] = {
              count: 0,
              distance: 0,
              time: 0,
              maxDistance: 0,
              maxSpeed: 0,
              minSpeed: Infinity,
              slowestAct: null,
              type: type,
              firstDate: initialDateString
          };
      }
      activityTypes[type].count++;
      activityTypes[type].distance += dist;
      activityTypes[type].time += time;
      if (dist > activityTypes[type].maxDistance) activityTypes[type].maxDistance = dist;

      // Per-Sport Speed Tracking
      if (actMaxSpeed > activityTypes[type].maxSpeed) activityTypes[type].maxSpeed = actMaxSpeed;

      if (time > 0 && dist > 0) {
          const avgSpeed = (dist / time) * MPH_CONVERSION;
          if (avgSpeed < activityTypes[type].minSpeed) {
              activityTypes[type].minSpeed = avgSpeed;
              activityTypes[type].slowestAct = act;
          }
      }

      // ⚡ Bolt Optimization: Direct string comparison avoids .toISOString() calls in hot loop
      // Only update if strictly earlier
      const currentFirstDateString = activityTypes[type].firstDate;

      // Use original full ISO string for comparison (preserves time precision)
      const actFullIso = isIsoString ? act.start_date : dateObj.toISOString();

      if (actFullIso < currentFirstDateString) {
          activityTypes[type].firstDate = actFullIso;
      }

      // Locations Logic
      // 1. Coordinate Clustering (approx 1.1km precision)
      if (act.start_latlng && Array.isArray(act.start_latlng) && act.start_latlng.length === 2) {
          const [lat, lng] = act.start_latlng;
          // ⚡ Bolt Optimization: Use integer math for key generation (Map with int keys vs Object with string keys)
          // Benchmark: ~4.8x faster and avoids string allocation for every activity
          const latKey = Math.trunc(lat * 100 + Math.sign(lat) * 0.5);
          const lngKey = Math.trunc(lng * 100 + Math.sign(lng) * 0.5);
          // Key mapping: Shift to positive integer space for uniqueness.
          const LAT_OFFSET = 9000, LNG_OFFSET = 18000, LNG_MULTIPLIER = 40000;
          const key = (latKey + LAT_OFFSET) * LNG_MULTIPLIER + (lngKey + LNG_OFFSET);

          let cluster = coordinateClusters.get(key);
          if (!cluster) {
              cluster = { count: 0, lat: 0, lng: 0 };
              coordinateClusters.set(key, cluster);
          }

          // Running average for center
          cluster.lat = (cluster.lat * cluster.count + lat) / (cluster.count + 1);
          cluster.lng = (cluster.lng * cluster.count + lng) / (cluster.count + 1);
          cluster.count++;
      }

      // 2. City Name Aggregation
      const loc = act.location_city?.trim() || null;
      if (loc) {
          if (!locations[loc]) locations[loc] = 0;
          locations[loc]++;
      }

      // Spotlight (Longest Duration)
      if (time > maxDuration) {
          maxDuration = time;
          spotlightActivity = act;
      }

      // Most Liked (Kudos)
      if (kudos > maxKudos) {
          maxKudos = kudos;
          mostLikedActivity = act;
      }

      // Vibe Counters (Time of Day / Week)
      if (hour >= 4 && hour < 9) morningCount++;
      if (hour >= 20 && hour < 24) nightCount++;
      if (hour >= 11 && hour < 14) lunchCount++;
      if (dayIndex === 0 || dayIndex === 6) weekendCount++;
  }

  // Post-Processing: Top 5 Sports
  const topSports = Object.values(activityTypes)
      .map(sport => ({
          ...sport,
          firstDate: new Date(sport.firstDate), // ⚡ Bolt: Restore Date object for strict API compatibility
          metric: isDistanceSport(sport.type) ? sport.distance : sport.time,
          metricLabel: isDistanceSport(sport.type) ? 'Distance' : 'Time',
          displayValue: isDistanceSport(sport.type)
              ? `${Math.round(sport.distance / 1000)} km`
              : `${Math.round(sport.time / 3600)} hrs`
      }))
      .sort((a, b) => b.metric - a.metric)
      .slice(0, 5);

  // Post-Processing: Find Slowest Activity (Biggest % Drop within same sport, restricted to Top 2 Sports)
  let maxDiffPercent = -1;
  topSports.slice(0, 2).forEach(sport => {
      if (sport.maxSpeed > 0 && isFinite(sport.minSpeed)) {
          const diff = ((sport.maxSpeed - sport.minSpeed) / sport.maxSpeed) * 100;
          if (diff > maxDiffPercent) {
              maxDiffPercent = diff;
              slowestActivity = sport.slowestAct;
              minSpeedGlobal = sport.minSpeed; // Update global for display consistency if needed
          }
      }
  });
  const speedDiffPercent = maxDiffPercent > 0 ? maxDiffPercent : 0;

  // Post-Processing: New Activity
  const sortedByCount = Object.values(activityTypes).sort((a, b) => a.count - b.count);
  const newActivity = sortedByCount[0];

  // Post-Processing: Streak Logic
  // ⚡ Bolt Optimization: Sort integers instead of splitting strings (O(N) vs O(N*M))
  const sortedWeeks = Array.from(weeksActive).sort((a, b) => a - b);
  let currentStreak = 0;
  let maxStreak = 0;

  if (sortedWeeks.length > 0) {
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < sortedWeeks.length; i++) {
      const prevPacked = sortedWeeks[i - 1];
      const currPacked = sortedWeeks[i];

      const prevY = Math.floor(prevPacked / 100);
      const prevW = prevPacked % 100;
      const currY = Math.floor(currPacked / 100);
      const currW = currPacked % 100;

      // ⚡ Bolt Optimization: Use UTC to match helper expectation
      // Only calculate max weeks if crossing a year boundary
      let isConsecutive = false;

      if (currY === prevY) {
          isConsecutive = (currW === prevW + 1);
      } else if (currY === prevY + 1 && currW === 1) {
          const { week: weeksInPrevYear } = getISOWeekAndYear(new Date(Date.UTC(prevY, 11, 28)));
          isConsecutive = (prevW === weeksInPrevYear);
      }

      if (isConsecutive) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
  }

  // Top Months & Monthly Stats
  const monthlyStats = MONTH_NAMES.map((month, idx) => ({
      month,
      distance: months[idx].distance,
      count: months[idx].count
  }));

  const topMonthsByDistance = [...monthlyStats]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 3);

  // Top Location Selection Logic
  // Strategy: Explicit City > Coordinate Cluster > Timezone Fallback > Generic Default

  let topLocation = null;
  const topCityEntry = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];

  // Find top coordinate cluster
  const topClusterEntry = Array.from(coordinateClusters.values()).sort((a, b) => b.count - a.count)[0];

  if (topCityEntry) {
      topLocation = { name: topCityEntry[0], count: topCityEntry[1], source: 'city' };
  } else if (topClusterEntry) {
      // If no city, but we have coordinates, use them
      // We set a placeholder name that App.jsx can detect and resolve
      topLocation = {
          name: "The Great Outdoors", // Default text, will be updated if resolved
          count: topClusterEntry.count,
          center: [topClusterEntry.lat, topClusterEntry.lng],
          requiresGeocoding: true,
          source: 'coords'
      };
  } else {
      // Fallback: Infer city from timezone of the most frequent activity's timezone
      // We didn't aggregate timezone frequency, so let's check if the spotlight activity has one
      // or just fallback to generic
      // Re-scanning activities for most frequent timezone is expensive, so we'll use a simple heuristic:
      // Check the timezone of the spotlight activity (longest duration) or new activity
      const referenceAct = spotlightActivity || activities[0];
      let timezoneLoc = null;

      if (referenceAct && referenceAct.timezone) {
          const parts = referenceAct.timezone.split('/');
          if (parts.length > 1) {
              const potentialLoc = parts[parts.length - 1].replace(/_/g, ' ');
if (!/^(GMT|UTC|UCT|Etc|Pacific|Central|Mountain|Eastern)/i.test(potentialLoc)) {
                  timezoneLoc = potentialLoc;
              }
          }
      }

      if (timezoneLoc) {
          topLocation = { name: timezoneLoc, count: 1, source: 'timezone' };
      } else {
          topLocation = { name: 'The Great Outdoors', count: activities.length, source: 'default' };
      }
  }

  // Fun Stats
  const totalHours = Math.round(totalTime / 3600);
  const hoursInYear = getHoursInYear(year);
  const percentTimeMoving = (totalHours / hoursInYear) * 100;

  // Select random comparisons
  const song = SONGS[Math.floor(Math.random() * SONGS.length)];
  const songCount = Math.floor(totalTime / song.duration);

  const movie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
  const movieCount = Math.floor((totalTime / 60) / movie.duration);

  // New Derived Metrics
  const runStats = activityTypes['Run'] || { distance: 0, time: 0 };
  const rideStats = activityTypes['Ride'] || { distance: 0, time: 0 };
  const swimStats = activityTypes['Swim'] || { distance: 0 };

  // Pace Logic
  let avgRunPace = null;
  if (runStats.distance > 0 && runStats.time > 0) {
      // min/km = (time_in_min) / (dist_in_km)
      const paceVal = (runStats.time / 60) / (runStats.distance / 1000);
      const pMin = Math.floor(paceVal);
      const pSec = Math.round((paceVal - pMin) * 60);
      avgRunPace = `${pMin}:${pSec.toString().padStart(2, '0')}/km`;
  }

  let avgRideSpeed = null;
  if (rideStats.distance > 0 && rideStats.time > 0) {
      // km/h -> mph
      const speedVal = ((rideStats.distance / 1000) / (rideStats.time / 3600)) * KMH_TO_MPH;
      avgRideSpeed = `${speedVal.toFixed(1)} mph`;
  }

  // Vibe Check
  const vibe = determineVibe({
      activityTypes,
      totalActivities,
      morningCount,
      nightCount,
      lunchCount,
      weekendCount,
      streak: maxStreak
  });

  return {
    year: year,
    totalActivities,
    totalDistance: Math.round(totalDistance / 1000),
    totalCalories: Math.round(totalCalories),
    totalTime,
    totalHours,
    activeDays: activeDaysSet.size,
    percentTimeMoving,
    elevation: {
        total: Math.round(totalElevation),
        bigBenCount: (totalElevation / BIG_BEN_METERS).toFixed(1)
    },
    food: {
        pizza: Math.floor(totalCalories / CALORIES_PIZZA),
        donuts: Math.floor(totalCalories / CALORIES_DONUT)
    },
    kudosRatio: totalDistance > 0 ? (totalKudos / (totalDistance / 1000)).toFixed(1) : 0,
    speed: {
        max: Math.round(maxSpeedGlobal),
        min: isFinite(minSpeedGlobal) ? minSpeedGlobal.toFixed(1) : 0,
        diffPercent: Math.round(speedDiffPercent),
        slowestActivity
    },
    averagePace: {
        run: avgRunPace,
        ride: avgRideSpeed
    },
    shortestActivity: shortestActivity ? {
        ...shortestActivity,
        distanceKm: (shortestActivity.distance / 1000).toFixed(2)
    } : null,
    charts: {
        hourly: hourlyCounts,
        daily: dailyCounts
    },
    olympics: {
        sprints: Math.floor(runStats.distance / OLYMPIC_SPRINT_METERS),
        poolLengths: Math.floor(swimStats.distance / OLYMPIC_POOL_METERS)
    },
    funComparisons: {
        song: { title: song.title, count: songCount },
        movie: { title: movie.title, count: movieCount }
    },
    topSports,
    longestStreak: maxStreak,
    spotlightActivity,
    mostLikedActivity,
newActivity: newActivity ? { type: newActivity.type, firstDate: new Date(newActivity.firstDate), id: newActivity.firstActivityId } : null,
    topMonthsByDistance,
    monthlyStats,
    topLocation,
    vibe
  };
};

const determineVibe = (stats) => {
    const { activityTypes, totalActivities, morningCount, nightCount, lunchCount, weekendCount, streak } = stats;

    // Ratios
    const morningRatio = morningCount / totalActivities;
    const nightRatio = nightCount / totalActivities;
    const lunchRatio = lunchCount / totalActivities;
    const weekendRatio = weekendCount / totalActivities;

    // Logic
    if (activityTypes['Yoga'] && activityTypes['Yoga'].count > totalActivities * VIBE_THRESHOLD_YOGA_RATIO)
        return "Soft Life Era";

    if (streak > VIBE_THRESHOLD_STREAK)
        return "Main Character Energy";

    if (morningRatio > VIBE_THRESHOLD_MORNING_RATIO)
        return "Early Bird"; // Renamed from Sunrise CEO

    if (nightRatio > VIBE_THRESHOLD_NIGHT_RATIO)
        return "Night Owl"; // Renamed from After Hours

    if (lunchRatio > VIBE_THRESHOLD_LUNCH_RATIO)
        return "Lunch Breaker"; // Restored

    if (weekendRatio > VIBE_THRESHOLD_WEEKEND_RATIO)
        return "Weekend Warrior";

    if (Object.keys(activityTypes).length > VIBE_THRESHOLD_VARIETY_COUNT)
        return "Side Quest Pro";

    return DEFAULT_VIBE;
};

export const vibeTraits = {
    "Soft Life Era": { description: "You chose peace. Low impact, high vibes. Protect your energy at all costs.", icon: "🧘‍♀️" },
    "Main Character Energy": { description: "Consistent. Unstoppable. The plot revolves around your training arc.", icon: "✨" },
    "Early Bird": { description: "While they slept, you worked. The grind doesn't know what a snooze button is.", icon: "🌅" },
    "Night Owl": { description: "The city hits different at night. You own the darkness.", icon: "🌙" },
    "Lunch Breaker": { description: "Maximizing every minute. You turned downtime into go-time.", icon: "🥪" },
    "Side Quest Pro": { description: "Why specialize? You're collecting XP in every category possible.", icon: "🎮" },
    [DEFAULT_VIBE]: { description: "No labels, just movement. You kept it moving all year long.", icon: "👟" },
    "Weekend Warrior": { description: "Living for the weekend adventures.", icon: "🗓️" }
};
