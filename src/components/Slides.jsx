import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Removed 'theme' from SlideContainer props since it wasn't used in the destructured variable usage inside, 
// but it is passed to it. The linter complained about unused vars.
// We can just keep it in props but not use it if we don't need it, or use it for background if needed.
// But the linter is strict. I will remove unused destructured props.

export const SlideContainer = ({ children, textColor, className }) => (
  <div className={clsx("w-full h-full flex flex-col p-6 items-center justify-center text-center", className)}>
    <div className={clsx(textColor, "w-full h-full flex flex-col items-center justify-center")}>
        {children}
    </div>
  </div>
);

export const IntroSlide = ({ data, textColor }) => (
  <SlideContainer textColor={textColor}>
    <motion.h1 
      initial={{ y: 20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      className="text-4xl font-black mb-4 uppercase tracking-tighter"
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
        className="mt-8 text-6xl"
    >
        🔥
    </motion.div>
  </SlideContainer>
);

export const NewActivitySlide = ({ data, textColor }) => (
  <SlideContainer textColor={textColor}>
      <h2 className="text-3xl font-bold mb-8">You tried something new!</h2>
      <motion.div 
        initial={{ rotate: -10, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        className="p-8 border-4 border-current rounded-3xl"
      >
          <div className="text-5xl mb-4">🆕</div>
          <div className="text-2xl font-black uppercase">{data.newActivity.type}</div>
          <p className="mt-2 opacity-80">Tried on {new Date(data.newActivity.firstDate).toLocaleDateString()}</p>
      </motion.div>
  </SlideContainer>
);

export const LocationSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl font-bold mb-6">Your Favorite Playground</h2>
        <motion.div 
            className="text-8xl mb-4"
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
        >
            📍
        </motion.div>
        <h3 className="text-4xl font-black uppercase leading-tight">
            {data.topLocation.name}
        </h3>
        <p className="mt-4 text-xl opacity-80">{data.topLocation.count} activities here</p>
    </SlideContainer>
);

export const PersonalitySlide = ({ data, textColor, traits }) => {
    const trait = traits[data.personality] || traits["The Mover"];
    return (
        <SlideContainer textColor={textColor}>
            <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest">Activity Personality</h2>
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl mb-6"
            >
                {trait.icon}
            </motion.div>
            <h1 className="text-5xl font-black mb-4 uppercase">{data.personality}</h1>
            <p className="text-xl font-medium max-w-xs">{trait.description}</p>
        </SlideContainer>
    );
};

export const TopMonthsSlide = ({ data, textColor }) => (
    <SlideContainer textColor={textColor}>
        <h2 className="text-3xl font-bold mb-8">Peak Performance Months</h2>
        <div className="w-full space-y-4">
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

export const SummarySlide = ({ data, theme, textColor }) => {
    const ref = React.useRef(null);

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
        <SlideContainer textColor={textColor} className="justify-between py-12">
            <div ref={ref} className={clsx("w-full h-full flex flex-col items-center justify-center p-6", theme.bg, textColor)}>
                <h2 className="text-4xl font-black mb-8 uppercase">The Grand Total</h2>
                
                <div className="grid grid-cols-1 gap-8 w-full">
                    <div className="text-center">
                        <p className="text-6xl font-black">{data.totalActivities}</p>
                        <p className="text-xl uppercase tracking-widest opacity-75">Activities</p>
                    </div>
                    <div className="text-center">
                         <p className="text-6xl font-black">{data.totalDistance}</p>
                         <p className="text-xl uppercase tracking-widest opacity-75">Kilometers</p>
                    </div>
                    <div className="text-center">
                         <p className="text-6xl font-black">{data.totalCalories.toLocaleString()}</p>
                         <p className="text-xl uppercase tracking-widest opacity-75">Calories</p>
                    </div>
                </div>
                
                <div className="mt-12 text-sm opacity-50">strava-wrapped-demo.vercel.app</div>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(); }} 
                className="mt-4 px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 shadow-lg z-50 pointer-events-auto"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Save & Share
            </button>
        </SlideContainer>
    );
};
