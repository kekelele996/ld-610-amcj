import crypto from "crypto";

/**
 * 极简 HS256 JWT（零额外依赖）。仅用于本地演示鉴权，负载中携带 id/username/role，
 * 供 RBAC 中间件判定「修复师 / 专家审批 / 档案员 / 访客」。
 */
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

const base64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

export interface TokenPayload {
  sub: number;
  username: string;
  display_name: string;
  role: string;
  iat: number;
  exp: number;
}

export const signToken = (payload: Omit<TokenPayload, "iat" | "exp">, secret: string, ttlSeconds = 8 * 3600) => {
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds }));
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const [encodedHeader, body, signature] = parts;
  const expected = crypto.createHmac("sha256", secret).update(`${encodedHeader}.${body}`).digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) {
    throw new Error("signature mismatch");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("token expired");
  return payload;
};
