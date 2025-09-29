import React, { useContext, useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { AuthContext } from '../../context/authContext/AuthContext';
import { useFavorites } from '../../context/favoritesContext/FavoritesContext';
import { changePassword, refreshCurrentUser, updateProfile } from '../../context/authContext/apiCalls';
import { useTranslation } from '../../i18n/useTranslation';
import './profile.scss';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Stream+User&background=1f2937&color=ffffff';

const Profile = () => {
  const { user, dispatch, isFetching } = useContext(AuthContext);
  const { favorites } = useFavorites();
  const { t } = useTranslation();

  const authUser = user?.user || {};

  const [profileForm, setProfileForm] = useState({
    username: authUser.username || '',
    email: authUser.email || '',
    avatar: authUser.avatar || DEFAULT_AVATAR,
  });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await refreshCurrentUser(dispatch);
        if (!isMounted) return;
        setProfileForm({
          username: data?.username || '',
          email: data?.email || '',
          avatar: data?.avatar || DEFAULT_AVATAR,
        });
      } catch (error) {
        if (!isMounted) return;
        setProfileStatus({ type: 'error', message: t('profile.account.error') });
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    setProfileLoading(true);
    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch, t]);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      username: authUser.username || prev.username,
      email: authUser.email || prev.email,
      avatar: authUser.avatar || prev.avatar,
    }));
  }, [authUser.username, authUser.email, authUser.avatar]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileStatus({ type: '', message: '' });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordStatus({ type: '', message: '' });
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setProfileStatus({ type: '', message: '' });

    const payload = {
      username: profileForm.username.trim(),
      email: profileForm.email.trim(),
      avatar: profileForm.avatar.trim(),
    };

    try {
      await updateProfile(payload, dispatch);
      setProfileStatus({ type: 'success', message: t('profile.account.success') });
    } catch (error) {
      const message = error?.response?.data?.message || t('profile.account.error');
      setProfileStatus({ type: 'error', message });
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: t('profile.password.mismatch') });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: t('profile.password.minLength') });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus({ type: 'success', message: response?.message || t('profile.password.success') });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error?.response?.data?.message || t('profile.password.error');
      setPasswordStatus({ type: 'error', message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  const avatarPreview = profileForm.avatar?.trim() || DEFAULT_AVATAR;

  return (
    <div className="profile">
      <Navbar />
      <main className="profile__content">
        <section className="profile__header">
          <div className="profile__avatar-wrapper">
            <img src={avatarPreview} alt={profileForm.username || t('profile.titleFallback')} className="profile__avatar" />
          </div>
          <div>
            <h1>{profileForm.username || t('profile.titleFallback')}</h1>
            <p>{profileForm.email || authUser.email}</p>
            <div className="profile__meta">
              <span>{t('profile.favoriteCount', { count: favoriteCount })}</span>
            </div>
          </div>
        </section>

        <div className="profile__grid">
          <section className="profile__card">
            <div className="profile__card-header">
              <h2>{t('profile.account.title')}</h2>
              {profileStatus.message && (
                <span className={`profile__status profile__status--${profileStatus.type}`}>
                  {profileStatus.message}
                </span>
              )}
            </div>
            <form className="profile__form" onSubmit={submitProfile}>
              <label className="profile__field">
                <span>{t('profile.username')}</span>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  placeholder={t('profile.usernamePlaceholder')}
                  required
                />
              </label>

              <label className="profile__field">
                <span>{t('profile.email')}</span>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder={t('profile.emailPlaceholder')}
                  required
                />
              </label>

              <label className="profile__field">
                <span>{t('profile.avatar')}</span>
                <input
                  type="url"
                  name="avatar"
                  value={profileForm.avatar}
                  onChange={handleProfileChange}
                  placeholder={t('profile.avatarPlaceholder')}
                />
              </label>

              <button type="submit" className="profile__submit" disabled={isFetching || profileLoading}>
                {isFetching ? t('profile.account.loading') : t('profile.account.submit')}
              </button>
            </form>
          </section>

          <section className="profile__card">
            <div className="profile__card-header">
              <h2>{t('profile.password.title')}</h2>
              {passwordStatus.message && (
                <span className={`profile__status profile__status--${passwordStatus.type}`}>
                  {passwordStatus.message}
                </span>
              )}
            </div>
            <form className="profile__form" onSubmit={submitPassword}>
              <label className="profile__field">
                <span>{t('profile.password.current')}</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('auth.common.passwordPlaceholder')}
                  required
                />
              </label>

              <label className="profile__field">
                <span>{t('profile.password.new')}</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('profile.password.new')}
                  required
                />
              </label>

              <label className="profile__field">
                <span>{t('profile.password.confirm')}</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('profile.password.confirm')}
                  required
                />
              </label>

              <button type="submit" className="profile__submit" disabled={passwordLoading}>
                {passwordLoading ? t('profile.password.loading') : t('profile.password.submit')}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
