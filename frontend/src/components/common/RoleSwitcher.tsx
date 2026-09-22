import { useEffect } from "react";
import { useAuthStore } from "../../stores/AuthStore";
import { UserRole, UserRoleText } from "../../constants/UserRole";

// 角色切换：用于演示修复师/专家/档案员/访客看到不同按钮、越权操作被后端明确拒绝
export function RoleSwitcher() {
  const { user, accounts, ready, hydrate, loginAs, logout } = useAuthStore();

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  if (!ready) return <div className="role-switcher">加载身份…</div>;

  return (
    <div className="role-switcher">
      <div className="role-current">
        {user ? (
          <>
            <span className="role-name">{user.name}</span>
            <span className="role-badge">{UserRoleText[user.role]}</span>
          </>
        ) : (
          <span className="role-name">未登录（写操作将被拒绝）</span>
        )}
      </div>
      <div className="role-buttons">
        {accounts.length === 0 && UserRole.map((role) => (
          <button key={role} className="role-btn" onClick={() => void loginAs(role.toLowerCase())}>
            {UserRoleText[role]}
          </button>
        ))}
        {accounts.map((account) => (
          <button
            key={account.login}
            className={`role-btn ${user?.login === account.login ? "active" : ""}`}
            onClick={() => void loginAs(account.login)}
          >
            {UserRoleText[account.role]}
          </button>
        ))}
        {user && <button className="role-btn role-logout" onClick={logout}>退出</button>}
      </div>
    </div>
  );
}
