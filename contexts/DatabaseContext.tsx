import React, { createContext, useContext, useEffect, useState } from 'react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { getDatabase, initializeDatabase, getDrizzleDb, useDrizzleStudioWithCurrentDb } from '~/services/database';
import * as SQLite from 'expo-sqlite';

// 数据库上下文类型
type DatabaseContextType = {
  db: SQLite.SQLiteDatabase | null;
  drizzleDb: ReturnType<typeof drizzle> | null;
  initialize: (userId?: string) => Promise<void>;
  isInitialized: boolean;
  isInitializing: boolean;
  useDrizzleStudio: () => any;
};

// 创建上下文
const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  drizzleDb: null,
  initialize: async () => {},
  isInitialized: false,
  isInitializing: false,
  useDrizzleStudio: () => null,
});

// 提供数据库上下文的组件
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [drizzleDb, setDrizzleDb] = useState<ReturnType<typeof drizzle> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // 初始化数据库函数
  const initialize = async (userId?: string) => {
    try {
      setIsInitializing(true);
      const dbInstance = await initializeDatabase(userId);
      setDb(dbInstance);
      const drizzleInstance = getDrizzleDb();
      setDrizzleDb(drizzleInstance);
      setIsInitialized(true);
    } catch (error) {
      console.error('数据库初始化失败:', error);
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // 组件挂载时尝试初始化数据库
  useEffect(() => {
    const initDb = async () => {
      try {
        setIsInitializing(true);
        const dbInstance = await getDatabase();
        if (dbInstance) {
          setDb(dbInstance);
          const drizzleInstance = getDrizzleDb();
          setDrizzleDb(drizzleInstance);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('获取数据库失败:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initDb();
  }, []);

  return (
    <DatabaseContext.Provider value={{ 
      db, 
      drizzleDb, 
      initialize, 
      isInitialized, 
      isInitializing,
      useDrizzleStudio: useDrizzleStudioWithCurrentDb
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// 使用数据库的Hook
export const useDatabase = () => useContext(DatabaseContext); 