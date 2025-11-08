import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import authApi from '@/features/auth/services/auth-api.js';
import { storage, SESSION_STORAGE_KEY } from '@/lib/storage.js';
import { ROLE_PERMISSIONS } from '@/constants/role-permissions.js';

const defaultSession = {
  user: null,
  roles: [],
  permissions: [],
  tokens: null,
  isAuthenticated: false,
};

const toRoleNames = (roles = []) => roles
  .map((role) => (typeof role === 'string' ? role : role?.name))
  .filter(Boolean);

const derivePermissions = (roleNames = []) => {
  const permissionSet = new Set();
  roleNames.forEach((name) => {
    (ROLE_PERMISSIONS[name] || []).forEach((permission) => permissionSet.add(permission));
  });
  return Array.from(permissionSet);
};

export const SessionContext = createContext({
  ...defaultSession,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(defaultSession);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    storage.set(SESSION_STORAGE_KEY, nextSession);
  }, []);

  const clearSession = useCallback(() => {
    setSession(defaultSession);
    storage.remove(SESSION_STORAGE_KEY);
  }, []);

  const buildSessionFromResponse = useCallback((data) => {
    const roleNames = toRoleNames(data.user?.roles);
    const formattedUser = {
      ...data.user,
      roles: roleNames,
    };
    return {
      user: formattedUser,
      roles: roleNames,
      permissions: derivePermissions(roleNames),
      tokens: data.tokens,
      isAuthenticated: true,
    };
  }, []);

  const refreshWithToken = useCallback(
    async (refreshToken) => {
      try {
        const data = await authApi.refresh({ refreshToken });
        persistSession(buildSessionFromResponse(data));
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [persistSession, clearSession, buildSessionFromResponse],
  );

  useEffect(() => {
    const stored = storage.get(SESSION_STORAGE_KEY);
    const bootstrap = async () => {
      if (stored?.tokens?.refreshToken) {
        try {
          await refreshWithToken(stored.tokens.refreshToken);
        } catch (err) {
          // session cleared in refreshWithToken
        }
      } else if (stored) {
        const roleNames = toRoleNames(stored.roles);
        persistSession({
          ...stored,
          roles: roleNames,
          permissions: derivePermissions(roleNames),
          isAuthenticated: true,
        });
      }
      setIsLoading(false);
    };

    bootstrap();
  }, [persistSession, refreshWithToken]);

  useEffect(() => {
    const handleForcedLogout = () => clearSession();
    window.addEventListener('hermes:session-expired', handleForcedLogout);
    return () => window.removeEventListener('hermes:session-expired', handleForcedLogout);
  }, [clearSession]);

  const login = useCallback(
    (payload) => {
      const nextSession = buildSessionFromResponse(payload);
      persistSession(nextSession);
    },
    [persistSession, buildSessionFromResponse],
  );

  const logout = useCallback(async () => {
    try {
      if (session.tokens?.refreshToken) {
        await authApi.logout({ refreshToken: session.tokens.refreshToken });
      }
    } catch (error) {
      // logout başarısız olsa bile lokal oturumu temizle
    } finally {
      clearSession();
    }
  }, [session.tokens?.refreshToken, clearSession]);

  const value = useMemo(
    () => ({
      ...session,
      isLoading,
      login,
      logout,
    }),
    [session, isLoading, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
