import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell.js";
import { AuthPage } from "./pages/AuthPage.js";
import { CategoriesPage } from "./pages/CategoriesPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { TransactionsPage } from "./pages/TransactionsPage.js";
import { useAuthStore } from "./stores/auth.js";

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute({ mode }: { mode: "login" | "signup" }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <AuthPage mode={mode} />;
}

function HomeRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppShell /> : <AuthPage mode="login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute mode="login" />} />
      <Route path="/signup" element={<PublicRoute mode="signup" />} />
      <Route path="/" element={<HomeRoute />}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
