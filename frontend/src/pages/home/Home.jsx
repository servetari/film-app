import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import { useFavorites } from '../../context/favoritesContext/FavoritesContext';
import { useTranslation } from '../../i18n/useTranslation';
import { useSearch } from '../../context/searchContext/SearchContext';
import './home.scss';

const Home = ({ type }) => {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites();
  const { t } = useTranslation();
  const { term } = useSearch();

  useEffect(() => {
    const controller = new AbortController();

    const getRandomLists = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (genre) params.append('genre', genre);

        const endpoint = params.toString()
          ? `http://localhost:5000/api/lists?${params.toString()}`
          : 'http://localhost:5000/api/lists';

        const { data } = await axios.get(endpoint, { signal: controller.signal });
        setLists(Array.isArray(data) ? data : []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Listeleri yüklerken hata oluştu:', err);
        setError(t('home.error'));
        setLists([]);
      } finally {
        setLoading(false);
      }
    };

    getRandomLists();

    return () => controller.abort();
  }, [type, genre, t]);

  useEffect(() => {
    const controller = new AbortController();
    const doSearch = async () => {
      const q = term?.trim();
      if (!q) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      try {
        setSearching(true);
        const params = new URLSearchParams();
        params.append('q', q);
        if (type) params.append('type', type);
        if (genre) params.append('genre', genre);
        const endpoint = `http://localhost:5000/api/content/search?${params.toString()}`;
        const { data } = await axios.get(endpoint, { signal: controller.signal });
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Arama i\u015Fleminde hata:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    doSearch();
    return () => controller.abort();
  }, [term, type, genre]);

  const filteredFavorites = useMemo(() => {
    if (!favorites.length) {
      return [];
    }

    if (type === 'series') {
      return favorites.filter((item) => item?.isSeries === true || item?.isSeries === 'true');
    }

    if (type === 'movie') {
      return favorites.filter((item) => item?.isSeries === false || item?.isSeries === 'false');
    }

    return favorites;
  }, [favorites, type]);

  const favoritesList = useMemo(() => {
    if (!filteredFavorites.length) {
      return [];
    }

    return [
      {
        _id: `favorites-list-${type || 'all'}`,
        title: t('navbar.favorites'),
        anchorId: 'favorites',
        content: filteredFavorites,
      },
    ];
  }, [filteredFavorites, type, t]);

  const searchList = useMemo(() => {
    if (!term?.trim()) return [];
    return [
      {
        _id: 'search-results',
        title: t('home.searchResults') || 'Arama Sonuçları',
        anchorId: 'search',
        content: searchResults,
      },
    ];
  }, [term, searchResults, t]);

  const combinedLists = useMemo(() => {
    if (term?.trim()) {
      return searchList;
    }
    return [...favoritesList, ...lists];
  }, [favoritesList, lists, searchList, term]);

  const combinedError = favoritesError || error;

  const content = useMemo(() => {
    if ((loading || favoritesLoading) && !term?.trim()) {
      return (
        <div className="home__placeholder" aria-live="polite">
          <div className="home__skeleton" />
          <div className="home__skeleton" />
          <div className="home__skeleton" />
        </div>
      );
    }

    if (!term?.trim() && combinedError && !combinedLists.length) {
      return <div className="home__state home__state--error">{combinedError}</div>;
    }

    if (term?.trim()) {
      if (searching) {
        return (
          <div className="home__placeholder" aria-live="polite">
            <div className="home__skeleton" />
            <div className="home__skeleton" />
            <div className="home__skeleton" />
          </div>
        );
      }
      if (!searchResults.length) {
        return (
          <div className="home__state home__state--empty">
            {t('home.searchEmpty') || 'Sonuç bulunamadı.'}
          </div>
        );
      }
    }

    if (!combinedLists.length) {
      return (
        <div className="home__state home__state--empty">
          {t('home.empty')}
        </div>
      );
    }

    return combinedLists.map((list) => (
      <List key={list._id || list.anchorId} list={list} />
    ));
  }, [combinedLists, combinedError, favoritesLoading, loading, t]);

  return (
    <div className="home">
      <Navbar />
      <main className="home__content">
        <Featured type={type} setGenre={setGenre} />
        <section className="home__lists" aria-label={t('home.listsAria')}>
          {combinedError && combinedLists.length ? (
            <div className="home__state home__state--warning" role="alert">
              {t('home.warning')}
            </div>
          ) : null}
          {content}
        </section>
      </main>
    </div>
  );
};

export default Home;
