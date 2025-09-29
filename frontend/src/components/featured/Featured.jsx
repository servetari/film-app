import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { PlayArrow, InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import ContentModal from '../contentModal/ContentModal';
import './featured.scss';
import { useProfileMode } from '../../context/profileMode/ProfileModeContext';

const GENRES = [
  { value: 'action', labelKey: 'genre.action' },
  { value: 'adventure', labelKey: 'genre.adventure' },
  { value: 'animation', labelKey: 'genre.animation' },
  { value: 'documentary', labelKey: 'genre.documentary' },
  { value: 'sci-fi', labelKey: 'genre.sci-fi' },
  { value: 'drama', labelKey: 'genre.drama' },
  { value: 'fantasy', labelKey: 'genre.fantasy' },
  { value: 'comedy', labelKey: 'genre.comedy' },
  { value: 'horror', labelKey: 'genre.horror' },
  { value: 'romance', labelKey: 'genre.romance' },
  { value: 'crime', labelKey: 'genre.crime' },
  { value: 'thriller', labelKey: 'genre.thriller' },
];

const Featured = ({ type, setGenre }) => {
  const [content, setContent] = useState(null);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode } = useProfileMode();

  useEffect(() => {
    const controller = new AbortController();

    const getRandomContent = async () => {
      try {
        const url = `http://localhost:5000/api/content/random${type ? `?type=${type}` : ''}`;
        const { data } = await axios.get(url, { signal: controller.signal });
        setContent(data || null);
        if (mode === 'kids' && data && !(parseInt(String(data.limit || '').replace(/[^0-9]/g, ''), 10) <= 13)) {
          const params = new URLSearchParams();
          if (type) params.append('type', type);
          params.append('limit', '24');
          const sUrl = `http://localhost:5000/api/content/search?${params.toString()}`;
          const sRes = await axios.get(sUrl, { signal: controller.signal });
          if (Array.isArray(sRes.data) && sRes.data.length) {
            const pick = sRes.data[Math.floor(Math.random() * sRes.data.length)];
            setContent(pick || null);
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Öne çıkarılan içerik getirilemedi:', err);
        setContent(null);
      }
    };

    getRandomContent();
    return () => controller.abort();
  }, [type, mode]);

  useEffect(() => {
    setSelectedGenre('all');
    if (setGenre) {
      setGenre(null);
    }
  }, [type, setGenre]);

  const description = useMemo(() => {
    if (!content?.description) {
      return t('featured.defaultDescription');
    }
    return content.description;
  }, [content, t]);

  const handleGenreChange = (value) => {
    setSelectedGenre(value);
    if (setGenre) {
      setGenre(value === 'all' ? null : value);
    }
  };

  const handlePlay = () => {
    if (!content) return;
    navigate('/watch', { state: { content } });
  };

  const backgroundImage = content?.img;
  const titleImage = content?.imgTitle;

  const handleMoreInfo = async () => {
    if (!content?._id) {
      setDetail(content);
      setOpen(true);
      return;
    }
    const controller = new AbortController();
    try {
      setLoadingDetail(true);
      setOpen(true);
      const { data } = await axios.get(`http://localhost:5000/api/content/find/${content._id}`, { signal: controller.signal });
      setDetail(data || content);
    } catch (err) {
      setDetail(content);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <section className="featured">
      <div className="featured__media" aria-hidden={backgroundImage ? 'false' : 'true'}>
        {backgroundImage && (
          <img
            className="featured__background"
            src={backgroundImage}
            alt={content?.title || t('featured.defaultTitle')}
          />
        )}
        <div className="featured__overlay" />
      </div>

      {type && (
        <div className="featured__category" role="group" aria-label={t('featured.category.label')}>
          <span className="featured__category-label">
            {type === 'movie' ? t('featured.category.movies') : t('featured.category.series')}
          </span>
          <div className="featured__select">
            <label htmlFor="genre" className="sr-only">
              {t('common.selectGenre')}
            </label>
            <select
              id="genre"
              name="genre"
              value={selectedGenre}
              onChange={(event) => handleGenreChange(event.target.value)}
            >
              <option value="all">{t('common.all')}</option>
              {GENRES.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="featured__info">
        {titleImage ? (
          <img className="featured__title" src={titleImage} alt={content?.title || t('featured.defaultTitle')} />
        ) : (
          <h1 className="featured__heading">{content?.title || t('featured.defaultTitle')}</h1>
        )}

        <p className="featured__desc">{description}</p>

        <div className="featured__meta">
          {content?.year && <span>{content.year}</span>}
          {content?.limit && <span className="featured__limit">+{content.limit}</span>}
          {content?.duration && <span>{content.duration}</span>}
        </div>

        <div className="featured__buttons">
          <button type="button" className="featured__btn featured__btn--primary" onClick={handlePlay}>
            <PlayArrow className="featured__btn-icon" />
            {t('featured.play')}
          </button>
          <button type="button" className="featured__btn featured__btn--ghost" onClick={handleMoreInfo}>
            <InfoOutlined className="featured__btn-icon" />
            {t('featured.moreInfo')}
          </button>
        </div>
      </div>
      <ContentModal
        open={open}
        onClose={() => setOpen(false)}
        onPlay={handlePlay}
        content={loadingDetail ? content : (detail || content)}
        t={t}
      />
    </section>
  );
};

export default Featured;
