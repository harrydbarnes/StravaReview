// src/utils/dataProcessor.js

// Constants
const KJ_TO_KCAL = 0.239;
const KCAL_PER_KM_RIDE = 25;
const KCAL_PER_KM_DEFAULT = 60;

// Fun Comparison Constants
const SONG_DURATION_SECONDS = 219; // "Shake It Off" approx 3:39
const MOVIE_DURATION_MINUTES = 120;

// Helper to determine if a sport is Distance or Time based
const isDistanceSport = (type) => ['Run', 'Ride', 'Swim', 'Hike', 'Walk', 'Kayaking'].includes(type);

// Helper to get Week Number for Streak Calculation
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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

      // New Mock Data Fields
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
    kudos_count: 55, // High kudos for spotlight testing
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

  // New Trackers
  const activeDaysSet = new Set();
  const weeksActive = new Set();
  let maxKudos = -1;
  let mostLikedActivity = null;
  let maxDuration = -1;
  let spotlightActivity = null;

  const months = {};
  const activityTypes = {};
  const locations = {};

  // Single Pass Loop
  for (const act of activities) {
      const dist = act.distance || 0;
      const time = act.moving_time || 0;
      const date = new Date(act.start_date);
      const dateString = date.toISOString().split('T')[0];
      const monthKey = date.toLocaleString('default', { month: 'long' });

      // Globals
      totalDistance += dist;
      totalTime += time;
      if (act.calories) totalCalories += act.calories;
      else if (act.kilojoules) totalCalories += (act.kilojoules * KJ_TO_KCAL);

      // Active Days & Weeks
      activeDaysSet.add(dateString);
      weeksActive.add(`${date.getFullYear()}-W${getWeekNumber(date)}`);

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
              firstDate: act.start_date
          };
      }
      activityTypes[type].count++;
      activityTypes[type].distance += dist;
      activityTypes[type].time += time;
      if (dist > activityTypes[type].maxDistance) activityTypes[type].maxDistance = dist;

      // Track earliest date for this sport
      if (new Date(act.start_date) < new Date(activityTypes[type].firstDate)) {
          activityTypes[type].firstDate = act.start_date;
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
  // Logic: The activity type with the lowest count is likely the "newest" or "rarest"
  const sortedByCount = Object.values(activityTypes).sort((a, b) => a.count - b.count);
  const newActivity = sortedByCount[0];

  // Post-Processing: Streak Logic
  const sortedWeeks = Array.from(weeksActive).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let prevWeekVal = null;

  sortedWeeks.forEach(weekStr => {
      const [y, w] = weekStr.split('-W').map(Number);
      const val = y * 52 + w;
      if (prevWeekVal && val === prevWeekVal + 1) currentStreak++;
      else currentStreak = 1;

      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevWeekVal = val;
  });

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
      morningCount: calculateTimeOfDayCount(activities, 4, 9),
      nightCount: calculateTimeOfDayCount(activities, 20, 24),
      weekendCount: calculateDayCount(activities, [0, 6]),
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
    newActivity: newActivity ? { type: newActivity.type, firstDate: newActivity.firstDate } : null,
    topMonthsByDistance,
    topLocation,
    vibe
  };
};

// Vibe Helpers
const calculateTimeOfDayCount = (activities, startHour, endHour) => {
    return activities.filter(a => {
        const h = new Date(a.start_date).getHours();
        return h >= startHour && h < endHour;
    }).length;
};
const calculateDayCount = (activities, days) => {
    return activities.filter(a => days.includes(new Date(a.start_date).getDay())).length;
};

const determineVibe = (stats) => {
    const { activityTypes, totalActivities, morningCount, nightCount, weekendCount, streak } = stats;

    if (activityTypes['Yoga'] && activityTypes['Yoga'].count > totalActivities * 0.3) return "Soft Life Era";
    if (streak > 20) return "Main Character Energy";
    if ((morningCount / totalActivities) > 0.4) return "Sunrise CEO";
    if ((nightCount / totalActivities) > 0.3) return "After Hours";
    if ((weekendCount / totalActivities) > 0.6) return "Weekend Warrior";
    if (Object.keys(activityTypes).length > 4) return "Side Quest Pro";

    return "Certified Mover";
};

export const vibeTraits = {
    "Soft Life Era": { description: "You chose peace. Low impact, high vibes. Protect your energy at all costs.", icon: "🧘‍♀️" },
    "Main Character Energy": { description: "Consistent. Unstoppable. The plot revolves around your training arc.", icon: "✨" },
    "Sunrise CEO": { description: "While they slept, you worked. The grind doesn't know what a snooze button is.", icon: "🌅" },
    "After Hours": { description: "The city hits different at night. You own the darkness.", icon: "🌙" },
    "Side Quest Pro": { description: "Why specialize? You're collecting XP in every category possible.", icon: "🎮" },
    "Certified Mover": { description: "No labels, just movement. You kept it moving all year long.", icon: "👟" },
    "Weekend Warrior": { description: "Living for the weekend adventures.", icon: "🗓️" }
};
