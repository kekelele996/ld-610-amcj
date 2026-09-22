import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/AuthStore";
import { RoleText, type RoleName } from "./constants/Role";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RelicsPage } from "./pages/RelicsPage";
import { DamagesPage } from "./pages/DamagesPage";
import { PlansPage } from "./pages/PlansPage";
import { ImagesPage } from "./pages/ImagesPage";
import "./styles.css";

/** 前端路由守卫：未登录一律进入登录页；越权按钮由页面/后端双层拦截 */
function pageFor(route: string, setRoute: (route: string) => void) {
  switch (route) {
    case "/dashboard":
      return <DashboardPage onGoPlans={() => setRoute("/plans")} />;
    case "/relics":
      return <RelicsPage />;
    case "/damages":
      return <DamagesPage />;
    case "/plans":
      return <PlansPage />;
    case "/images":
      return <ImagesPage />;
    default:
      return <DashboardPage onGoPlans={() => setRoute("/plans")} />;
  }
}

function App() {
  const { user, ready, hydrate, logout } = useAuthStore();
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) return <div className="login-shell">正在恢复会话…</div>;
  if (!user) return <LoginPage />;

  const role: RoleName = user.role;

  return (
    <div className="shell">
      <aside>
        <div className="brand">文物修复档案协作平台</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
        <div className="user-box">
          <p className="user-name">
            {user.display_name}
            <span className="user-role">{RoleText[role]}</span>
          </p>
          <button className="btn btn-block" onClick={logout}>
            退出登录
          </button>
        </div>
      </aside>
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">relic-restore</p>
            <h1>{routes.find((route) => route.route === active)?.name ?? "修复工作台"}</h1>
          </div>
          <span className="badge badge-approved">{RoleText[role]}</span>
        </section>
        {pageFor(active, setActive)}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
