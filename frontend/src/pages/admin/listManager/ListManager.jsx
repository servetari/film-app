import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { DeleteOutline } from '@mui/icons-material';
import './listManager.scss';

const initialFormState = {
  title: '',
  type: 'movie',
  genre: '',
  content: [],
};

const ListManager = () => {
  const [form, setForm] = useState(initialFormState);
  const [lists, setLists] = useState([]);
  const [contentOptions, setContentOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const clearFeedback = useCallback(() => {
    setFeedback({ type: '', message: '' });
  }, []);

  const loadListsAndContent = useCallback(async () => {
    try {
      const [listsResponse, contentResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/lists?full=true'),
        axios.get('http://localhost:5000/api/content'),
      ]);

      setLists(listsResponse.data || []);
      setContentOptions(contentResponse.data || []);
    } catch (error) {
      console.error('Listeleri yüklerken hata oluştu:', error);
      setFeedback({
        type: 'error',
        message: 'Listeler yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.',
      });
    }
  }, []);

  useEffect(() => {
    loadListsAndContent();
  }, [loadListsAndContent]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    clearFeedback();

    setForm((prev) => {
      if (name === 'type') {
        return { ...prev, type: value, content: [] };
      }

      return { ...prev, [name]: value };
    });
  }, [clearFeedback]);

  const toggleContent = useCallback((id) => {
    setForm((prev) => {
      const alreadySelected = prev.content.includes(id);
      const updatedContent = alreadySelected
        ? prev.content.filter((contentId) => contentId !== id)
        : [...prev.content, id];

      return { ...prev, content: updatedContent };
    });
  }, []);

  const filteredContent = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return contentOptions.filter((item) => {
      const isSeries = item.isSeries === true || item.isSeries === 'true';
      const matchesType = form.type === 'series' ? isSeries : !isSeries;
      const haystack = `${item.title || ''} ${item.genre || ''}`.toLowerCase();
      const matchesSearch = query ? haystack.includes(query) : true;

      return matchesType && matchesSearch;
    });
  }, [contentOptions, form.type, searchTerm]);

  const isFormValid = form.title.trim() && form.content.length > 0;
  const selectedCount = form.content.length;

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!isFormValid) {
      setFeedback({
        type: 'error',
        message: 'Lütfen liste adı girin ve en az bir içerik seçin.',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        genre: form.genre.trim(),
        content: form.content,
      };

      await axios.post('http://localhost:5000/api/lists', payload);

      setFeedback({
        type: 'success',
        message: 'Liste başarıyla oluşturuldu. Artık ana sayfada görüntüleniyor.',
      });

      setForm(initialFormState);
      setSearchTerm('');
      await loadListsAndContent();
    } catch (error) {
      console.error('Liste oluşturulurken hata oluştu:', error);
      const message = error?.response?.data?.message || 'Liste kaydedilirken bir sorun oluştu.';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, [clearFeedback, form.content, form.genre, form.title, form.type, isFormValid, loadListsAndContent]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm('Bu listeyi silmek istediğinize emin misiniz?');

    if (!confirmed) {
      return;
    }

    clearFeedback();

    try {
      await axios.delete(`http://localhost:5000/api/lists/${id}`);
      setLists((prev) => prev.filter((list) => list._id !== id));
      setFeedback({ type: 'success', message: 'Liste silindi.' });
    } catch (error) {
      console.error('Liste silinemedi:', error);
      setFeedback({ type: 'error', message: 'Liste silinirken bir hata oluştu.' });
    }
  }, [clearFeedback]);

  const rows = useMemo(() => (
    lists.map((list) => ({
      id: list._id,
      title: list.title,
      type: list.type,
      genre: list.genre || '-',
      itemCount: Array.isArray(list.content) ? list.content.length : 0,
      createdAt: list.createdAt ? new Date(list.createdAt).toLocaleDateString('tr-TR') : '-',
    }))
  ), [lists]);

  const columns = useMemo(() => ([
    { field: 'title', headerName: 'Liste', flex: 1, minWidth: 200 },
    {
      field: 'type',
      headerName: 'Tür',
      width: 120,
      valueFormatter: (params) => (params.value === 'series' ? 'Dizi' : 'Film'),
    },
    { field: 'genre', headerName: 'Kategori', width: 160 },
    { field: 'itemCount', headerName: 'İçerik Sayısı', width: 150, type: 'number' },
    { field: 'createdAt', headerName: 'Oluşturulma', width: 150 },
    {
      field: 'actions',
      headerName: 'Eylem',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <button
          type="button"
          className="listManager__delete"
          onClick={() => handleDelete(params.row.id)}
        >
          <DeleteOutline />
        </button>
      ),
    },
  ]), [handleDelete]);

  return (
    <div className="listManager">
      <div className="listManager__header">
        <div>
          <h1>Listeler</h1>
          <p>Yeni listeler oluşturun ve içerik akışında anında kullanın.</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`listManager__feedback listManager__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="listManager__layout">
        <form className="listManager__form" onSubmit={handleSubmit}>
          <h2>Yeni Liste Oluştur</h2>

          <label className="listManager__field">
            <span>Liste adı</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Aksiyon Gecesi"
              required
            />
          </label>

          <label className="listManager__field">
            <span>Tür</span>
            <select name="type" value={form.type} onChange={handleInputChange}>
              <option value="movie">Film</option>
              <option value="series">Dizi</option>
            </select>
          </label>

          <label className="listManager__field">
            <span>Kategori</span>
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleInputChange}
              placeholder="Bilim Kurgu"
            />
          </label>

          <div className="listManager__field">
            <div className="listManager__field-header">
              <span>İçerikler</span>
              <span className="listManager__count">Seçili: {selectedCount}</span>
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Başlık veya tür ara"
            />
            <div className="listManager__content-grid">
              {filteredContent.map((item) => {
                const id = item._id;
                const selected = form.content.includes(id);

                return (
                  <button
                    type="button"
                    key={id}
                    className={`listManager__content-card ${selected ? 'is-selected' : ''}`}
                    onClick={() => toggleContent(id)}
                  >
                    <img src={item.imgSm || item.img} alt={item.title} />
                    <div>
                      <span className="listManager__content-title">{item.title}</span>
                      <span className="listManager__content-meta">
                        {(item.year || 'Yıl bilgisi yok')} - {(item.genre || 'Tür belirtilmedi')}
                      </span>
                    </div>
                  </button>
                );
              })}

              {!filteredContent.length && (
                <div className="listManager__empty">
                  Filtreye uygun içerik bulunamadı.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="listManager__submit"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Kaydediliyor...' : 'Listeyi Kaydet'}
          </button>
        </form>

        <div className="listManager__table">
          <h2>Mevcut Listeler</h2>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            disableSelectionOnClick
            className="listManager__dataGrid"
            pageSizeOptions={[8, 15, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 8 },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ListManager;
