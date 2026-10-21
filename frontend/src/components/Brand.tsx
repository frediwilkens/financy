import logo from "../assets/logo.svg";
import logoIcon from "../assets/logo-icon.svg";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={compact ? "brand brand--compact" : "brand"}
      src={compact ? logoIcon : logo}
      alt="Financy"
    />
  );
}
