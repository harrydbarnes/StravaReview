const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export const getAuthUrl = (clientId, redirectUri) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
};

export const exchangeToken = async (clientId, clientSecret, code) => {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange token');
  }

  return response.json();
};

export const fetchActivities = async (accessToken, year) => {
  let activities = [];
  let page = 1;
  const perPage = 200; // Strava allows up to 200
  const targetYear = year || new Date().getFullYear();
  // Epoch timestamp for Jan 1st of target year
  const after = Math.floor(new Date(targetYear, 0, 1).getTime() / 1000);
  // Epoch timestamp for Jan 1st of next year
  const before = Math.floor(new Date(targetYear + 1, 0, 1).getTime() / 1000);

  while (true) {
    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}&after=${after}&before=${before}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
        if (response.status === 429) {
             throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error('Failed to fetch activities');
    }

    const data = await response.json();

    if (data.length === 0) break;

    activities = [...activities, ...data];
    page++;
    
    // Safety break to prevent infinite loops if user has TONS of activities (e.g., > 1000)
    // 20 pages * 50 = 1000 activities. Should be enough for most.
    if (page > 20) break; 
  }

  return activities;
};
