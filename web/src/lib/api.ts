// 后端调用抽象层(见《技术方案.md》§2)。
// 开发环境:留空,Astro dev 把 /api 代理到本地 FastAPI。
// 生产环境:设置 PUBLIC_API_BASE 指向 API 域名(需开启 CORS),或用同域 /api 由反代转发。
const BASE = import.meta.env.PUBLIC_API_BASE ?? '';

export const apiUrl = (path: string) => `${BASE}${path}`;

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}
