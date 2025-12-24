// src/utils/dataProcessor.js

// Constants
const KJ_TO_KCAL = 0.239;
const KCAL_PER_KM_RIDE = 25;
const KCAL_PER_KM_DEFAULT = 60;

// Fun Comparison Constants
const SONG_DURATION_SECONDS = 219; // "Shake It Off" approx 3:39
const MOVIE_DURATION_MINUTES = 120;

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

// Helper to get ISO Week and Year
const getISOWeekAndYear = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return {
        year: d.getUTCFullYear(),
        week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    };
};

export const generateMockActivities = () => {
  const activities = [];
  const startYear = new Date().getFullYear();
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

export const analyzeData = (activities) => {
  if (!activities || activities.length === 0) return null;

  const totalActivities = activities.length;
  let totalDistance = 0;
  let totalCalories = 0;
  let totalTime = 0;

  // Trackers
  const activeDaysSet = new Set();
  const weeksActive = new Set();
  let maxKudos = -1;
  let mostLikedActivity = null;
  let maxDuration = -1;
  let spotlightActivity = null;

  const months = {};
  const activityTypes = {};
  const locations = {};

  // Vibe Counters
  let morningCount = 0;
  let nightCount = 0;
  let lunchCount = 0;
  let weekendCount = 0;

  // ⚡ Bolt Optimization: Cache Intl.DateTimeFormat to avoid re-instantiation in loop
  // This is ~100x faster than calling toLocaleString on every iteration
  const monthFormatter = new Intl.DateTimeFormat('default', { month: 'long' });

  // Single Pass Loop
  for (const act of activities) {
      const dist = act.distance || 0;
      const time = act.moving_time || 0;
      const date = new Date(act.start_date);
      const dateString = date.toISOString().split('T')[0];
      const monthKey = monthFormatter.format(date);

      // Globals
      totalDistance += dist;
      totalTime += time;
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

      // Active Days & Weeks
      activeDaysSet.add(dateString);

      const { year: isoYear, week: isoWeek } = getISOWeekAndYear(date);
      weeksActive.add(`${isoYear}-W${isoWeek}`);

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

      // Locations
      const loc = act.location_city || act.location_country || act.timezone?.split('/')[1]?.replace('_', ' ') || null;
      if(loc) {
          if (!locations[loc]) locations[loc] = 0;
          locations[loc]++;
      }

      // Spotlight (Longest Duration)
      if (time > maxDuration) {
          maxDuration = time;
          spotlightActivity = act;
      }

      // Most Liked (Kudos)
      const kudos = act.kudos_count || 0;
      if (kudos > maxKudos) {
          maxKudos = kudos;
          mostLikedActivity = act;
      }

      // Vibe Counters (Time of Day / Week)
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sun, 6 = Sat

      if (hour >= 4 && hour < 9) morningCount++;
      if (hour >= 20 && hour < 24) nightCount++;
      if (hour >= 11 && hour < 14) lunchCount++;
      if (day === 0 || day === 6) weekendCount++;
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

      const { week: weeksInPrevYear } = getISOWeekAndYear(new Date(prevY, 11, 28));

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

  // Top Location
  const topLocationEntry = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];
  const topLocation = topLocationEntry 
    ? { name: topLocationEntry[0], count: topLocationEntry[1] }
    : { name: 'The Great Outdoors', count: activities.length };

  // Fun Stats
  const totalHours = Math.round(totalTime / 3600);
  const shakeItOffCount = Math.floor(totalTime / SONG_DURATION_SECONDS);
  const moviesCount = Math.floor((totalTime / 60) / MOVIE_DURATION_MINUTES);
  
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
    year: new Date().getFullYear(),
    totalActivities,
    totalDistance: Math.round(totalDistance / 1000),
    totalCalories: Math.round(totalCalories),
    totalTime,
    totalHours,
    activeDays: activeDaysSet.size,
    funComparisons: {
        shakeItOff: shakeItOffCount,
        movies: moviesCount
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

    return "Certified Mover";
};

export const vibeTraits = {
    "Soft Life Era": { description: "You chose peace. Low impact, high vibes. Protect your energy at all costs.", icon: "🧘‍♀️" },
    "Main Character Energy": { description: "Consistent. Unstoppable. The plot revolves around your training arc.", icon: "✨" },
    "Early Bird": { description: "While they slept, you worked. The grind doesn't know what a snooze button is.", icon: "🌅" },
    "Night Owl": { description: "The city hits different at night. You own the darkness.", icon: "🌙" },
    "Lunch Breaker": { description: "Maximizing every minute. You turned downtime into go-time.", icon: "🥪" },
    "Side Quest Pro": { description: "Why specialize? You're collecting XP in every category possible.", icon: "🎮" },
    "Certified Mover": { description: "No labels, just movement. You kept it moving all year long.", icon: "👟" },
    "Weekend Warrior": { description: "Living for the weekend adventures.", icon: "🗓️" }
};
