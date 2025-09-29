import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import ListItem from '../listItem/ListItem';
import './list.scss';

const List = ({ list }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const items = useMemo(() => list?.content ?? [], [list]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    container.scrollTo({ left: 0 });

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    };

    update();

    const handleScroll = () => window.requestAnimationFrame(update);
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  const handleScrollBy = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items.length) {
    return null;
  }

  return (
    <section className="list" id={list?.anchorId}>
      <div className="list__header">
        <h2 className="list__title">{list?.title || 'Keşfet'}</h2>
        <div className="list__controls">
          <button
            type="button"
            className="list__arrow"
            onClick={() => handleScrollBy('left')}
            disabled={!canScrollLeft}
            aria-label="Önceki içerikler"
          >
            <ArrowBackIosNew />
          </button>
          <button
            type="button"
            className="list__arrow"
            onClick={() => handleScrollBy('right')}
            disabled={!canScrollRight}
            aria-label="Sonraki içerikler"
          >
            <ArrowForwardIos />
          </button>
        </div>
      </div>

      <div className="list__viewport">
        <div className="list__scroller" ref={scrollRef}>
          {items.map((content, index) => (
            <ListItem key={`${list?._id || 'list'}-${content?._id || index}`} index={index} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default List;
