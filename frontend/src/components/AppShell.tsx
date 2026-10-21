import { LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { initials } from "../lib/format.js";
import { useAuthStore } from "../stores/auth.js";
import { Brand } from "./Brand.js";
import { ToastViewport } from "./Toast.js";

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" aria-label="Financy — dashboard">
            <Brand compact />
          </Link>
          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/transactions">Transações</NavLink>
            <NavLink to="/categories">Categorias</NavLink>
          </nav>
          <div className="topbar__user">
            <button
              type="button"
              className="avatar avatar--small"
              onClick={() => navigate("/profile")}
              aria-label="Abrir perfil"
            >
              {initials(user?.name ?? "")}
            </button>
            <button
              type="button"
              className="icon-button topbar__logout"
              aria-label="Sair"
              title="Sair"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      <main className="page-main">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  );
}
