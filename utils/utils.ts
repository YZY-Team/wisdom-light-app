import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

/**
 * 判断是否是移动设备
 * @returns {boolean}
 */
export const isMobileAgent = () => {
  return /(android|iphone|ipad|mobile)/i.test(navigator.userAgent);
};

/**
 * 格式化日期为年月日格式
 * @param {string} dateString - ISO格式的日期字符串
 * @returns {string} 格式化后的日期字符串 (YYYY/MM/DD)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0].replace(/-/g, "/");
};

/**
 * 格式化钱包地址，保留前三位和后六位
 * @param {string} address - 完整的钱包地址
 * @returns {string} 格式化后的钱包地址
 */
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 9) return address;
  return `${address.slice(0, 3)}...${address.slice(-4)}`;
};

/**
 * 复制文本到剪贴板的自定义 Hook
 * @returns {(text: string) => Promise<void>} 复制函数
 */
export const useCopyToClipboard = () => {
  const t = useTranslations();

  return async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("common.copy.success"));
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!success) throw new Error(t("common.copy.failed"));
        toast.success(t("common.copy.success"));
      } catch (fallbackErr) {
        console.log(t("common.copy.failed"), fallbackErr);
        toast.error(t("common.copy.failed"));
      }
    }
  };
};

/**
 * 计算代理等级
 * @param {number} count - 代理人数
 * @returns {number} 代理等级 (0-5)
 */
export const getAgentLevel = (count: number): number => {
  if (count >= 300) return 5;
  if (count >= 120) return 4;
  if (count >= 60) return 3;
  if (count >= 15) return 2;
  if (count >= 5) return 1;
  return 0;
};

/**
 * 工具类
 * @returns
 */
export const utils = {
  isMobileAgent,
  formatDate,
  formatWalletAddress,
  useCopyToClipboard,
  getAgentLevel,
};
