import React, { useMemo } from 'react';
import StoryViewer from './StoryViewer';
import { vibeTraits } from '../utils/dataProcessor';
import {
    IntroSlide,
    TopSportsSlide,
    NewActivitySlide,
    FunStatsSlide,
    SpotlightSlide,
    VibeSlide,
    LocationSlide,
    TopMonthsSlide,
    SummarySlide,
    DRAMATIC_DELAY,
    STAGGER_DELAY
} from './Slides';

const StoryContainer = ({ data, onClose }) => {

  // Calculate slide duration logic
  const getListDuration = (count) => {
      // DRAMATIC_DELAY (3s) + (count-1)*STAGGER_DELAY (1.5s) + animation buffer (0.5s) + 2s dwell
      if (!count) return 6000;
      const animationEnd = (DRAMATIC_DELAY + (count * STAGGER_DELAY));
      return (animationEnd + 2) * 1000;
  };

  const slides = useMemo(() => {
      if (!data) return [];

      return [
        { component: (props) => <IntroSlide data={data} {...props} />, duration: 5000 },
        { component: (props) => <TopSportsSlide data={data} {...props} />, duration: getListDuration(data.topSports?.length) },
        ...(data.newActivity ? [{ component: (props) => <NewActivitySlide data={data} {...props} />, duration: 6000 }] : []),
        { component: (props) => <FunStatsSlide data={data} {...props} />, duration: 8000 },
        ...((data.mostLikedActivity || data.spotlightActivity) ? [{ component: (props) => <SpotlightSlide data={data} {...props} />, duration: 6000 }] : []),
        { component: (props) => <VibeSlide data={data} traits={vibeTraits} {...props} />, duration: 6000 },
        { component: (props) => <LocationSlide data={data} {...props} />, duration: 6000 },
        { component: (props) => <TopMonthsSlide data={data} {...props} />, duration: getListDuration(data.topMonthsByDistance?.length) },
        { component: (props) => <SummarySlide data={data} traits={vibeTraits} {...props} />, duration: 10000 }
      ];
  }, [data]);

  return (
      <StoryViewer
          slides={slides}
          onClose={onClose}
      />
  );
};

export default StoryContainer;
