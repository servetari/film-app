import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const INITIAL = {
  notifications: [],
  unread: 0,
  markAllRead: () => {},
};

const NotificationsContext = createContext(INITIAL);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const esRef = useRef(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (!user?.token) return undefined;

    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const url = `http://localhost:5000/api/notifications/stream?token=${user.token}`;
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setNotifications((prev) => [data, ...prev].slice(0, 50));
          setUnread((n) => n + 1);
        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setTimeout(connect, 2000);
      };
    };

    fetch('http://localhost:5000/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});

    connect();

    return () => {
      stopped = true;
      if (esRef.current) esRef.current.close();
    };
  }, []);

  const markAllRead = () => setUnread(0);

  const value = useMemo(() => ({ notifications, unread, markAllRead }), [notifications, unread]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);

