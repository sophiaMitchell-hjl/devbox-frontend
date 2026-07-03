// 在 Worker 里执行正则匹配,主线程用超时 + terminate 防护灾难性回溯(ReDoS)。
export interface RegexReq {
  pattern: string;
  flags: string;
  text: string;
}
export interface RegexMatch {
  index: number;
  match: string;
  groups: (string | undefined)[];
  named: Record<string, string> | null;
}

self.onmessage = (e: MessageEvent<RegexReq>) => {
  const { pattern, flags, text } = e.data;
  try {
    // 找出全部匹配需要 g 标志,内部补上(不改变用户看到的 flags)
    const fg = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, fg);
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1),
        named: m.groups ? { ...m.groups } : null,
      });
      if (m.index === re.lastIndex) re.lastIndex++; // 零长度匹配防死循环
      if (++guard > 100000) break;
    }
    (self as unknown as Worker).postMessage({ ok: true, matches });
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, error: (err as Error).message });
  }
};
