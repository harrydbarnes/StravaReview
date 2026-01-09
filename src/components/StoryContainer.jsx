import React, { useMemo } from 'react';
import StoryViewer from './StoryViewer';
import { vibeTraits } from '../utils/dataProcessor';
import {
    IntroSlide,
    PercentSlide,
    ElevationSlide,
    FuelSlide,
    TopSportsSlide,
    PaceSlide,
    SpeedSlide,
    SlowestSlide,
    ShortestSlide,
    HeatmapSlide,
    WeeklyPatternSlide,
    TopMonthsSlide,
    NewActivitySlide,
    LocationSlide,
    FunStatsSlide,
    OlympicsSlide,
    SpotlightSlide,
    KudosSlide,
    VibeSlide,
    SummarySlide,
    DRAMATIC_DELAY,
    STAGGER_DELAY
} from './Slides';

// Calculate slide duration logic
const getListDuration = (count) => {
    // DRAMATIC_DELAY (3s) + (count-1)*STAGGER_DELAY (1.5s) + animation buffer (0.5s) + 2s dwell
    if (!count) return 6000;
    const animationEnd = (DRAMATIC_DELAY + (count * STAGGER_DELAY));
    return (animationEnd + 2) * 1000;
};

const StoryContainer = ({ data, onClose, playEntrySound }) => {

  const slides = useMemo(() => {
      if (!data) return [];

      const hasNewActivity = !!data.newActivity;
      const hasSpotlight = !!(data.mostLikedActivity || data.spotlightActivity);

      return [
        // 1. THE OPENER
        { component: (props) => <IntroSlide data={data} {...props} />, duration: 5000 },

        // 2. THE BIG PICTURE (Time & Elevation)
        { component: (props) => <PercentSlide data={data} {...props} />, duration: 8000 },
        { component: (props) => <ElevationSlide data={data} {...props} />, duration: 6000 },
        { component: (props) => <FuelSlide data={data} {...props} />, duration: 7000 },

        // 3. THE BASICS (Sports & Pace)
        { component: (props) => <TopSportsSlide data={data} {...props} />, duration: getListDuration(data.topSports?.length) },
        { component: (props) => <PaceSlide data={data} {...props} />, duration: 7000 },

        // 4. SPEED FREAK (Fast, Slow, Short)
        { component: (props) => <SpeedSlide data={data} {...props} />, duration: 6000 },
        ...(data.speed.slowestActivity ? [{ component: (props) => <SlowestSlide data={data} {...props} />, duration: 7000 }] : []),
        ...(data.shortestActivity ? [{ component: (props) => <ShortestSlide data={data} {...props} />, duration: 6000 }] : []),

        // 5. THE SCHEDULE (Heatmaps & Patterns)
        { component: (props) => <HeatmapSlide data={data} {...props} />, duration: 8000 },
        { component: (props) => <WeeklyPatternSlide data={data} {...props} />, duration: 8000 },
        { component: (props) => <TopMonthsSlide data={data} {...props} />, duration: getListDuration(data.topMonthsByDistance?.length) },

        // 6. HIGHLIGHTS & DISCOVERY
        ...(hasNewActivity ? [{ component: (props) => <NewActivitySlide data={data} showClickHint={true} {...props} />, duration: 6000 }] : []),
        { component: (props) => <LocationSlide data={data} {...props} />, duration: 6000 },

        // 7. FUN & GAMES
        { component: (props) => <FunStatsSlide data={data} {...props} />, duration: 8000 }, // Songs/Movies
        ...( (data.olympics.sprints > 0 || data.olympics.poolLengths > 0) ? [{ component: (props) => <OlympicsSlide data={data} {...props} />, duration: 8000 }] : []),

        // 8. SOCIAL & FAVORITES
        ...(hasSpotlight ? [{ component: (props) => <SpotlightSlide data={data} showClickHint={!hasNewActivity} {...props} />, duration: 7000 }] : []),
        { component: (props) => <KudosSlide data={data} {...props} />, duration: 6000 },

        // 9. THE WRAP UP
        { component: (props) => <VibeSlide data={data} traits={vibeTraits} {...props} />, duration: 7000 },
        { component: (props) => <SummarySlide data={data} traits={vibeTraits} {...props} />, duration: 10000 }
      ];
  }, [data]);

  return (
      <StoryViewer
          slides={slides}
          onClose={onClose}
          playEntrySound={playEntrySound}
      />
  );
};

export default StoryContainer;
