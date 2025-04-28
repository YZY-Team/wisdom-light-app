import { useCallback } from 'react';
import { useDatabase } from '~/contexts/DatabaseContext';
import { eq } from 'drizzle-orm';

/**
 * 提供数据库常用操作的Hook
 */
export const useDbHelpers = <T extends Record<string, any>>() => {
  const { db } = useDatabase();

  /**
   * 获取所有记录
   * @param table 表对象
   * @returns 记录数组
   */
  const getAll = useCallback(
    async (table: any) => {
      if (!db) throw new Error('数据库未初始化');
      return await db.select().from(table);
    },
    [db]
  );

  /**
   * 通过ID获取记录
   * @param table 表对象
   * @param id 记录ID
   * @param idField ID字段名，默认为'id'
   * @returns 记录或undefined
   */
  const getById = useCallback(
    async (table: any, id: string | number, idField = 'id') => {
      if (!db) throw new Error('数据库未初始化');
      const result = await db.select().from(table).where(eq(table[idField], id));
      return result[0];
    },
    [db]
  );

  /**
   * 插入记录
   * @param table 表对象
   * @param data 要插入的数据
   * @returns 插入的结果
   */
  const insert = useCallback(
    async (table: any, data: T) => {
      if (!db) throw new Error('数据库未初始化');
      return await db.insert(table).values(data);
    },
    [db]
  );

  /**
   * 更新记录
   * @param table 表对象
   * @param id 记录ID
   * @param data 要更新的数据
   * @param idField ID字段名，默认为'id'
   * @returns 更新结果
   */
  const update = useCallback(
    async (table: any, id: string | number, data: Partial<T>, idField = 'id') => {
      if (!db) throw new Error('数据库未初始化');
      return await db.update(table).set(data).where(eq(table[idField], id));
    },
    [db]
  );

  /**
   * 删除记录
   * @param table 表对象
   * @param id 记录ID
   * @param idField ID字段名，默认为'id'
   * @returns 删除结果
   */
  const remove = useCallback(
    async (table: any, id: string | number, idField = 'id') => {
      if (!db) throw new Error('数据库未初始化');
      return await db.delete(table).where(eq(table[idField], id));
    },
    [db]
  );

  return {
    getAll,
    getById,
    insert,
    update,
    remove,
    db,
  };
}; 