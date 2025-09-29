import React from 'react';
import { createPortal } from 'react-dom';
import './contentModal.scss';

const ContentModal = ({ open, onClose, content, onPlay, t }) => {
  if (!open) return null;
  const title = content?.title || '';
  const description = content?.description || '';
  const img = content?.img || content?.imgSm || '';
  const year = content?.year || '';
  const limit = content?.limit || '';
  const genre = content?.genre || '';

  return createPortal((
    <div className="content-modal" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
      <div className="content-modal__backdrop" onClick={onClose} />
      <div className="content-modal__panel">
        <button type="button" className="content-modal__close" onClick={onClose} aria-label={t('details.close')}>
          ×
        </button>
        {img ? (
          <img className="content-modal__image" src={img} alt={title} />
        ) : null}
        <div className="content-modal__body">
          <h2 id="content-modal-title" className="content-modal__title">{title}</h2>
          {description ? <p className="content-modal__desc">{description}</p> : null}
          <div className="content-modal__meta">
            {year ? <span>{t('details.year')}: {year}</span> : null}
            {typeof limit !== 'undefined' && String(limit).length ? <span>{t('details.limit')}: +{limit}</span> : null}
            {genre ? <span>{t('details.genre')}: {genre}</span> : null}
          </div>
          <div className="content-modal__actions">
            <button type="button" className="content-modal__btn" onClick={onPlay}>
              {t('featured.play')}
            </button>
            <button type="button" className="content-modal__btn content-modal__btn--ghost" onClick={onClose}>
              {t('details.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
};

export default ContentModal;
