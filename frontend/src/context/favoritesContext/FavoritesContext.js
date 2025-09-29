import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../authContext/AuthContext';
import { useTranslation } from '../../i18n/useTranslation';

const INITIAL_VALUE = {
  favorites: [],
  loading: false,
  updating: false,
  error: '',
  isFavorite: () => false,
  addFavorite: async () => {},
  removeFavorite: async () => {},
  refreshFavorites: async () => {},
};

export const FavoritesContext = createContext(INITIAL_VALUE);

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorKey, setErrorKey] = useState('');
  const { t } = useTranslation();

  const resetState = useCallback(() => {
    setFavorites([]);
    setErrorKey('');
    setLoading(false);
    setUpdating(false);
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!user?.token) {
      resetState();
      return;
    }

    try {
      setLoading(true);
      setErrorKey('');
      const response = await axios.get('http://localhost:5000/api/users/favorites');
      setFavorites(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Favoriler getirilirken hata oluştu:', err);
      setErrorKey('favorites.loadError');
    } finally {
      setLoading(false);
    }
  }, [resetState, user?.token]);

  useEffect(() => {
    if (!user?.token) {
      resetState();
      return;
    }

    refreshFavorites();
  }, [user?.token, refreshFavorites, resetState]);

  const applyUpdate = useCallback((data) => {
    if (Array.isArray(data)) {
      setFavorites(data);
    }
  }, []);

  const addFavorite = useCallback(
    async (contentId) => {
      if (!user?.token || !contentId) return;
      try {
        setUpdating(true);
        setErrorKey('');
        const response = await axios.post('http://localhost:5000/api/users/favorites', { contentId });
        applyUpdate(response.data);
      } catch (err) {
        console.error('Favori eklenemedi:', err);
        setErrorKey('favorites.addError');
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [applyUpdate, user?.token]
  );

  const removeFavorite = useCallback(
    async (contentId) => {
      if (!user?.token || !contentId) return;
      try {
        setUpdating(true);
        setErrorKey('');
        const response = await axios.delete(`http://localhost:5000/api/users/favorites/${contentId}`);
        applyUpdate(response.data);
      } catch (err) {
        console.error('Favori silinemedi:', err);
        setErrorKey('favorites.removeError');
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [applyUpdate, user?.token]
  );

  const isFavorite = useCallback(
    (contentId) => favorites.some((item) => item?._id === contentId),
    [favorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      loading,
      updating,
      error: errorKey ? t(errorKey) : '',
      isFavorite,
      addFavorite,
      removeFavorite,
      refreshFavorites,
    }),
    [favorites, loading, updating, errorKey, t, isFavorite, addFavorite, removeFavorite, refreshFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => useContext(FavoritesContext);
