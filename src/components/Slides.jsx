import React from 'react';
import clsx from 'clsx';
import { motion, animate } from 'framer-motion';
import { DEFAULT_VIBE } from '../utils/dataProcessor';
import { useDoubleClick } from '../hooks/useDoubleClick';

const MIN_STREAK_FOR_DISPLAY = 5;
export const DRAMATIC_DELAY = 3;
export const STAGGER_DELAY = 1.5;
const INTRO_DELAY = 0.8;
const T_REX_SPEED_MPH = 18;

const CountUp = ({ value, label, delay = 0 }) => {
    const ref = React.useRef(null);
    const numericValue = typeof value === 'string'
        ? parseFloat(value.replace(/,/g, ''))
        : value;
    const isInt = Number.isInteger(numericValue);

    React.useEffect(() => {
        const controls = animate(0, numericValue, {
            duration: 2.5,
            delay: delay,
            ease: "easeOut",
            onUpdate: (v) => {
                if (ref.current) {
                    ref.current.textContent = isInt
                        ? Math.round(v).toLocaleString()
                        : v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                }
            }
        });
        return controls.stop;
    }, [numericValue, delay, isInt]);

    return (
        <div className="text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay, duration: 0.5 }}
            >
                <p className="text-4xl md:text-6xl font-black">
                    <span ref={ref}>0</span>
                </p>
                <p className="text-sm md:text-base uppercase tracking-widest opacity-75">{label}</p>
            </motion.div>
        </div>
    );
};

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
        transition={{ delay: INTRO_DELAY }}
        className="text-xl font-bold"
    >
        {data.year}
    </motion.p>
    <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ delay: INTRO_DELAY + 0.4 }}
        className="mt-8 text-6xl md:text-8xl"
    >
        🔥
    </motion.div>
  </SlideContainer>
);

export const PercentSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Life in Motion</h2>
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY - 2 }}
            className="mb-8"
        >
            <p className="text-6xl md:text-8xl font-black text-brand-orange mb-2">
                {data.percentTimeMoving.toFixed(1)}%
            </p>
            <p className="text-xl font-bold">of your year spent moving</p>
        </motion.div>

        <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY }}
            className="max-w-md bg-white/10 p-6 rounded-xl backdrop-blur-sm"
        >
            <p className="mb-4 text-lg">For comparison, you spent about <span className="font-bold">29%</span> of your year sleeping.</p>
            <p className="text-xl font-bold italic opacity-90">
                &quot;You were definitely awake for the fun parts.&quot;
            </p>
        </motion.div>
    </SlideContainer>
);

export const OlympicsSlide = ({ data, textColor }) => {
    // Logic: Prioritize Swim data if available, else Run. If neither, return null (but structure handles that).
    // The slide might be rendered even if 0, so we check data.
    const isSwim = data.olympics.poolLengths > 0;
    const isRun = data.olympics.sprints > 0;

    if (!isSwim && !isRun) return null;

    const emoji = isSwim ? "🏊" : "🏃";
    const statText = isSwim
        ? `You swam ${data.olympics.poolLengths} Olympic Pool lengths`
        : `You ran the 100m Dash ${data.olympics.sprints} times`;

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">LA 2028 Calling?</h2>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                className="text-8xl mb-6"
            >
                {emoji}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY - 1 }}
                className="text-2xl font-bold mb-8 max-w-md"
            >
                {statText}
            </motion.div>

            <motion.div
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: DRAMATIC_DELAY + 1 }}
                 className="bg-current/10 p-6 rounded-xl max-w-md"
            >
                <p className="font-bold italic">
                    &quot;But you wouldn&apos;t have broken any World Records. Sorry. Try again in 2028. 🥇&quot;
                </p>
            </motion.div>
        </SlideContainer>
    );
};

export const ShortestSlide = ({ data, textColor, showClickHint }) => {
    if (!data.shortestActivity) return null;

    const handleDoubleClick = React.useCallback(() => {
        if (!data.shortestActivity.id) return;
        window.open(`https://www.strava.com/activities/${data.shortestActivity.id}`, '_blank', 'noopener,noreferrer');
    }, [data.shortestActivity.id]);

    const { clickCount, handleClick } = useDoubleClick(handleDoubleClick);

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">What was this one, btw?</h2>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY - 1.5 }}
                className={clsx("p-8 border-4 border-current rounded-full w-64 h-64 flex flex-col items-center justify-center mb-8 bg-white/5 relative", data.shortestActivity.id && "cursor-pointer hover:scale-105 transition-transform")}
                onClick={handleClick}
            >
                <p className="text-4xl font-black">{data.shortestActivity.distanceKm} km</p>
                <p className="text-sm font-bold uppercase mt-2 max-w-[150px] truncate">{data.shortestActivity.type}</p>

                {showClickHint && clickCount < 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: DRAMATIC_DELAY + 1 }}
                        className="absolute -bottom-16 left-0 right-0 text-sm font-bold uppercase tracking-widest opacity-75"
                    >
                        (Click twice to open!)
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY }}
            >
                <p className="text-xl font-bold mb-2">
                     &quot;{data.shortestActivity.name}&quot;
                </p>
                <p className="opacity-80 italic">Short, sweet, and complete. Every step counts!</p>
            </motion.div>
        </SlideContainer>
    );
};

export const ElevationSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-20">The Vertical Limit</h2>

        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-end justify-center gap-1 mb-8"
        >
            <div className="w-8 h-16 bg-current opacity-20 rounded-t-lg"></div>
            <div className="w-12 h-24 bg-current opacity-40 rounded-t-lg"></div>
            <div className="w-16 h-40 bg-current opacity-60 rounded-t-lg"></div>
            <div className="w-20 h-64 bg-current rounded-t-lg relative flex flex-col items-center justify-end">
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 font-black text-2xl whitespace-nowrap z-10"
                 >
                     {data.elevation.total}m
                 </motion.div>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY }}
            className="text-xl font-bold max-w-md"
        >
            That&apos;s equal to stacking Big Ben <span className="text-3xl text-brand-orange block my-2">{data.elevation.bigBenCount} times! 🕰️</span>
        </motion.div>
    </SlideContainer>
);

export const FuelSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">The Fuel Tank</h2>

        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5, delay: 0.5 }}
            className="text-[8rem] mb-8"
        >
            🍕
        </motion.div>

        <div className="flex flex-col gap-4 text-xl font-bold">
            <motion.p
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY }}
            >
                Burned <span className="text-3xl font-black">{data.totalCalories.toLocaleString()}</span> Calories
            </motion.p>
             <motion.p
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY + 1 }}
                className="opacity-90"
            >
                You earned <span className="text-2xl font-black text-brand-orange">{data.food.pizza}</span> Slices of Pizza! <br/>
                <span className="text-sm font-normal opacity-70">(Zero guilt attached)</span>
            </motion.p>
        </div>
    </SlideContainer>
);

export const PaceSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">The Consistent Cruiser</h2>

        <div className="flex flex-col gap-8 w-full max-w-md">
            {data.averagePace.run && (
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: DRAMATIC_DELAY - 1.5 }}
                    className="flex items-center justify-between p-6 border-2 border-current rounded-xl"
                >
                    <div className="text-left">
                        <p className="text-sm font-bold uppercase opacity-70">Avg Run Pace</p>
                        <p className="text-4xl font-black">{data.averagePace.run}</p>
                    </div>
                    <span className="text-4xl">🏃</span>
                </motion.div>
            )}

             {data.averagePace.ride && (
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: DRAMATIC_DELAY - 0.5 }}
                    className="flex items-center justify-between p-6 border-2 border-current rounded-xl"
                >
                    <div className="text-left">
                        <p className="text-sm font-bold uppercase opacity-70">Avg Ride Speed</p>
                        <p className="text-4xl font-black">{data.averagePace.ride}</p>
                    </div>
                    <span className="text-4xl">🚴</span>
                </motion.div>
            )}

            {!data.averagePace.run && !data.averagePace.ride && (
                 <p className="text-xl">Just cruising at your own speed.</p>
            )}
        </div>
    </SlideContainer>
);

export const SpeedSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">The Need for Speed</h2>

        <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="text-8xl mb-8"
        >
            🦖
        </motion.div>

        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY - 1 }}
            className="mb-8"
        >
            <p className="text-sm uppercase font-bold opacity-70 mb-2">Top Speed Reached</p>
            <p className="text-7xl font-black italic">{data.speed.max} <span className="text-3xl not-italic">mph</span></p>
        </motion.div>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY }}
            className="text-lg max-w-sm"
        >
            {data.speed.max > T_REX_SPEED_MPH
                ? `Faster than a T-Rex (${T_REX_SPEED_MPH}mph). You'd survive Jurassic Park!`
                : `A T-Rex (${T_REX_SPEED_MPH}mph) might catch you. Run faster next year!`}
        </motion.p>
    </SlideContainer>
);

export const SlowestSlide = ({ data, textColor, showClickHint }) => {
    if (!data.speed.slowestActivity) return null;

    const handleDoubleClick = React.useCallback(() => {
        if (!data.speed.slowestActivity.id) return;
        window.open(`https://www.strava.com/activities/${data.speed.slowestActivity.id}`, '_blank', 'noopener,noreferrer');
    }, [data.speed.slowestActivity.id]);

    const { clickCount, handleClick } = useDoubleClick(handleDoubleClick);

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Slow and Steady Wins... a Race</h2>

            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 3, ease: "linear" }}
                className="text-8xl mb-8"
            >
                🐌
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: DRAMATIC_DELAY }}
                className={clsx("bg-white/10 p-6 rounded-xl backdrop-blur-sm max-w-md relative", data.speed.slowestActivity.id && "cursor-pointer hover:scale-105 transition-transform")}
                onClick={handleClick}
            >
                <p className="text-xl font-bold mb-4 line-clamp-2">&quot;{data.speed.slowestActivity.name}&quot;</p>
                <p className="opacity-90">
                    Was <span className="font-black text-brand-orange">{data.speed.diffPercent}%</span> slower than your fastest.
                </p>
                <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">Taking in the scenery?</p>

                {showClickHint && clickCount < 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute -bottom-12 left-0 right-0 text-sm font-bold uppercase tracking-widest opacity-75"
                    >
                        (Click twice to open!)
                    </motion.div>
                )}
            </motion.div>
        </SlideContainer>
    );
};

export const HeatmapSlide = ({ data, textColor }) => {
    // Trim leading/trailing zeros
    const hourly = data.charts.hourly;
    const firstActive = hourly.findIndex(v => v > 0);
    const lastActive = hourly.findLastIndex(v => v > 0);

    // If no data, fallback to full range
    const startIdx = firstActive === -1 ? 0 : firstActive;
    const endIdx = lastActive === -1 ? 23 : lastActive;

    const displayData = hourly.slice(startIdx, endIdx + 1);
    const maxVal = Math.max(...displayData);

    // Original peak logic relative to full day
    const peakHour = hourly.indexOf(Math.max(...hourly));

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Clockwatcher</h2>

            <div className="flex flex-col w-full max-w-md">
                <div className="flex items-end gap-1 h-48 mb-2 w-full justify-between">
                    {displayData.map((val, idx) => {
                        const actualHour = startIdx + idx;
                        return (
                            <motion.div
                                key={actualHour}
                                initial={{ height: 0 }}
                                animate={{ height: `${maxVal > 0 ? (val / maxVal) * 100 : 0}%` }}
                                transition={{ delay: idx * 0.05 + 0.5 }}
                                className={clsx("flex-1 rounded-t-sm min-h-[4px]", actualHour === peakHour ? "bg-brand-orange" : "bg-current opacity-50")}
                            />
                        );
                    })}
                </div>

                {/* X-Axis Legend */}
                <div className="flex justify-between text-xs font-bold opacity-60 px-1">
                    <span>{startIdx}:00</span>
                    {/* Show midpoint if range is wide enough */}
                    {endIdx - startIdx > 6 && (
                        <span>{Math.floor((startIdx + endIdx) / 2)}:00</span>
                    )}
                    <span>{endIdx}:00</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY }}
                className="mt-6"
            >
                <p className="text-2xl font-bold">
                    You are most active at <span className="text-4xl block my-2">{peakHour}:00</span>
                </p>
            </motion.div>
        </SlideContainer>
    );
};

export const WeeklyPatternSlide = ({ data, textColor }) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const maxVal = Math.max(...data.charts.daily);

    // Identify top 3 days
    const indexedDaily = data.charts.daily.map((val, i) => ({ val, i }));
    // Sort descending by value
    indexedDaily.sort((a, b) => b.val - a.val);

    // Create a map of index -> rank (0, 1, 2 for top 3)
    const rankMap = {};
    indexedDaily.slice(0, 3).forEach((item, rank) => {
        if (item.val > 0) rankMap[item.i] = rank;
    });

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-12">The Weekly Grind</h2>

            <div className="w-full max-w-md relative h-64 mb-8">
                 <div className="flex items-end h-full w-full px-4 gap-1">
                     {data.charts.daily.map((val, idx) => {
                         const heightPercent = maxVal > 0 ? (val / maxVal) * 80 : 0;

                         // Determine color based on rank
                         const podiumColors = { 0: 'bg-[#FFD700]', 1: 'bg-[#C0C0C0]', 2: 'bg-[#CD7F32]' };
                         const barColor = podiumColors[rankMap[idx]] ?? "bg-brand-orange";

                         return (
                             <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                                 <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{ delay: idx * 0.1 + 0.5, type: 'spring' }}
                                    className={clsx("w-full rounded-t-lg relative group", barColor)}
                                 >
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-black text-white px-2 py-1 rounded">
                                         {val}
                                     </div>
                                 </motion.div>
                                 <span className="font-bold opacity-70">{days[idx]}</span>
                             </div>
                         );
                     })}
                 </div>
            </div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: DRAMATIC_DELAY }}
                className="text-xl font-bold opacity-90"
            >
                Your week in motion.
            </motion.p>
        </SlideContainer>
    );
};

export const KudosSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">The Social Butterfly</h2>

        <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
            className="text-[8rem] mb-8"
        >
            👍
        </motion.div>

        <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: DRAMATIC_DELAY }}
             className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm"
        >
            <p className="text-6xl font-black mb-4">{data.kudosRatio}</p>
            <p className="text-xl font-bold">high-fives for every km you moved!</p>
        </motion.div>
    </SlideContainer>
);

export const NewActivitySlide = ({ data, textColor, showClickHint }) => {
  const handleDoubleClick = React.useCallback(() => {
      if (!data.newActivity.id) return;
      window.open(`https://www.strava.com/activities/${data.newActivity.id}`, '_blank', 'noopener,noreferrer');
  }, [data.newActivity.id]);

  const { clickCount, handleClick } = useDoubleClick(handleDoubleClick);

  return (
      <SlideContainer textColor={textColor}>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">You Tried Something New</h2>
          <motion.div
            initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ delay: DRAMATIC_DELAY, duration: 0.5 }}
            className={clsx("p-8 border-4 border-current rounded-3xl relative", data.newActivity.id && "cursor-pointer hover:scale-105 transition-transform")}
            onClick={handleClick}
          >
              <div className="text-5xl md:text-7xl mb-4">🆕</div>
              <div className="text-2xl md:text-4xl font-black uppercase">{data.newActivity.type}</div>
              <p className="mt-2 opacity-80">Tried on {new Date(data.newActivity.firstDate).toLocaleDateString()}</p>

              {showClickHint && clickCount < 2 && (
                  <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: DRAMATIC_DELAY + 1 }}
                      className="absolute -bottom-12 left-0 right-0 text-sm font-bold uppercase tracking-widest opacity-75"
                  >
                      (Click twice to open activity!)
                  </motion.div>
              )}
          </motion.div>
      </SlideContainer>
  );
};

export const LocationSlide = ({ data, textColor }) => {
    // Dynamic sizing based on length
    const nameLength = data.topLocation.name.length;
    let textSizeClass = "text-4xl md:text-6xl"; // Default (Short)

    if (nameLength > 20) {
        textSizeClass = "text-xl md:text-2xl"; // Extra Long
    } else if (nameLength > 14) {
        textSizeClass = "text-2xl md:text-4xl"; // Long
    } else if (nameLength > 8) {
        textSizeClass = "text-3xl md:text-5xl"; // Medium
    }

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Favorite Playground</h2>
            <motion.div
                className="text-8xl md:text-9xl mb-4"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: DRAMATIC_DELAY }}
            >
                📍
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: DRAMATIC_DELAY + 0.5, type: "spring" }}
            >
                <h3 className={clsx(textSizeClass, "font-black uppercase leading-tight max-w-full break-words")}>
                    {data.topLocation.name}
                </h3>
                <p className="mt-4 text-xl opacity-80">{data.topLocation.count} activities here</p>
            </motion.div>
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
                    transition={{ delay: DRAMATIC_DELAY + (idx * STAGGER_DELAY) }}
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

                    <div className="grid grid-cols-2 gap-8 w-full max-w-lg mb-4">
                        <CountUp value={data.totalActivities} label="Activities" delay={0.5} />
                        <CountUp value={data.totalHours} label="Hours" delay={1.0} />
                        <CountUp value={data.totalDistance} label="Km" delay={1.5} />
                        <CountUp value={data.totalCalories} label="Cals" delay={2.0} />
                    </div>

                    {vibeData && (
                        <div className="flex items-center justify-center gap-2 opacity-80 mb-4">
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
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Your Top Sports</h2>
        <div className="w-full max-w-md space-y-4">
            {data.topSports.map((sport, idx) => (
                <motion.div
                    key={sport.type}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: DRAMATIC_DELAY + (idx * STAGGER_DELAY) }}
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
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Time Well Spent</h2>

        <div className="grid grid-cols-1 gap-8 w-full max-w-lg">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY - 1 }}
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
                transition={{ delay: (DRAMATIC_DELAY - 1) + STAGGER_DELAY }}
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
export const SpotlightSlide = ({ data, textColor, showClickHint }) => {
    // Fallback if no kudos data
    const activity = data.mostLikedActivity || data.spotlightActivity;

    const handleDoubleClick = React.useCallback(() => {
        if (activity) {
            window.open(`https://www.strava.com/activities/${activity.id}`, '_blank', 'noopener,noreferrer');
        }
    }, [activity]);

    const { clickCount, handleClick } = useDoubleClick(handleDoubleClick);

    if (!activity) return null;

    return (
        <SlideContainer textColor={textColor}>
            <motion.div
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                transition={{ delay: 1.0 }}
                className="absolute top-16 right-10"
            >
                <div className="bg-white text-black font-bold px-4 py-2 rounded-full shadow-lg">
                    🏆 Fan Favorite
                </div>
            </motion.div>

            <h2 className="text-3xl font-bold mb-8 opacity-80">The Crowd Went Wild</h2>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-8 border-4 border-current rounded-3xl max-w-md w-full hover:scale-105 transition-transform cursor-pointer relative"
                onClick={handleClick}
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

                {showClickHint && clickCount < 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute -bottom-12 left-0 right-0 text-sm font-bold uppercase tracking-widest opacity-75"
                    >
                        (Click twice to open activity!)
                    </motion.div>
                )}
            </motion.div>
        </SlideContainer>
    );
};

// 4. VIBE SLIDE (Replaces Old Personality Slide)
export const VibeSlide = ({ data, textColor, traits }) => {
    const vibeData = traits ? (traits[data.vibe] || traits[DEFAULT_VIBE]) : null;

    return (
        <SlideContainer textColor={textColor}>
            <h2 className="mt-8 md:mt-12 mb-2 text-xl font-bold uppercase tracking-[0.2em] opacity-60">{data.year} Vibe Check</h2>

            <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: DRAMATIC_DELAY }}
                className="mb-2 text-[8rem] md:text-[10rem] drop-shadow-2xl"
            >
                {vibeData.icon}
            </motion.div>

            <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: DRAMATIC_DELAY + 0.5, type: "spring" }}
                className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-center leading-none"
            >
                {data.vibe}
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: DRAMATIC_DELAY + 0.8 }}
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
