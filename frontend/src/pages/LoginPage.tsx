import { useState } from "react";
import { useAuthStore } from "../stores/AuthStore";
import { ApiError } from "../api/http";
import { DEMO_ACCOUNTS, RoleText } from "../constants/Role";

/** 登录页：四个本地演示角色一键填充；口令错误时展示后端明确原因 */
export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("restorer");
  const [password, setPassword] = useState("relic123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.displayMessage : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <p className="eyebrow">relic-restore</p>
        <h1>文物修复档案协作平台</h1>
        <p className="login-sub">请选择本地演示角色登录（数据全部来自本地数据库种子）</p>
        <label>
          用户名
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>
        <label>
          口令
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "登录中…" : "登录"}
        </button>
        <div className="demo-accounts">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              type="button"
              key={account.username}
              className="chip"
              onClick={() => {
                setUsername(account.username);
                setPassword(account.password);
              }}
            >
              {RoleText[account.role]}（{account.username}）
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
