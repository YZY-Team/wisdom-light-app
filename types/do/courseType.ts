export type Course = {
  /**
   * 课程唯一标识，字符串格式（如 UUID）
   */
  id: string;

  /**
   * 课程标题
   */
  title: string;

  /**
   * 课程描述，可能为空
   */
  description: string;

  /**
   * 封面图片 URL，可能为空
   */
  coverUrl: string;

  /**
   * 课程类型，可能为空
   */
  type: string;

  /**
   * 课程价格，单位为分（整数）或元（浮点数）
   */
  price: number;

  /**
   * 教师 ID，字符串格式
   */
  teacherId: string;

  /**
   * 教师姓名，可能为空
   */
  teacherName: string;

  /**
   * 课程状态，可能为空
   */
  status: string;

  /**
   * 创建时间，ISO 格式字符串
   */
  createTime: string;

  /**
   * 更新时间，ISO 格式字符串
   */
  updateTime: string;

  /**
   * 是否逻辑删除
   */
  isDeleted: boolean;
};


export type CourseVideo = {
    id: string;
    fileId: string;
    courseId: string;
    title: string;
    description: string | null;
    duration: number | null;
    sequence: number;
    accessType: string;
    videoUrl: string;
    coverUrl: string;
    fileName: string | null;
    status: string;
  };
  