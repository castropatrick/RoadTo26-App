import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getDb, initializeSchema } from '../db/schema';

const AuthContext = createContext(null);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const IS_MOCK_MODE = API_BASE_URL.trim().length === 0;

function createLocalUser({ username, displayName }) {
  const cleanUsername = username.trim().toLowerCase();
  const fallbackName = cleanUsername || 'collector';
  const idSuffix = fallbackName.replace(/[^a-z0-9_-]/g, '-');

  return {
    id: `local-${idSuffix || Date.now()}`,
    username: cleanUsername,
    displayName: displayName?.trim() || cleanUsername || 'Collector',
    avatarSeed: cleanUsername || fallbackName,
    isMock: true,
  };
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarSeed: row.avatar_seed,
    city: row.city,
    region: row.region,
    country: row.country,
    completedCount: row.completed_count,
    duplicateCount: row.duplicate_count,
    isMock: row.is_mock === 1,
    isSynced: row.is_synced === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readCurrentUser() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT * FROM current_user ORDER BY updated_at DESC LIMIT 1'
  );

  return mapUserRow(row);
}

async function persistCurrentUser(user) {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM current_user');
    await db.runAsync(
      `
        INSERT INTO current_user (
          id,
          username,
          display_name,
          avatar_seed,
          is_mock,
          is_synced,
          updated_at
        )
        VALUES (?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP)
      `,
      user.id,
      user.username,
      user.displayName,
      user.avatarSeed
    );
  });

  return readCurrentUser();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hydrate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await initializeSchema();
      const hydratedUser = await readCurrentUser();
      setUser(hydratedUser);
    } catch (authError) {
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async ({ identifier, password }) => {
    if (!IS_MOCK_MODE) {
      throw new Error('Auth real ainda nao foi implementado.');
    }

    const username = identifier?.trim();

    if (!username || !password) {
      throw new Error('Informe usuario e senha.');
    }

    const existingUser = await readCurrentUser();
    const nextUser =
      existingUser?.username?.toLowerCase() === username.toLowerCase()
        ? existingUser
        : createLocalUser({ username, displayName: username });

    const savedUser = await persistCurrentUser(nextUser);
    setUser(savedUser);

    return savedUser;
  }, []);

  const register = useCallback(async ({ username, displayName, password }) => {
    if (!IS_MOCK_MODE) {
      throw new Error('Cadastro real ainda nao foi implementado.');
    }

    if (!username?.trim() || !displayName?.trim() || !password) {
      throw new Error('Preencha usuario, nome e senha.');
    }

    const savedUser = await persistCurrentUser(
      createLocalUser({ username, displayName })
    );
    setUser(savedUser);

    return savedUser;
  }, []);

  const logout = useCallback(async () => {
    const db = await getDb();

    await db.runAsync('DELETE FROM current_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      isMockMode: IS_MOCK_MODE,
      hydrate,
      login,
      register,
      logout,
    }),
    [error, hydrate, isLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

export default useAuth;
