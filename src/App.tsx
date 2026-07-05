import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/Logo";

import Login from "@/pages/Login";
import Overview from "@/pages/Overview";
import Users from "@/pages/Users";
import Content from "@/pages/Content";
import Plans from "@/pages/Plans";
import Categories from "@/pages/Categories";
import Payments from "@/pages/Payments";
import Reports from "@/pages/Reports";
import Cup from "@/pages/Cup";

function BootSplash() {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-base">
      <Logo wordmark={false} size={44} className="animate-pulse" />
      <span className="live-dot" />
    </div>
  );
}

export default function App() {
  const { profile, ready } = useAuth();
  if (!ready) return <BootSplash />;

  return (
    <Routes>
      <Route
        path="/login"
        element={profile ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={profile ? <AppShell /> : <Navigate to="/login" replace />}
      >
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/content" element={<Content />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
