import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '~/drizzle/migrations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as schema from '~/db/schema';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

// 全局数据库实例
let _db: SQLite.SQLiteDatabase | null = null;
let _drizzleDb: ReturnType<typeof drizzle> | null = null;

const DB_NAME_KEY = '@database_name';
const DEFAULT_DB_NAME = 'tasks';

/**
 * 初始化数据库
 * @param userId 用户ID
 * @returns 原生数据库实例
 */
export const initializeDatabase = async (userId?: string) => {
  // 如果有userId，使用用户特定的数据库名称
  const dbName = userId ? `user_${userId}_db` : DEFAULT_DB_NAME;
  
  // 存储数据库名称以便将来参考
  if (userId) {
    await AsyncStorage.setItem(DB_NAME_KEY, dbName);
  }
  
  console.log('初始化数据库:', dbName);
  
  // 打开数据库连接
  _db = SQLite.openDatabaseSync(dbName,{
    enableChangeListener:true
  });
  
  // 初始化drizzle实例
  _drizzleDb = drizzle(_db, { schema });
  
  // 运行迁移
  try {
    await runMigrations(_drizzleDb);
  } catch (error) {
    console.error('迁移失败:', error);
  }
  
  // 添加变化监听器
  SQLite.addDatabaseChangeListener((event) => {
    console.log('数据库变化', event);
  });
  
  return _db;
};

/**
 * 运行数据库迁移
 */
const runMigrations = async (db: ReturnType<typeof drizzle>) => {
  try {
    console.log('开始执行数据库迁移...');
    await migrate(db, migrations);
    console.log('数据库迁移成功完成');
    return { success: true };
  } catch (error) {
    console.log('数据库迁移失败:', error);
    return { error };
  }
};

/**
 * 获取原生数据库实例
 */
export const getDatabase = async () => {
  if (!_db) {
    const savedDbName = await AsyncStorage.getItem(DB_NAME_KEY);
    await initializeDatabase(savedDbName ? savedDbName.replace('user_', '').replace('_db', '') : undefined);
  }
  return _db;
};

/**
 * 获取drizzle数据库实例 
 */
export const getDrizzleDb = () => {
  if (!_drizzleDb && _db) {
    _drizzleDb = drizzle(_db, { schema });
  }
  return _drizzleDb;
};

/**
 * 清除当前数据库连接
 */
export const clearDatabase = async () => {
  _db = null;
  _drizzleDb = null;
  await AsyncStorage.removeItem(DB_NAME_KEY);
};

/**
 * 初始化DrizzleStudio
 * 为了确保DrizzleStudio与我们的数据库实例正确连接，
 * 我们需要在组件中使用这个函数
 */
export const useDrizzleStudioWithCurrentDb = () => {
  // 始终调用hook，即使_db可能为null
  const studioInstance = useDrizzleStudio(_db || undefined);
  return studioInstance;
}; 