import { createContext, useContext, useMemo, useState } from 'react';

const INITIAL = {
  term: '',
  setTerm: () => {},
};

const SearchContext = createContext(INITIAL);

export const SearchProvider = ({ children }) => {
  const [term, setTerm] = useState('');

  const value = useMemo(() => ({ term, setTerm }), [term]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => useContext(SearchContext);

