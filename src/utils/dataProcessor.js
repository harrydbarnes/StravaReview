// Mock data and analysis logic

// Mock Activities Data
export const generateMockActivities = () => {
  const activities = [];
  const startYear = new Date().getFullYear();
  const types = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'Yoga', 'WeightTraining', 'Kayaking', 'RockClimbing'];
  
  // Locations (Lat/Lon is approximate for demo, we'll just use names)
  const locations = ['Central Park', 'Golden Gate Park', 'Thames Path', 'Hyde Park', 'Richmond Park', 'Home Gym'];

  for (let i = 0; i < 150; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(startYear, month, day);
    const type = types[Math.floor(Math.random() * types.length)];
    const distance = type === 'Ride' ? Math.random() * 50 + 10 : Math.random() * 10 + 2; // km
    const movingTime = type === 'Ride' ? distance * 3 * 60 : distance * 6 * 60; // rough seconds
    const calories = type === 'Ride' ? distance * 25 : distance * 60;

    // Set time for Lunch Breaker logic (11am-2pm)
    if (Math.random() > 0.7) {
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
      location_name: locations[Math.floor(Math.random() * locations.length)]
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
    location_name: "Lake District"
  });

  return activities.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
};

export const analyzeData = (activities) => {
  if (!activities || activities.length === 0) return null;

  const totalActivities = activities.length;
  
  // Accumulators
  let totalDistance = 0;
  let totalCalories = 0;
  let totalTime = 0;

  const months = {};
  const activityTypes = {};
  const locations = {};

  // Personality counters
  let morningCount = 0;
  let nightCount = 0;
  let weekendCount = 0;
  let lunchCount = 0;
  let commuterCount = 0;

  // Single pass loop
  for (const act of activities) {
      // 1. Basic Stats
      const dist = act.distance || 0;
      totalDistance += dist;
      totalTime += (act.moving_time || 0);

      // Calories
      if (act.calories) totalCalories += act.calories;
      else if (act.kilojoules) totalCalories += (act.kilojoules * 0.239);
      else {
          const distKm = dist / 1000;
          if (act.type === 'Ride') totalCalories += (distKm * 25);
          else totalCalories += (distKm * 60);
      }

      // Date parsing - done ONCE
      const date = new Date(act.start_date);

      // 2. Months
      const monthKey = date.toLocaleString('default', { month: 'long' });
      if (!months[monthKey]) months[monthKey] = { count: 0, distance: 0, time: 0 };
      months[monthKey].count++;
      months[monthKey].distance += dist;
      months[monthKey].time += (act.moving_time || 0);

      // 3. Activity Types
      const type = act.type || 'Unknown';
      if (!activityTypes[type]) activityTypes[type] = { count: 0, distance: 0, firstDate: act.start_date };
      activityTypes[type].count++;
      activityTypes[type].distance += dist;
      if (date < new Date(activityTypes[type].firstDate)) {
          activityTypes[type].firstDate = act.start_date;
      }

      // 4. Locations
      const loc = act.location_city || act.location_country || act.timezone?.split('/')[1]?.replace('_', ' ') || null;
      if(loc) {
          if (!locations[loc]) locations[loc] = 0;
          locations[loc]++;
      }

      // 5. Time of Day / Personality
      const hour = date.getHours();
      const day = date.getDay(); // 0 is Sun, 6 is Sat

      if (hour < 8) morningCount++;
      if (hour > 20) nightCount++;
      if (hour >= 11 && hour <= 14) lunchCount++;
      if (day === 0 || day === 6) weekendCount++;

      // Commuter logic
      const durationMin = (act.moving_time || 0) / 60;
      if (day >= 1 && day <= 5 && durationMin < 45 && durationMin > 5) {
          commuterCount++;
      }
  }

  // Post-processing
  const topMonthsByDistance = Object.entries(months)
    .sort(([, a], [, b]) => b.distance - a.distance)
    .slice(0, 3)
    .map(([month, stats]) => ({ month, ...stats }));

  const sortedTypes = Object.entries(activityTypes).sort(([, a], [, b]) => a.count - b.count);
  const newActivity = sortedTypes[0];

  const topLocationEntry = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];
  const topLocation = topLocationEntry 
    ? { name: topLocationEntry[0], count: topLocationEntry[1] }
    : { name: 'The Great Outdoors', count: activities.length };

  // Determine Personality - Corrected to maintain original precedence
  let personality = "The Mover";
  const runCount = activityTypes['Run']?.count || 0;
  const swimCount = activityTypes['Swim']?.count || 0;
  const yogaCount = activityTypes['Yoga']?.count || 0;
  
  // Activity Type Checks
  if (runCount / totalActivities > 0.5) personality = "Run Forest, Run";
  else if (swimCount / totalActivities > 0.2) personality = "Water Baby";
  else if (yogaCount / totalActivities > 0.1) personality = "Zen Master";
  else if (Object.keys(activityTypes).length > 4) personality = "Variety Pack";
  
  // Time of Day Checks (Independent/Sequential Overrides in original logic)
  if (morningCount / totalActivities > 0.4) personality = "Early Bird";
  else if (nightCount / totalActivities > 0.3) personality = "Night Owl";
  else if (weekendCount / totalActivities > 0.6) personality = "Weekend Warrior";
  else if (lunchCount / totalActivities > 0.2) personality = "Lunch Breaker";
  
  // Commuter Check
  if (commuterCount / totalActivities > 0.4) personality = "The Commuter";
  
  // The Machine (Ultimate Override)
  if (totalActivities > 300) personality = "The Machine";

  return {
    totalActivities,
    totalDistance: Math.round(totalDistance / 1000), // km
    totalCalories: Math.round(totalCalories),
    totalTime,
    topMonthsByDistance,
    activityTypes,
    newActivity: newActivity ? { type: newActivity[0], ...newActivity[1] } : { type: 'Moving', firstDate: new Date().toISOString() },
    topLocation,
    personality,
    year: new Date().getFullYear()
  };
};

export const personalityTraits = {
    "Run Forest, Run": { description: "You just kept on running.", icon: "🏃" },
    "Water Baby": { description: "You're more fish than human.", icon: "🐟" },
    "Variety Pack": { description: "You tried a bit of everything!", icon: "🎨" },
    "Early Bird": { description: "Getting the worm while others sleep.", icon: "🌅" },
    "Night Owl": { description: "The city is yours at night.", icon: "🦉" },
    "Weekend Warrior": { description: "Living for the weekend adventures.", icon: "🗓️" },
    "The Mover": { description: "You just love to move.", icon: "⚡" },
    "Mountain Goat": { description: "You love the elevation.", icon: "🐐" },
    "Zen Master": { description: "Finding peace in movement.", icon: "🧘" },
    "Lunch Breaker": { description: "Making the most of your break.", icon: "🥪" },
    "The Commuter": { description: "Getting there under your own power.", icon: "🚲" },
    "The Machine": { description: "You are unstoppable.", icon: "🤖" },
};
