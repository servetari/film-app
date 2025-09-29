import React from 'react';
import { ArrowBackOutlined } from '@mui/icons-material';
import { useLocation, Link, Navigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useTranslation } from '../../i18n/useTranslation';
import './watch.scss';

const Watch = () => {
  const location = useLocation();
  const content = location.state?.content;
  const { t } = useTranslation();

  if (!content) {
    return <Navigate to="/" replace />;
  }

  const videoUrl = content.video || content.trailer;
  const backgroundImage = content.img || content.imgSm;
  const title = content.title || t('watch.defaultTitle');
  const description = content.description || t('watch.defaultDescription');

  return (
    <section className="watch" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}>
      <div className="watch__overlay" />

      <Link to="/" className="watch__back">
        <ArrowBackOutlined />
        <span>{t('watch.back')}</span>
      </Link>

      <div className="watch__content">
        <div className="watch__player-card">
          <div className="watch__player">
            {videoUrl ? (
              <ReactPlayer
                url={videoUrl}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
              />
            ) : (
              <div className="watch__player-placeholder">
                <div className="watch__player-placeholder-inner">
                  <span>{t('watch.defaultTitle')}</span>
                  <p>{t('watch.defaultDescription')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="watch__details">
            <header className="watch__header">
              <h1>{title}</h1>
              <div className="watch__meta">
                {content.year && <span>{content.year}</span>}
                {content.limit && <span className="watch__chip">+{content.limit}</span>}
                {content.duration && <span>{content.duration}</span>}
                {content.genre && <span className="watch__chip watch__chip--ghost">{content.genre}</span>}
              </div>
            </header>

            <p className="watch__description">{description}</p>

            {content.cast || content.director ? (
              <div className="watch__extra">
                {content.cast && (
                  <div>
                    <span className="watch__extra-label">{t('watch.castLabel')}</span>
                    <span>{content.cast}</span>
                  </div>
                )}
                {content.director && (
                  <div>
                    <span className="watch__extra-label">{t('watch.directorLabel')}</span>
                    <span>{content.director}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watch;
