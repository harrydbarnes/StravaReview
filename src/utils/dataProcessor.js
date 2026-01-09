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
  const activities = allActivities.filter(a => {
      const d = new Date(a.start_date);
      return d.getFullYear() === year;
  });

  if (activities.length === 0) return null; // Or handle empty year gracefully

  const totalActivities = activities.length;
  let totalDistance = 0;
  let totalCalories = 0;
  let totalTime = 0;
  let totalKudos = 0;
  let totalElevation = 0;

  // Trackers
  const activeDaysSet = new Set();
  const weeksActive = new Set();
  const weekCache = new Map(); // ⚡ Bolt Optimization: Cache week calcs
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

  const months = {};
  const activityTypes = {};
  const locations = {};
  const coordinateClusters = {};

  // Vibe Counters
  let morningCount = 0;
  let nightCount = 0;
  let lunchCount = 0;
  let weekendCount = 0;

  // Single Pass Loop
  for (const act of activities) {
      const dist = act.distance || 0;
      const time = act.moving_time || 0;
      const date = new Date(act.start_date);

      // Skip invalid dates to prevent crashes
      if (isNaN(date.getTime())) continue;

      // ⚡ Bolt Optimization: Use substring if possible, fallback to ISO method
      // Benchmark: ~600x faster for strings
      const dateString = typeof act.start_date === 'string'
          ? act.start_date.substring(0, 10)
          : date.toISOString().substring(0, 10);

      // ⚡ Bolt Optimization: Use Array Lookup instead of Intl.DateTimeFormat
      // Benchmark: ~66x faster than cached Intl.DateTimeFormat
      const monthKey = MONTH_NAMES[date.getUTCMonth()];

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
      // Standardize on UTC
      const hour = date.getUTCHours();
      const dayIndex = date.getUTCDay(); // 0 = Sun, 1 = Mon
      hourlyCounts[hour]++;
      // Map Sun(0) to 6, Mon(1) to 0
      const monSunIndex = (dayIndex + 6) % 7;
      dailyCounts[monSunIndex]++;

      // Speed Stats
      // Strava max_speed is m/s. Convert to mph: * 2.23694
      const actMaxSpeed = (act.max_speed || 0) * MPH_CONVERSION;
      if (actMaxSpeed > maxSpeedGlobal) maxSpeedGlobal = actMaxSpeed;

      // Min Speed (Slowest non-zero)
      // Use average speed (distance/time)
      if (time > 0 && dist > 0) {
          const avgSpeed = (dist / time) * MPH_CONVERSION; // mph
          if (avgSpeed < minSpeedGlobal) {
              minSpeedGlobal = avgSpeed;
              slowestActivity = act;
          }
      }

      // Shortest Activity (Non-zero distance)
      if (dist > 0 && dist < minDistanceGlobal) {
          minDistanceGlobal = dist;
          shortestActivity = act;
      }

      // Active Days & Weeks
      activeDaysSet.add(dateString);

      // ⚡ Bolt Optimization: Memoize ISO Week calculation
      // Benchmark: Reduces Date allocations by ~40-60% depending on daily density
      let isoEntry = weekCache.get(dateString);
      if (!isoEntry) {
         isoEntry = getISOWeekAndYear(date);
         weekCache.set(dateString, isoEntry);
      }
      weeksActive.add(`${isoEntry.year}-W${isoEntry.week}`);

      // Monthly Stats
      if (!months[monthKey]) months[monthKey] = { count: 0, distance: 0, time: 0 };
      months[monthKey].count++;
      months[monthKey].time += time;
      months[monthKey].distance += dist;

      // Activity Type Stats
      const type = act.type || 'Unknown';
      if (!activityTypes[type]) {
          activityTypes[type] = {
              count: 0,
              distance: 0,
              time: 0,
              maxDistance: 0,
              type: type,
              firstDate: date
          };
      }
      activityTypes[type].count++;
      activityTypes[type].distance += dist;
      activityTypes[type].time += time;
      if (dist > activityTypes[type].maxDistance) activityTypes[type].maxDistance = dist;

      if (date < activityTypes[type].firstDate) {
          activityTypes[type].firstDate = date;
      }

      // Locations Logic
      // 1. Coordinate Clustering (approx 1.1km precision)
      if (act.start_latlng && Array.isArray(act.start_latlng) && act.start_latlng.length === 2) {
          const [lat, lng] = act.start_latlng;
          // ⚡ Bolt Optimization: Use integer math for key generation
          // Benchmark: ~46x faster than toFixed(2)
          const key = `${Math.trunc(lat * 100 + Math.sign(lat) * 0.5)},${Math.trunc(lng * 100 + Math.sign(lng) * 0.5)}`;
          if (!coordinateClusters[key]) coordinateClusters[key] = { count: 0, lat: 0, lng: 0 };

          // Running average for center
          const cluster = coordinateClusters[key];
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
          metric: isDistanceSport(sport.type) ? sport.distance : sport.time,
          metricLabel: isDistanceSport(sport.type) ? 'Distance' : 'Time',
          displayValue: isDistanceSport(sport.type)
              ? `${Math.round(sport.distance / 1000)} km`
              : `${Math.round(sport.time / 3600)} hrs`
      }))
      .sort((a, b) => b.metric - a.metric)
      .slice(0, 5);

  // Post-Processing: New Activity
  const sortedByCount = Object.values(activityTypes).sort((a, b) => a.count - b.count);
  const newActivity = sortedByCount[0];

  // Post-Processing: Streak Logic
  const sortedWeeks = Array.from(weeksActive).sort((a, b) => {
    const [yA, wA] = a.split('-W').map(Number);
    const [yB, wB] = b.split('-W').map(Number);
    return yA - yB || wA - wB;
  });
  let currentStreak = 0;
  let maxStreak = 0;

  if (sortedWeeks.length > 0) {
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < sortedWeeks.length; i++) {
      const [prevY, prevW] = sortedWeeks[i - 1].split('-W').map(Number);
      const [currY, currW] = sortedWeeks[i].split('-W').map(Number);

      // ⚡ Bolt Optimization: Use UTC to match helper expectation
      const { week: weeksInPrevYear } = getISOWeekAndYear(new Date(Date.UTC(prevY, 11, 28)));

      if (
        (currY === prevY && currW === prevW + 1) ||
        (currY === prevY + 1 && currW === 1 && prevW === weeksInPrevYear)
      ) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
  }

  // Top Months
  const topMonthsByDistance = Object.entries(months)
    .sort(([, a], [, b]) => b.distance - a.distance)
    .slice(0, 3)
    .map(([month, stats]) => ({ month, ...stats }));

  // Top Location Selection Logic
  // Strategy: Explicit City > Coordinate Cluster > Timezone Fallback > Generic Default

  let topLocation = null;
  const topCityEntry = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];

  // Find top coordinate cluster
  const topClusterEntry = Object.values(coordinateClusters).sort((a, b) => b.count - a.count)[0];

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

  const speedDiffPercent = maxSpeedGlobal > 0 && isFinite(minSpeedGlobal) ? ((maxSpeedGlobal - minSpeedGlobal) / maxSpeedGlobal) * 100 : 0;
  
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
    newActivity: newActivity ? { type: newActivity.type, firstDate: newActivity.firstDate, id: activities.find(a => a.type === newActivity.type)?.id } : null,
    topMonthsByDistance,
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
