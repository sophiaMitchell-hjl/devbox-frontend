// Cron 逻辑封装 —— 纯浏览器计算,离线可用。
// 解释:cronstrue(支持中文);下次执行时间:croner。
import cronstrue from 'cronstrue/i18n';
import { Cron } from 'croner';

export interface CronResult {
  ok: boolean;
  expression: string;
  explanation?: string; // 人话解释(中文)
  nextRuns?: Date[]; // 未来执行时间
  error?: string;
}

/** 解释 + 计算下次执行时间。任一失败即返回 error。 */
export function evaluateCron(expr: string, count = 5): CronResult {
  const expression = expr.trim().replace(/\s+/g, ' ');
  if (!expression) {
    return { ok: false, expression, error: '请输入 cron 表达式' };
  }
  let explanation: string;
  try {
    explanation = cronstrue.toString(expression, {
      locale: 'zh_CN',
      use24HourTimeFormat: true,
    });
  } catch (e) {
    return { ok: false, expression, error: '表达式无法解析:请检查字段格式' };
  }
  let nextRuns: Date[];
  try {
    const job = new Cron(expression);
    nextRuns = job.nextRuns(count);
  } catch (e) {
    return { ok: false, expression, explanation, error: '无法计算执行时间:表达式可能无效' };
  }
  return { ok: true, expression, explanation, nextRuns };
}

const pad = (n: number) => String(n).padStart(2, '0');
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

/** 本地时区格式化:2026-07-01 03:00:00 周三 */
export function formatDate(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} 周${WEEK[d.getDay()]}`
  );
}

export interface CronPreset {
  label: string;
  expr: string;
}

export const cronPresets: CronPreset[] = [
  { label: '每分钟', expr: '* * * * *' },
  { label: '每 5 分钟', expr: '*/5 * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天凌晨', expr: '0 0 * * *' },
  { label: '每天 3 点', expr: '0 3 * * *' },
  { label: '每周一 9 点', expr: '0 9 * * 1' },
  { label: '每月 1 号', expr: '0 0 1 * *' },
  { label: '工作日 18 点', expr: '0 18 * * 1-5' },
];

export const cronFields = [
  { key: 'min', label: '分钟', hint: '0-59' },
  { key: 'hour', label: '小时', hint: '0-23' },
  { key: 'dom', label: '日', hint: '1-31' },
  { key: 'month', label: '月', hint: '1-12' },
  { key: 'dow', label: '周', hint: '0-6(0=周日)' },
] as const;
