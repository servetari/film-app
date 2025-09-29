import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { DeleteOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './contentList.scss';

export default function ContentList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/content');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContent();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/content/${id}`);
      setData(data.filter((item) => item._id !== id));
    } catch (err) {
        console.error(err);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    {
      field: 'content',
      headerName: 'İçerik',
      width: 200,
      renderCell: (params) => {
        return (
          <div className="contentListItem">
            <img className="contentListImg" src={params.row.imgSm} alt="" />
            {params.row.title}
          </div>
        );
      },
    },
    { field: 'genre', headerName: 'Tür', width: 120 },
    { field: 'year', headerName: 'Yıl', width: 120 },
    { field: 'isSeries', headerName: 'Dizi mi?', width: 120 },
    {
      field: 'action',
      headerName: 'Eylem',
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/admin/content/${params.row._id}`} state={{content: params.row}}>
              <button className="contentListEdit">Düzenle</button>
            </Link>
            <DeleteOutline
              className="contentListDelete"
              onClick={() => handleDelete(params.row._id)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="contentList">
      <DataGrid
        rows={data}
        disableSelectionOnClick
        columns={columns}
        pageSize={8}
        checkboxSelection
        getRowId={(r) => r._id}
      />
    </div>
  );
}