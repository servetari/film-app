import React, { useState } from 'react';
import axios from 'axios';
import { PlayArrow, InfoOutlined, FavoriteBorder, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/favoritesContext/FavoritesContext';
import { useTranslation } from '../../i18n/useTranslation';
import ContentModal from '../contentModal/ContentModal';
import './listItem.scss';

const ListItem = ({ index, content }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addFavorite, removeFavorite, updating } = useFavorites();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  if (!content) {
    return null;
  }

  const { _id: contentId, title, imgSm, img, trailer, description, duration, limit, year, genre } = content;
  const favorite = contentId ? isFavorite(contentId) : false;

  const handleFavoriteToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!contentId || updating) {
      return;
    }

    try {
      if (favorite) {
        await removeFavorite(contentId);
      } else {
        await addFavorite(contentId);
      }
    } catch (err) {
      // Silent error, user feedback provided elsewhere if needed.
    }
  };

  const favoriteLabel = favorite ? t('listItem.favorite.remove') : t('listItem.favorite.add');
  const heading = title || t('listItem.defaultTitle');
  const descriptionText = description || t('listItem.defaultDescription');
  const genreLabel = genre || t('listItem.meta.noGenre');

  const handleMoreInfo = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!contentId) {
      setDetail(content);
      setOpen(true);
      return;
    }
    try {
      setLoadingDetail(true);
      setOpen(true);
      const { data } = await axios.get(`http://localhost:5000/api/content/find/${contentId}`);
      setDetail(data || content);
    } catch (err) {
      setDetail(content);
    } finally {
      setLoadingDetail(false);
    }
  };
  
  const handlePlayFromModal = () => {
    navigate('/watch', { state: { content } });
  };

  const handlePlayClick = (event) => {
    event?.stopPropagation();
    navigate('/watch', { state: { content } });
  };

  return (
    <div className="listItem__link">
      <article
        className={`listItem ${isHovered ? 'is-hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ transitionDelay: `${Math.min(index, 6) * 30}ms` }}
      >
        <div className="listItem__visual">
          <img src={imgSm || img} alt={heading} loading="lazy" />
          {isHovered && trailer && (
            <video
              className="listItem__video"
              src={trailer}
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          <div className="listItem__glow" />
        </div>

        <div className="listItem__body">
          <header className="listItem__header">
            <h3 className="listItem__title">{heading}</h3>
            <div className="listItem__meta">
              {duration && <span>{duration}</span>}
              {limit && <span className="listItem__limit">+{limit}</span>}
              <span>{year || t('listItem.meta.noYear')}</span>
            </div>
          </header>

          <p className="listItem__description">{descriptionText}</p>

          <footer className="listItem__footer">
            <span className="listItem__genre">{genreLabel}</span>
            <div className="listItem__icons">
              <button
                type="button"
                className="listItem__icon"
                onClick={handlePlayClick}
                aria-label={t('featured.play')}
                title={t('featured.play')}
              >
                <PlayArrow />
              </button>
              <button
                type="button"
                className="listItem__icon"
                onClick={handleMoreInfo}
                aria-label={t('featured.moreInfo')}
                title={t('featured.moreInfo')}
              >
                <InfoOutlined />
              </button>
              <button
                type="button"
                className={`listItem__favorite ${favorite ? 'is-active' : ''}`}
                onClick={handleFavoriteToggle}
                aria-pressed={favorite}
                aria-label={favoriteLabel}
                title={favoriteLabel}
              >
                {favorite ? <Favorite /> : <FavoriteBorder />}
              </button>
            </div>
          </footer>
        </div>
        <ContentModal
          open={open}
          onClose={() => setOpen(false)}
          onPlay={handlePlayFromModal}
          content={loadingDetail ? content : (detail || content)}
          t={t}
        />
      </article>
    </div>
  );
};

export default ListItem;
