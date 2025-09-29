import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContentModal from '../../components/contentModal/ContentModal';
import { useTranslation } from '../../i18n/useTranslation';

const DetailsContext = createContext({ openById: async () => {}, openWithContent: () => {}, close: () => {} });

export const DetailsProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const openWithContent = useCallback((c) => {
    setContent(c || null);
    setOpen(true);
  }, []);

  const openById = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setOpen(true);
      const { data } = await axios.get(`http://localhost:5000/api/content/find/${id}`);
      setContent(data || null);
    } catch (e) {
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openById, openWithContent, close }), [openById, openWithContent, close]);
  return (
    <DetailsContext.Provider value={value}>
      {children}
      <ContentModal open={open} onClose={close} content={content} onPlay={() => navigate('/watch', { state: { content } })} t={t} />
    </DetailsContext.Provider>
  );
};

export const useDetails = () => useContext(DetailsContext);
