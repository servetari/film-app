import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Notifications, ArrowDropDown } from '@mui/icons-material';
import { AuthContext } from '../../context/authContext/AuthContext';
import { logout } from '../../context/authContext/AuthActions';
import { useTranslation } from '../../i18n/useTranslation';
import { useLanguage } from '../../context/language/LanguageContext';
import './navbar.scss';
import { useSearch } from '../../context/searchContext/SearchContext';
import { useProfileMode } from '../../context/profileMode/ProfileModeContext';
import { useNotifications } from '../../context/notifications/NotificationsContext';
import { useDetails } from '../../context/details/DetailsContext';

const NAV_LINKS = ['navbar.home', 'navbar.series', 'navbar.movies', 'navbar.favorites'];
const NAV_ROUTES = ['/', '/series', '/movies', '/#favorites'];

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Stream+User&background=1f2937&color=ffffff';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const profileData = user?.user || {};
  const profileAvatar = profileData.avatar || DEFAULT_AVATAR;
  const profileName = profileData.username || t('profile.titleFallback');
  const { term, setTerm } = useSearch();
  const { mode } = useProfileMode();
  const modeLabel = mode === 'kids' ? t('navbar.mode.kids') : t('navbar.mode.adult');
  const { notifications, unread, markAllRead } = useNotifications();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const notifRef = useRef(null);
  const { openById } = useDetails();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchActive(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNavigate = (to) => {
    if (to.startsWith('/#')) {
      const targetId = to.slice(2);
      if (location.pathname !== '/') {
        navigate('/', { replace: false });
        requestAnimationFrame(() => {
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      } else {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return;
    }

    navigate(to);
  };

  const isLinkActive = (to) => {
    if (to.startsWith('/#')) {
      return location.pathname === '/';
    }
    return location.pathname === to;
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <button
          type="button"
          className="navbar__brand"
          onClick={() => navigate('/')}
        >
          StreamBox
        </button>

        <nav className="navbar__links" aria-label={t('navbar.menuAria')}>
          {NAV_LINKS.map((key, index) => {
            const to = NAV_ROUTES[index];
            return (
              <button
                key={key}
                type="button"
                className={`navbar__link ${isLinkActive(to) ? 'is-active' : ''}`}
                onClick={() => handleNavigate(to)}
              >
                {t(key)}
              </button>
            );
          })}
        </nav>

        <div className="navbar__actions">
          <div className={`navbar__search ${searchActive ? 'is-active' : ''}`}>
            <Search
              className="navbar__icon"
              onClick={() => setSearchActive((prev) => !prev)}
            />
            <input
              type="search"
              placeholder={t('navbar.searchPlaceholder')}
              aria-label={t('navbar.searchPlaceholder')}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <div className="navbar__language">
            <label htmlFor="language-select" className="sr-only">
              {t('language.selector.label')}
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="tr">{t('language.tr')}</option>
              <option value="en">{t('language.en')}</option>
            </select>
          </div>
          <button
            type="button"
            className="navbar__badge"
            onClick={() => navigate('/profile-mode')}
            aria-pressed={mode === 'kids'}
            title={t('navbar.mode.switch')}
          >
            {modeLabel}
          </button>
          <div className="navbar__notif" ref={notifRef}>
            <button
              type="button"
              className="navbar__icon-button"
              aria-label={t('notifications.title')}
              onClick={() => { setNotifsOpen((p) => !p); markAllRead(); }}
            >
              <Notifications className="navbar__icon" />
              {unread > 0 ? <span className="navbar__notif-dot" aria-hidden="true" /> : null}
            </button>
            <div className={`navbar__dropdown ${notifsOpen ? 'is-open' : ''}`} style={{ minWidth: 320 }}>
              <div className="navbar__notif-header">{t('notifications.title')}</div>
              {notifications.length === 0 ? (
                <div className="navbar__notif-empty">{t('notifications.empty')}</div>
              ) : (
                <ul className="navbar__notif-list">
                  {notifications.slice(0, 10).map((n) => (
                    <li key={`${n.type}-${n.contentId}-${n.createdAt}`} className="navbar__notif-item">
                      <button
                        type="button"
                        className="navbar__notif-text"
                        onClick={() => { setNotifsOpen(false); openById(n.contentId); }}
                      >
                        {t('notifications.newContent')}: {n.title}
                      </button>
                      <div className="navbar__notif-time">{new Date(n.createdAt).toLocaleTimeString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="navbar__profile" ref={profileRef}>
            <button
              type="button"
              className="navbar__profile-button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <img src={profileAvatar} alt={profileName} />
              <ArrowDropDown className="navbar__icon" />
            </button>
            <div className={`navbar__dropdown ${profileOpen ? 'is-open' : ''}`}>
              <button type="button" onClick={() => navigate('/profile')}>
                {t('navbar.profile')}
              </button>
              <button type="button" onClick={handleLogout}>
                {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
