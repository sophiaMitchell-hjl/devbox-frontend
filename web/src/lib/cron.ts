// Cron 逻辑封装 —— 纯浏览器计算,离线可用。
// 解释:cronstrue(支持中英文);下次执行时间:croner。
import cronstrue from 'cronstrue/i18n';
import { Cron } from 'croner';
import type { Lang } from '../i18n';

export interface CronResult {
  ok: boolean;
  expression: string;
  explanation?: string; // 人话解释
  nextRuns?: Date[]; // 未来执行时间
  error?: string;
}

const MSG = {
  zh: {
    empty: '请输入 cron 表达式',
    parse: '表达式无法解析:请检查字段格式',
    calc: '无法计算执行时间:表达式可能无效',
  },
  en: {
    empty: 'Enter a cron expression',
    parse: 'Could not parse the expression: check the field format',
    calc: 'Could not compute run times: the expression may be invalid',
  },
} as const;

/** 解释 + 计算下次执行时间。任一失败即返回 error。 */
export function evaluateCron(expr: string, lang: Lang = 'zh', count = 5): CronResult {
  const t = MSG[lang];
  const expression = expr.trim().replace(/\s+/g, ' ');
  if (!expression) {
    return { ok: false, expression, error: t.empty };
  }
  let explanation: string;
  try {
    explanation = cronstrue.toString(expression, {
      locale: lang === 'en' ? 'en' : 'zh_CN',
      use24HourTimeFormat: true,
    });
  } catch (e) {
    return { ok: false, expression, error: t.parse };
  }
  let nextRuns: Date[];
  try {
    const job = new Cron(expression);
    nextRuns = job.nextRuns(count);
  } catch (e) {
    return { ok: false, expression, explanation, error: t.calc };
  }
  return { ok: true, expression, explanation, nextRuns };
}

const pad = (n: number) => String(n).padStart(2, '0');
const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 本地时区格式化:2026-07-01 03:00:00 周三 / Wed */
export function formatDate(d: Date, lang: Lang = 'zh'): string {
  const base =
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return lang === 'en' ? `${base} ${WEEK_EN[d.getDay()]}` : `${base} 周${WEEK_ZH[d.getDay()]}`;
}

export interface CronPreset {
  label: string;
  expr: string;
}

const PRESETS: Record<Lang, CronPreset[]> = {
  zh: [
    { label: '每分钟', expr: '* * * * *' },
    { label: '每 5 分钟', expr: '*/5 * * * *' },
    { label: '每小时', expr: '0 * * * *' },
    { label: '每天凌晨', expr: '0 0 * * *' },
    { label: '每天 3 点', expr: '0 3 * * *' },
    { label: '每周一 9 点', expr: '0 9 * * 1' },
    { label: '每月 1 号', expr: '0 0 1 * *' },
    { label: '工作日 18 点', expr: '0 18 * * 1-5' },
  ],
  en: [
    { label: 'Every minute', expr: '* * * * *' },
    { label: 'Every 5 min', expr: '*/5 * * * *' },
    { label: 'Hourly', expr: '0 * * * *' },
    { label: 'Daily at midnight', expr: '0 0 * * *' },
    { label: 'Daily at 3am', expr: '0 3 * * *' },
    { label: 'Mon 9am', expr: '0 9 * * 1' },
    { label: '1st of month', expr: '0 0 1 * *' },
    { label: 'Weekdays 6pm', expr: '0 18 * * 1-5' },
  ],
};

const FIELDS: Record<Lang, { key: string; label: string; hint: string }[]> = {
  zh: [
    { key: 'min', label: '分钟', hint: '0-59' },
    { key: 'hour', label: '小时', hint: '0-23' },
    { key: 'dom', label: '日', hint: '1-31' },
    { key: 'month', label: '月', hint: '1-12' },
    { key: 'dow', label: '周', hint: '0-6(0=周日)' },
  ],
  en: [
    { key: 'min', label: 'Minute', hint: '0-59' },
    { key: 'hour', label: 'Hour', hint: '0-23' },
    { key: 'dom', label: 'Day', hint: '1-31' },
    { key: 'month', label: 'Month', hint: '1-12' },
    { key: 'dow', label: 'Weekday', hint: '0-6 (0=Sun)' },
  ],
};

export const getCronPresets = (lang: Lang): CronPreset[] => PRESETS[lang];
export const getCronFields = (lang: Lang) => FIELDS[lang];

// 向后兼容(默认中文)
export const cronPresets = PRESETS.zh;
export const cronFields = FIELDS.zh;
