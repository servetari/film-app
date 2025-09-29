import './App.css';
import Register from './pages/register/Register';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Watch from './pages/watch/Watch';
import AdminHome from './pages/admin/adminHome/AdminHome';
import NewContent from './pages/admin/newContent/NewContent';
import ContentList from './pages/admin/contentList/ContentList';
import ListManager from './pages/admin/listManager/ListManager';
import Profile from './pages/profile/Profile';

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/authContext/AuthContext';
import ProfileMode from './pages/mode/ProfileMode';

function App() {
  const { user } = useContext(AuthContext);
  const isAdmin = Boolean(user?.user?.isAdmin);
  const needsMode = Boolean(user) && !localStorage.getItem('profileMode');

  return (
    <Routes>
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      {user && (
        <>
          <Route path="/" element={needsMode ? <Navigate to="/profile-mode" replace /> : <Home />} />
          <Route path="/movies" element={needsMode ? <Navigate to="/profile-mode" replace /> : <Home type="movie" />} />
          <Route path="/series" element={needsMode ? <Navigate to="/profile-mode" replace /> : <Home type="series" />} />
          <Route path="/watch" element={needsMode ? <Navigate to="/profile-mode" replace /> : <Watch />} />
          <Route path="/profile" element={needsMode ? <Navigate to="/profile-mode" replace /> : <Profile />} />
          <Route path="/profile-mode" element={<ProfileMode />} />
        </>
      )}

      {isAdmin && (
        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<ContentList />} />
          <Route path="content" element={<ContentList />} />
          <Route path="lists" element={<ListManager />} />
          <Route path="new-content" element={<NewContent />} />
        </Route>
      )}

      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/register'} replace />}
      />
    </Routes>
  );
}

export default App;
