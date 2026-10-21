import { LogOut, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand.js";
import { toast } from "../components/Toast.js";
import { Button, Field, Input } from "../components/ui.js";
import { initials } from "../lib/format.js";
import { useAuthStore } from "../stores/auth.js";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim() && user) {
      useAuthStore.getState().setUser({ ...user, name: name.trim() });
      toast.success("Perfil atualizado.");
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <header className="profile-card__identity">
          <div className="avatar avatar--large">{initials(user?.name ?? "")}</div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </header>
        <div className="profile-divider" />
        <form className="form-stack" onSubmit={save}>
          <Field label="Nome completo">
            <div className="input-with-icon">
              <UserRound size={16} />
              <Input value={name} required onChange={(event) => setName(event.target.value)} />
            </div>
          </Field>
          <Field label="E-mail" hint="O e-mail não pode ser alterado">
            <div className="input-with-icon input-with-icon--disabled">
              <Mail size={16} />
              <Input value={user?.email ?? ""} disabled />
            </div>
          </Field>
          <Button type="submit" className="profile-action">
            Salvar alterações
          </Button>
          <Button
            variant="outline"
            type="button"
            className="profile-action"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={17} className="danger-icon" />
            Sair da conta
          </Button>
        </form>
      </div>
      <div className="profile-brand">
        <Brand />
      </div>
    </div>
  );
}
