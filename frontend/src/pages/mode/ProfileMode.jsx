import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileMode } from '../../context/profileMode/ProfileModeContext';
import { useTranslation } from '../../i18n/useTranslation';

const ProfileMode = () => {
  const { mode, setMode } = useProfileMode();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const choose = (value) => {
    setMode(value);
    navigate('/', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0b0b', color: '#fff' }}>
      <div style={{ maxWidth: 720, width: '100%', padding: 24, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>{t('mode.title')}</h1>
        <p style={{ marginBottom: 24, color: '#ccc' }}>{t('mode.subtitle')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button
            type="button"
            onClick={() => choose('kids')}
            style={{
              border: '1px solid #3b82f6',
              background: mode === 'kids' ? '#1d4ed8' : 'transparent',
              color: '#fff',
              padding: '20px 16px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t('mode.kids')}</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>{t('mode.kidsDesc')}</div>
          </button>
          <button
            type="button"
            onClick={() => choose('adult')}
            style={{
              border: '1px solid #10b981',
              background: mode === 'adult' ? '#047857' : 'transparent',
              color: '#fff',
              padding: '20px 16px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t('mode.adult')}</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>{t('mode.adultDesc')}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMode;

