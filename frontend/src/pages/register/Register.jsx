import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import './Register.scss';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!emailRegex.test(value)) {
      setEmailError(t('auth.register.emailError'));
      return;
    }
    setEmail(value);
    setEmailError('');
    try {
      setCheckingEmail(true);
      const { data } = await axios.get('http://localhost:5000/api/auth/check', { params: { email: value } });
      if (data && data.emailAvailable === false) {
        setEmailError(t('auth.register.emailInUse'));
        return;
      }
      setStep('details');
    } catch (err) {
      setStep('details');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setApiError('');
    setUsernameError('');

    // check username availability first
    try {
      setCheckingUsername(true);
      const value = username.trim();
      const { data } = await axios.get('http://localhost:5000/api/auth/check', { params: { username: value } });
      if (data && data.usernameAvailable === false) {
        setUsernameError(t('auth.register.usernameInUse'));
        return;
      }
    } catch (err) {
      // ignore, backend will validate again
    } finally {
      setCheckingUsername(false);
    }

    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        email,
        username: username.trim(),
        password,
      });
      navigate('/login');
    } catch (err) {
      console.error('Kaydı sırasında bir hata oluştu:', err);
      const message = err?.response?.data?.message || t('auth.register.errorDefault');
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameBlur = async () => {
    const value = username.trim();
    if (!value) return;
    try {
      setCheckingUsername(true);
      const { data } = await axios.get('http://localhost:5000/api/auth/check', { params: { username: value } });
      if (data && data.usernameAvailable === false) {
        setUsernameError(t('auth.register.usernameInUse'));
      } else {
        setUsernameError('');
      }
    } catch (err) {
      // ignore
    } finally {
      setCheckingUsername(false);
    }
  };

  const resetToEmailStep = () => {
    setStep('email');
    setUsername('');
    setPassword('');
  };

  return (
    <section className="auth auth--register">
      <div className="auth__background" aria-hidden="true" />

      <header className="auth__header">
        <button type="button" className="auth__brand" onClick={() => navigate('/')}>{t('auth.brand')}</button>
        <button type="button" className="auth__ghost-button" onClick={() => navigate('/login')}>
          {t('auth.login.submit')}
        </button>
      </header>

      <div className="auth__card">
        <h1>{t('auth.register.title')}</h1>
        <p>{t('auth.register.subtitle')}</p>

        {step === 'email' ? (
          <form className="auth__form" onSubmit={handleEmailSubmit}>
            <label className="auth__field">
              <span>{t('auth.register.emailLabel')}</span>
              <input
                type="email"
                placeholder={t('auth.register.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            {checkingEmail ? (
              <p className="auth__hint">{t('auth.register.checking')}</p>
            ) : emailError ? (
              <p className="auth__hint auth__hint--error">{emailError}</p>
            ) : null}
            <button type="submit" className="auth__primary-button">
              {t('auth.register.continue')}
            </button>
          </form>
        ) : (
          <form className="auth__form" onSubmit={handleRegister}>
            <div className="auth__pill">
              <span>{email}</span>
              <button type="button" onClick={resetToEmailStep}>
                {t('auth.register.edit')}
              </button>
            </div>

            <label className="auth__field">
              <span>{t('auth.register.usernameLabel')}</span>
              <input
                type="text"
                placeholder={t('auth.register.usernamePlaceholder')}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onBlur={handleUsernameBlur}
                required
              />
            </label>
            {checkingUsername ? (
              <p className="auth__hint">{t('auth.register.checking')}</p>
            ) : usernameError ? (
              <p className="auth__hint auth__hint--error">{usernameError}</p>
            ) : null}

            <label className="auth__field">
              <span>{t('auth.register.passwordLabel')}</span>
              <input
                type="password"
                placeholder={t('auth.register.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>

            {apiError && <p className="auth__hint auth__hint--error">{apiError}</p>}

            <button type="submit" className="auth__primary-button" disabled={isSubmitting}>
              {isSubmitting ? t('auth.register.loading') : t('auth.register.submit')}
            </button>
          </form>
        )}

        <div className="auth__footer">
          <span>{t('auth.register.switch.question')}</span>
          <button type="button" onClick={() => navigate('/login')}>
            {t('auth.register.switch.action')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Register;
