import React, { useState, useEffect, useRef, Suspense } from 'react';
import { generateMockActivities, analyzeData } from './utils/dataProcessor';
import { getAuthUrl, exchangeToken, fetchActivities } from './utils/stravaApi';
import { getCityFromCoords } from './utils/geocoder';
import { AlertCircle, HelpCircle } from 'lucide-react';
import HowToSetup from './components/HowToSetup';

// Lazy load the StoryContainer which holds all the heavy slide logic and framer-motion dependencies
const StoryContainer = React.lazy(() => import('./components/StoryContainer'));

const STORAGE_KEY_CLIENT_ID = 'strava_client_id';
const STORAGE_KEY_CLIENT_SECRET = 'strava_client_secret';

function App() {
  const targetYear = new Date().getFullYear() - 1;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  
  // Auth state
  const [clientId, setClientId] = useState(import.meta.env.VITE_STRAVA_CLIENT_ID || '');
  const [clientSecret, setClientSecret] = useState(import.meta.env.VITE_STRAVA_CLIENT_SECRET || '');
  const [needsCreds] = useState(!import.meta.env.VITE_STRAVA_CLIENT_ID);

  // Audio ref for entry sound
  const entryAudioRef = useRef(null);

  useEffect(() => {
    // Initialize entry audio
    entryAudioRef.current = new Audio(import.meta.env.BASE_URL + 'Entry.mp3');
    entryAudioRef.current.volume = 0.5;

    return () => {
      if (entryAudioRef.current) {
        entryAudioRef.current.pause();
        entryAudioRef.current.src = '';
        entryAudioRef.current = null;
      }
    };
  }, []);

  const playEntrySound = () => {
    if (entryAudioRef.current) {
        try {
            entryAudioRef.current.currentTime = 0;
            entryAudioRef.current.play().catch(e => console.warn("Audio play failed", e));
        } catch(e) {
            console.warn("Audio error", e);
        }
    }
  };

  useEffect(() => {
    // Migrate credentials from localStorage to sessionStorage for a seamless user transition.
    const migrateItem = (key) => {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, legacyValue);
      }
      localStorage.removeItem(key);
    };
    migrateItem(STORAGE_KEY_CLIENT_ID);
    migrateItem(STORAGE_KEY_CLIENT_SECRET);

    const handleAuth = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        // Retrieve creds from storage if we were redirecting back
        const storedClientId = sessionStorage.getItem(STORAGE_KEY_CLIENT_ID);
        const storedClientSecret = sessionStorage.getItem(STORAGE_KEY_CLIENT_SECRET);
        
        if (code && storedClientId && storedClientSecret) {
            setLoading(true);
            setLoadingStatus('Authenticating with Strava...');
            // Clear code from URL to clean up
            window.history.replaceState({}, document.title, window.location.pathname);

            try {
                const tokenData = await exchangeToken(storedClientId, storedClientSecret, code);
                
                setLoadingStatus('Fetching your activities (this might take a moment)...');
                const activities = await fetchActivities(tokenData.access_token, targetYear);
                
                setLoadingStatus('Analyzing your year...');
                const result = analyzeData(activities, targetYear);
                
                if (result) {
                    // Enrich with geocoded city if needed
                    if (result.topLocation && result.topLocation.requiresGeocoding && result.topLocation.center) {
                        setLoadingStatus('Finding your playground...');
                        const cityName = await getCityFromCoords(result.topLocation.center[0], result.topLocation.center[1]);
                        if (cityName) {
                            result.topLocation.name = cityName;
                        }
                    }

                    setData(result);
                    setStarted(true); // Auto start if we have data from redirect
                } else {
                    setError(`No activities found for ${targetYear}. Go record some activities!`);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to connect to Strava. Please check your credentials and try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    handleAuth();
  }, []);

  const handleConnect = () => {
      if (!clientId || !clientSecret) {
          setError("Please enter your Client ID and Client Secret.");
          return;
      }
      
      // Save to session storage for retrieval after redirect
      sessionStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId);
      sessionStorage.setItem(STORAGE_KEY_CLIENT_SECRET, clientSecret);
      
      // Use current URL without query/hash params as redirect URI to support subdirectories
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      window.location.href = getAuthUrl(clientId, redirectUri);
  };

  const handleDemo = async () => {
      setLoading(true);
      setLoadingStatus('Generating demo data...');

      try {
        await new Promise(r => setTimeout(r, 800));

        const mock = generateMockActivities(targetYear);
        // Ensure we analyze the same year we generated for
        const result = analyzeData(mock, targetYear);

        if (result) {
            // Enrich with geocoded city if needed
            if (result.topLocation && result.topLocation.requiresGeocoding && result.topLocation.center) {
                setLoadingStatus('Finding your playground...');
                const cityName = await getCityFromCoords(result.topLocation.center[0], result.topLocation.center[1]);
                if (cityName) {
                    result.topLocation.name = cityName;
                }
            }

            setData(result);
            setStarted(true);
        } else {
            setError("Failed to generate demo data.");
        }
      } catch (err) {
        console.error("Error generating demo data:", err);
        setError("Failed to generate demo data. Please try again.");
      } finally {
        setLoading(false);
      }
  };

  if (!started) {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[128px] pointer-events-none" />
              
              <div className="z-10 w-full max-w-md flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                    STRAVA <br/> <span className="text-brand-orange">WRAPPED</span>
                </h1>
                
                <p className="text-gray-400 mb-8 text-lg">
                    See your {targetYear} year in review. <br/> Connect your account to get started.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm text-left">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium animate-pulse">{loadingStatus}</p>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        {needsCreds && (
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm space-y-4 text-left">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="client-id" className="text-xs uppercase font-bold text-gray-500 tracking-wider">Client ID</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowHowTo(true)}
                                            className="text-brand-orange text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            <HelpCircle size={14} /> Help!
                                        </button>
                                    </div>
                                    <input 
                                        id="client-id"
                                        type="text" 
                                        required
                                        autoComplete="off"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        placeholder="e.g., 12345"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="client-secret" className="text-xs uppercase font-bold text-gray-500 tracking-wider">Client Secret</label>
                                    <input 
                                        id="client-secret"
                                        type="password" 
                                        required
                                        autoComplete="off"
                                        value={clientSecret}
                                        onChange={(e) => setClientSecret(e.target.value)}
                                        placeholder="e.g., a1b2c3..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Your credentials are stored locally and sent only to Strava.
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleConnect}
                            className="w-full px-8 py-4 bg-brand-orange text-white text-xl font-bold rounded-xl hover:bg-brand-orange/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-orange/20"
                        >
                            Connect with Strava
                        </button>
                        
                        <button 
                            onClick={handleDemo}
                            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            Try Demo Mode
                        </button>
                    </div>
                )}
              </div>
              <HowToSetup isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
          </div>
      );
  }

  // Reuse the loading spinner for Suspense fallback
  const LoadingFallback = () => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm font-medium animate-pulse">Loading experience...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
            <StoryContainer
                data={data}
                onClose={() => setStarted(false)}
                playEntrySound={playEntrySound}
            />
        </Suspense>
    </div>
  );
}

export default App;
