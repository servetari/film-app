import React from 'react';
import { NavLink } from 'react-router-dom';
import { LineStyle, PlayCircleOutline, ListAlt, AddCircleOutline } from '@mui/icons-material';
import './sidebar.scss';

const menuItems = [
  {
    label: 'Genel Bakış',
    to: '/admin',
    icon: <LineStyle className="sidebar__icon" />,
    exact: true,
  },
  {
    label: 'İçerikler',
    to: '/admin/content',
    icon: <PlayCircleOutline className="sidebar__icon" />,
  },
  {
    label: 'Listeler',
    to: '/admin/lists',
    icon: <ListAlt className="sidebar__icon" />,
  },
  {
    label: 'Yeni İçerik',
    to: '/admin/new-content',
    icon: <AddCircleOutline className="sidebar__icon" />,
  },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        <div className="sidebar__block">
          <h3>Yönetim</h3>
          <ul className="sidebar__menu">
            {menuItems.map(({ label, to, icon, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={Boolean(exact)}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
