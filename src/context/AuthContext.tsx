import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Client, NotificationRecord, UserRole } from '../types';
import { api } from '../api';

export type PortalMode = 'PUBLIC' | 'ADMIN' | 'CLIENT';

interface AuthContextType {
  currentUser: User | null;
  currentClient: Client | null;
  allUsers: User[];
  allClients: Client[];
  portalMode: PortalMode;
  currentRole: PortalMode;
  unreadCount: number;
  notifications: NotificationRecord[];
  isLoading: boolean;
  setPortalMode: (mode: PortalMode) => void;
  setCurrentRole: (mode: PortalMode) => void;
  switchUser: (user: User) => void;
  selectClient: (client: Client | null) => void;
  refreshNotifications: () => Promise<void>;
  refreshClients: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [portalMode, setPortalMode] = useState<PortalMode>('PUBLIC');
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const init = async () => {
    try {
      setIsLoading(true);
      const [users, clients] = await Promise.all([api.getUsers(), api.getClients(true)]);
      setAllUsers(users);
      setAllClients(clients);

      // Default to Lead Assessor (Owner) initially
      const owner = users.find((u) => u.role === 'OWNER') || users[0];
      if (owner) {
        setCurrentUser(owner);
        api.setActiveUserId(owner.id);
      }

      if (clients.length > 0) {
        setCurrentClient(clients[0]);
      }
    } catch (err) {
      console.error('Failed to initialise auth context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const refreshNotifications = async () => {
    try {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const refreshClients = async () => {
    try {
      const [clients, users] = await Promise.all([api.getClients(true), api.getUsers()]);
      setAllClients(clients);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to refresh clients/users:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser, portalMode]);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    api.setActiveUserId(user.id);
    if (user.role === 'CLIENT' && user.clientId) {
      const client = allClients.find((c) => c.id === user.clientId);
      if (client) setCurrentClient(client);
      setPortalMode('CLIENT');
    } else {
      setPortalMode('ADMIN');
    }
  };

  const selectClient = (client: Client | null) => {
    setCurrentClient(client);
    if (client) {
      const clientUser = allUsers.find((u) => u.clientId === client.id);
      if (clientUser) {
        setCurrentUser(clientUser);
        api.setActiveUserId(clientUser.id);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentClient,
        allUsers,
        allClients,
        portalMode,
        currentRole: portalMode,
        unreadCount,
        notifications,
        isLoading,
        setPortalMode,
        setCurrentRole: setPortalMode,
        switchUser,
        selectClient,
        refreshNotifications,
        refreshClients,
        markNotificationAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
