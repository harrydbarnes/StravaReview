import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { DEFAULT_VIBE } from '../utils/dataProcessor';

const MIN_STREAK_FOR_DISPLAY = 5;
const LOCATION_NAME_LENGTH_THRESHOLD = 15;

export const SlideContainer = ({ children, textColor, className }) => (
  <div className={clsx("w-full h-full flex flex-col p-6 items-center justify-center text-center", className)}>
    <div className={clsx(textColor, "w-full h-full flex flex-col items-center justify-center relative")}>
        {children}
    </div>
  </div>
);

export const IntroSlide = ({ data, textColor }) => (
  <SlideContainer textColor={textColor}>
    <motion.h1 
      initial={{ y: 20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter"
    >
      Your Year <br/> in Activity
    </motion.h1>
    <motion.p 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="text-xl font-bold"
    >
        {data.year}
    </motion.p>
    <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ delay: 0.4, type: 'spring' }}
        className="mt-8 text-6xl md:text-8xl"
    >
        🔥
    </motion.div>
  </SlideContainer>
);

export const NewActivitySlide = ({ data, textColor }) => (
  <SlideContainer textColor={textColor}>
      <h2 className="text-3xl md:text-4xl font-bold mb-8">You tried something new!</h2>
      <motion.div 
        initial={{ rotate: -10, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        className={clsx("p-8 border-4 border-current rounded-3xl", data.newActivity.id && "cursor-pointer hover:scale-105 transition-transform")}
        onClick={() => data.newActivity.id && window.open(`https://www.strava.com/activities/${data.newActivity.id}`, '_blank', 'noopener,noreferrer')}
      >
          <div className="text-5xl md:text-7xl mb-4">🆕</div>
          <div className="text-2xl md:text-4xl font-black uppercase">{data.newActivity.type}</div>
          <p className="mt-2 opacity-80">Tried on {new Date(data.newActivity.firstDate).toLocaleDateString()}</p>
      </motion.div>
  </SlideContainer>
);

export const LocationSlide = ({ data, textColor }) => {
    // Dynamic sizing based on length
    const nameLength = data.topLocation.name.length;
    const textSizeClass = nameLength > LOCATION_NAME_LENGTH_THRESHOLD ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl";

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Favorite Playground</h2>
            <motion.div
                className="text-8xl md:text-9xl mb-4"
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                📍
            </motion.div>
            <h3 className={clsx(textSizeClass, "font-black uppercase leading-tight max-w-full whitespace-nowrap overflow-hidden text-ellipsis")}>
                {data.topLocation.name}
            </h3>
            <p className="mt-4 text-xl opacity-80">{data.topLocation.count} activities here</p>
        </SlideContainer>
    );
};

export const PersonalitySlide = ({ data, textColor, traits }) => {
    const trait = traits[data.personality] || traits["The Mover"];
    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-widest">Activity Personality</h2>
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl md:text-[10rem] mb-6"
            >
                {trait.icon}
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 uppercase">{data.personality}</h1>
            <p className="text-xl md:text-2xl font-medium max-w-xs">{trait.description}</p>
        </SlideContainer>
    );
};

export const TopMonthsSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Peak Performance Months</h2>
        <div className="w-full space-y-4 max-w-md">
            {data.topMonthsByDistance.map((m, idx) => (
                <motion.div 
                    key={m.month}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center justify-between p-4 border-2 border-current rounded-xl"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black">#{idx + 1}</span>
                        <span className="text-xl font-bold">{m.month}</span>
                    </div>
                    <span className="text-lg">{Math.round(m.distance / 1000)} km</span>
                </motion.div>
            ))}
        </div>
    </SlideContainer>
);

export const SummarySlide = ({ data, theme, textColor, traits }) => {
    const ref = React.useRef(null);
    const vibeData = traits ? (traits[data.vibe] || traits[DEFAULT_VIBE]) : null;

    const handleDownload = async () => {
        if (ref.current) {
             const dataUrl = await import('html-to-image').then(mod => mod.toPng(ref.current, { cacheBust: true, pixelRatio: 2 }));
             const link = document.createElement('a');
             link.download = 'strava-wrapped-summary.png';
             link.href = dataUrl;
             link.click();
        }
    };

    return (
        <div className={clsx("w-full h-full flex flex-col p-6 items-center justify-between text-center")}>
            <div className={clsx("flex-1 w-full flex flex-col items-center justify-center", textColor)}>
                <div ref={ref} className={clsx("w-full h-full flex flex-col items-center justify-center p-6 rounded-xl relative", theme.bg, textColor)}>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        STRAVA <br/> <span className="text-brand-orange">WRAPPED</span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 uppercase opacity-80">{data.year} Grand Total</h2>

                    <div className="grid grid-cols-2 gap-8 w-full max-w-lg mb-8">
                        <div className="text-center">
                            <p className="text-4xl md:text-6xl font-black">{data.totalActivities}</p>
                            <p className="text-sm md:text-base uppercase tracking-widest opacity-75">Activities</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl md:text-6xl font-black">{data.totalHours}</p>
                            <p className="text-sm md:text-base uppercase tracking-widest opacity-75">Hours</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl md:text-6xl font-black">{data.totalDistance}</p>
                            <p className="text-sm md:text-base uppercase tracking-widest opacity-75">Km</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-5xl font-black">{data.totalCalories.toLocaleString()}</p>
                            <p className="text-sm md:text-base uppercase tracking-widest opacity-75">Cals</p>
                        </div>
                    </div>

                    {vibeData && (
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 opacity-80">
                            <span className="text-2xl">{vibeData.icon}</span>
                            <span className="text-lg font-bold uppercase tracking-widest">{data.vibe}</span>
                        </div>
                    )}

                </div>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(); }} 
                className="mt-4 px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 shadow-lg z-50 pointer-events-auto hover:bg-gray-100 transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Save & Share
            </button>
        </div>
    );
};

// 1. TOP SPORTS SLIDE
export const TopSportsSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8 uppercase">Your Top Sports</h2>
        <div className="w-full max-w-md space-y-4">
            {data.topSports.map((sport, idx) => (
                <motion.div
                    key={sport.type}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 border-2 border-current rounded-xl bg-white/5 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black opacity-50">#{idx + 1}</span>
                        <div className="text-left">
                            <div className="font-bold text-lg">{sport.type}</div>
                            <div className="text-xs opacity-75">{sport.count} sessions</div>
                        </div>
                    </div>
                    <div className="text-xl font-bold">{sport.displayValue}</div>
                </motion.div>
            ))}
        </div>
    </SlideContainer>
);

// 2. FUN STATS (Time Comparison) SLIDE
export const FunStatsSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-12 uppercase text-center">Time Well Spent</h2>

        <div className="grid grid-cols-1 gap-8 w-full max-w-lg">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 border-2 border-current rounded-2xl relative overflow-hidden"
            >
                <div className="relative z-10">
                    <p className="text-lg opacity-80 mb-2">You moved for</p>
                    <p className="text-5xl font-black mb-4">{data.totalHours} Hours</p>
                    <p className="text-lg font-medium">
                        That&apos;s like listening to <br/>
                        <span className="font-black italic">&quot;{data.funComparisons.song.title}&quot;</span> <br/>
                        <span className="text-4xl font-bold text-brand-orange">{data.funComparisons.song.count}</span> times! 💃
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4"
            >
                <span className="text-4xl">🎬</span>
                <p className="text-xl">
                    Or watching <span className="font-bold">{data.funComparisons.movie.title}</span> <span className="font-bold">{data.funComparisons.movie.count}</span> times.
                </p>
            </motion.div>
        </div>
    </SlideContainer>
);

// 3. SPOTLIGHT / KUDOS SLIDE
export const SpotlightSlide = ({ data, textColor }) => {
    // Fallback if no kudos data
    const activity = data.mostLikedActivity || data.spotlightActivity;
    if (!activity) return null;

    return (
        <SlideContainer textColor={textColor}>
            <div className="absolute top-10 right-10 rotate-12">
                <div className="bg-white text-black font-bold px-4 py-2 rounded-full shadow-lg">
                    🏆 Fan Favorite
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-8 opacity-80">The Crowd went Wild</h2>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-8 border-4 border-current rounded-3xl max-w-md w-full hover:scale-105 transition-transform cursor-pointer"
                onClick={() => window.open(`https://www.strava.com/activities/${activity.id}`, '_blank', 'noopener,noreferrer')}
            >
                <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl">👍</span>
                    <span className="text-5xl font-black">{activity.kudos_count || 0}</span>
                </div>

                <h3 className="text-2xl font-black uppercase mb-2 line-clamp-2">{activity.name}</h3>
                <p className="opacity-75 mb-6">{new Date(activity.start_date).toLocaleDateString()}</p>

                <div className="grid grid-cols-2 gap-4 text-sm font-bold opacity-80">
                    <div className="bg-current/10 p-2 rounded-lg">
                        {Math.round(activity.distance / 1000)} km
                    </div>
                    <div className="bg-current/10 p-2 rounded-lg">
                        {Math.round(activity.moving_time / 60)} min
                    </div>
                </div>
            </motion.div>
        </SlideContainer>
    );
};

// 4. VIBE SLIDE (Replaces Old Personality Slide)
export const VibeSlide = ({ data, textColor, traits }) => {
    const vibeData = traits[data.vibe] || traits[DEFAULT_VIBE];

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-xl font-bold mb-4 mt-12 md:mt-20 uppercase tracking-[0.2em] opacity-60">{data.year} Vibe Check</h2>

            <motion.div
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="text-[8rem] md:text-[10rem] mb-4 drop-shadow-2xl"
            >
                {vibeData.icon}
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-center leading-none">
                {data.vibe}
            </h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-sm mb-4"
            >
                <p className="text-lg md:text-xl font-medium leading-relaxed">
                    &quot;{vibeData.description}&quot;
                </p>
            </motion.div>

            {data.longestStreak > MIN_STREAK_FOR_DISPLAY && (
                <div className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-75">
                    <span>🔥 {data.longestStreak} Week Streak</span>
                </div>
            )}
        </SlideContainer>
    );
};
