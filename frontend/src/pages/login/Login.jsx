import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext/AuthContext';
import { login } from '../../context/authContext/apiCalls';
import { useTranslation } from '../../i18n/useTranslation';
import './Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isFetching, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = (event) => {
    event.preventDefault();
    login({ email, password }, dispatch);
  };

  return (
    <section className="auth auth--login">
      <div className="auth__background" aria-hidden="true" />

      <header className="auth__header">
        <button type="button" className="auth__brand" onClick={() => navigate('/')}>{t('auth.brand')}</button>
        <button type="button" className="auth__ghost-button" onClick={() => navigate('/register')}>
          {t('auth.login.switch.action')}
        </button>
      </header>

      <div className="auth__card" role="region" aria-live="polite">
        <h1>{t('auth.login.title')}</h1>
        <p>{t('auth.login.subtitle')}</p>

        <form className="auth__form" onSubmit={handleLogin}>
          <label className="auth__field">
            <span>{t('auth.common.email')}</span>
            <input
              type="email"
              placeholder={t('auth.register.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="auth__field">
            <span>{t('auth.common.password')}</span>
            <input
              type="password"
              placeholder={t('auth.common.passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth__primary-button" disabled={isFetching}>
            {isFetching ? t('auth.login.loading') : t('auth.login.submit')}
          </button>
        </form>

        <div className="auth__footer">
          <span>{t('auth.login.switch.question')}</span>
          <button type="button" onClick={() => navigate('/register')}>
            {t('auth.login.switch.action')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Login;
