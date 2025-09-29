import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { AuthContextProvider } from './context/authContext/AuthContext';
import { FavoritesProvider } from './context/favoritesContext/FavoritesContext';
import { LanguageProvider } from './context/language/LanguageContext';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { SearchProvider } from './context/searchContext/SearchContext';
import { ProfileModeProvider } from './context/profileMode/ProfileModeContext';
import { NotificationsProvider } from './context/notifications/NotificationsContext';
import { DetailsProvider } from './context/details/DetailsContext';

axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.token = `Bearer ${user.token}`;
  }
  const language = localStorage.getItem('language') || 'tr';
  config.headers['x-language'] = language;
  const profileMode = localStorage.getItem('profileMode') || 'adult';
  config.headers['x-profile-mode'] = profileMode;
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthContextProvider>
          <FavoritesProvider>
            <ProfileModeProvider>
              <NotificationsProvider>
                <SearchProvider>
                  <DetailsProvider>
                    <App />
                  </DetailsProvider>
                </SearchProvider>
              </NotificationsProvider>
            </ProfileModeProvider>
          </FavoritesProvider>
        </AuthContextProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
