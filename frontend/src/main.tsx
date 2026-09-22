import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/AuthStore";
import { RoleSwitcher } from "./components/common/RoleSwitcher";
import { DashboardPage } from "./pages/DashboardPage";
import { PlansPage } from "./pages/PlansPage";
import { RelicsPage } from "./pages/RelicsPage";
import { DamagesPage } from "./pages/DamagesPage";
import { ImagesPage } from "./pages/ImagesPage";
import "./styles.css";

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const openPlan = (id: number) => {
    setActive("/plans");
    // 通过自定义事件把选中的方案传给方案页
    window.dispatchEvent(new CustomEvent("relic:open-plan", { detail: { id } }));
  };

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
        <RoleSwitcher />
      </aside>
      <main className="page">
        {active === "/dashboard" && <DashboardPage onOpenPlan={openPlan} />}
        {active === "/plans" && <PlansPage />}
        {active === "/relics" && <RelicsPage onOpenPlan={openPlan} />}
        {active === "/damages" && <DamagesPage />}
        {active === "/images" && <ImagesPage />}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
