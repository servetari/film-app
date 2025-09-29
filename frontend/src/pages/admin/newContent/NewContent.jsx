import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './newContent.scss';

const initialContentState = {
  title: '',
  description: '',
  year: '',
  genre: '',
  limit: '',
  isSeries: false,
  img: '',
  imgTitle: '',
  imgSm: '',
  trailer: '',
  video: '',
};

const NewContent = () => {
  const [content, setContent] = useState(initialContentState);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const trailerInputRef = useRef(null);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lists?full=true');
        setLists(response.data || []);
      } catch (error) {
        console.error('Listeler alınamadı:', error);
        setFeedback({ type: 'error', message: 'Listeler yüklenirken bir sorun oluştu.' });
      }
    };

    loadLists();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback({ type: '', message: '' });

    if (name === 'isSeries') {
      setContent((prev) => ({ ...prev, [name]: value === 'true' }));
      return;
    }

    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFromOMDb = async (event) => {
    event.preventDefault();

    const title = content.title.trim();

    if (!title) {
      setFeedback({ type: 'error', message: 'Lütfen önce bir başlık girin.' });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/content/omdb/${encodeURIComponent(title)}`);
      const data = response.data;

      if (!data || data.Response !== 'True') {
        setFeedback({ type: 'error', message: 'İçerik OMDb üzerinde bulunamadı.' });
        return;
      }

      setContent((prev) => ({
        ...prev,
        description: data.Plot || prev.description,
        year: data.Year || prev.year,
        genre: data.Genre || prev.genre,
        img: data.Poster || prev.img,
        limit: data.Rated || prev.limit,
      }));
      setFeedback({ type: 'success', message: 'OMDb bilgileri eklendi.' });
    } catch (error) {
      console.error('OMDb isteği başarısız:', error);
      setFeedback({ type: 'error', message: 'OMDb servisinden yanıt alınamadı.' });
    }
  };

  const uploadMedia = async (file, targetField) => {
    if (!file) {
      return;
    }
    setFeedback({ type: '', message: '' });
    setUploadingField(targetField);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post('http://localhost:5000/api/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setContent((prev) => ({ ...prev, [targetField]: data.url }));
      setFeedback({ type: 'success', message: 'Video başarıyla yüklendi.' });
    } catch (error) {
      console.error('Video yüklenirken hata oluştu:', error);
      const message = error?.response?.data?.message || 'Video yüklenirken bir sorun oluştu.';
      setFeedback({ type: 'error', message });
    } finally {
      setUploadingField('');
    }
  };

  const handleFileSelect = (event, field) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMedia(file, field);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', message: '' });
    setLoading(true);

    try {
      const payload = {
        ...content,
        title: content.title.trim(),
        genre: content.genre.trim(),
        description: content.description.trim(),
        year: content.year.trim(),
        limit: content.limit.trim(),
      };

      const response = await axios.post('http://localhost:5000/api/content', payload);
      const createdContent = response.data;

      if (selectedListId) {
        await axios.put(`http://localhost:5000/api/lists/${selectedListId}`, {
          $push: { content: createdContent._id },
        });
      }

      setFeedback({ type: 'success', message: 'İçerik kaydedildi.' });
      setContent(initialContentState);
      setSelectedListId('');
      navigate('/admin/content');
    } catch (error) {
      console.error('İçerik kaydedilirken hata oluştu:', error);
      const message = error?.response?.data?.message || 'İçerik kaydedilirken bir sorun oluştu.';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newContent">
      <h1 className="addContentTitle">Yeni İçerik Ekle</h1>

      {feedback.message && (
        <div className={`newContent__feedback newContent__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <form className="addContentForm" onSubmit={handleSubmit}>
        <div className="form-left">
          <div className="addContentItem">
            <label>Başlık</label>
            <div className="title-fetch-container">
              <input
                type="text"
                placeholder="The Matrix"
                name="title"
                value={content.title}
                onChange={handleChange}
                required
              />
              <button className="fetchButton" onClick={fetchFromOMDb} type="button">
                Bilgi Çek
              </button>
            </div>
          </div>
          <div className="addContentItem">
            <label>Açıklama</label>
            <textarea
              placeholder="Açıklama..."
              name="description"
              value={content.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="addContentItem">
            <label>Yıl</label>
            <input type="text" placeholder="1999" name="year" value={content.year} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Tür (Genre)</label>
            <input type="text" placeholder="Action, Sci-Fi" name="genre" value={content.genre} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Yaş Sınırı</label>
            <input type="text" placeholder="PG-13" name="limit" value={content.limit} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Dizi mi?</label>
            <select name="isSeries" value={String(content.isSeries)} onChange={handleChange}>
              <option value="false">Hayır (Film)</option>
              <option value="true">Evet (Dizi)</option>
            </select>
          </div>
        </div>
        <div className="form-right">
          <div className="addContentItem">
            <label>Ana Görsel (Poster)</label>
            <input type="text" placeholder="Poster URL" name="img" value={content.img} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Başlık Görseli</label>
            <input type="text" placeholder="Başlık görseli URL" name="imgTitle" value={content.imgTitle} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Kapak Görseli</label>
            <input type="text" placeholder="Kapak URL" name="imgSm" value={content.imgSm} onChange={handleChange} />
          </div>
          <div className="addContentItem">
            <label>Fragman (Trailer)</label>
            <div className="upload-field">
              <input
                type="text"
                placeholder="Fragman URL"
                name="trailer"
                value={content.trailer}
                onChange={handleChange}
              />
              <input
                type="file"
                accept="video/*"
                ref={trailerInputRef}
                style={{ display: 'none' }}
                onChange={(event) => handleFileSelect(event, 'trailer')}
              />
              <button
                type="button"
                className="uploadButton"
                onClick={() => trailerInputRef.current?.click()}
                disabled={uploadingField === 'trailer'}
              >
                {uploadingField === 'trailer' ? 'Yükleniyor…' : 'Yükle'}
              </button>
            </div>
          </div>
          <div className="addContentItem">
            <label>Video</label>
            <div className="upload-field">
              <input
                type="text"
                placeholder="Video URL"
                name="video"
                value={content.video}
                onChange={handleChange}
              />
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                style={{ display: 'none' }}
                onChange={(event) => handleFileSelect(event, 'video')}
              />
              <button
                type="button"
                className="uploadButton"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingField === 'video'}
              >
                {uploadingField === 'video' ? 'Yükleniyor…' : 'Yükle'}
              </button>
            </div>
          </div>
          <div className="addContentItem">
            <label>Listeye Ekle</label>
            <select value={selectedListId} onChange={(event) => setSelectedListId(event.target.value)}>
              <option value="">-- Liste Seç --</option>
              {lists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.title} ({list.content?.length || 0})
                </option>
              ))}
            </select>
          </div>
          <button className="addContentButton" type="submit" disabled={loading || uploadingField !== ''}>
            {loading ? 'Kaydediliyor...' : 'Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewContent;
