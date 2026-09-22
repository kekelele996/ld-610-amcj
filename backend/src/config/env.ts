export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? "localhost",
  jwtSecret: process.env.JWT_SECRET ?? "local-dev-secret",
  /** 本地演示账号统一口令（仅种子用户，全部本地数据，无第三方） */
  demoPassword: process.env.DEMO_PASSWORD ?? "relic123"
};
