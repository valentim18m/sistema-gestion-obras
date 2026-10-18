import { useState, useEffect } from "react"; // <-- 1. Importamos useEffect
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Registro from "./components/Registro";
import ModalInventario from "./components/ModalInventario";

// ==========================================
// COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // --- 2. EFECTO PARA MANTENER LA SESIÓN AL PRESIONAR F5 ---
  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    // Si encontramos tanto el token como los datos del usuario, iniciamos sesión automáticamente
    if (tokenGuardado && usuarioGuardado) {
      setUsuarioLogueado(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleLogout = () => {
    // 3. Limpiamos ambas cosas de la memoria al salir
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuarioLogueado(null);
    setMostrarRegistro(false);
  };

  return (
    <>
      {usuarioLogueado ? (
        <Dashboard usuario={usuarioLogueado} onLogout={handleLogout} />
      ) : mostrarRegistro ? (
        <Registro irALogin={() => setMostrarRegistro(false)} />
      ) : (
        <Login
          onLoginSuccess={(usuario) => setUsuarioLogueado(usuario)}
          irARegistro={() => setMostrarRegistro(true)}
        />
      )}
    </>
  );
}
