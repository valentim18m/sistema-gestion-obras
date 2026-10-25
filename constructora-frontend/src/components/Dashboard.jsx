import { useState, useEffect } from "react";
import ModalInventario from "./ModalInventario";
import ModalObra from "./ModalObra";
import ModalDetalles from "./ModalDetalles";
import PanelUsuarios from "./PanelUsuarios";

// --- ESTILOS INTEGRADOS (Actualizados con Buscador y Filtros) ---
const styles = `
.dashboard-container { min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }
.topbar { background-color: #ffffff; padding: 1.2rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.menu-navegacion { display: flex; gap: 15px; align-items: center; }
.btn-logout { background-color: #fef2f2; color: #ef4444; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.content { padding: 40px 20px; max-width: 1100px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.stats-container { display: flex; gap: 20px; margin-bottom: 40px; flex-wrap: wrap; }
.stat-card { background-color: #ffffff; padding: 20px; border-radius: 12px; border-left: 4px solid; flex: 1; min-width: 200px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-label { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0; }
.grid-obras { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.card-obra { background-color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
.badge { background-color: #f0f9ff; color: #0369a1; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; align-self: flex-start; text-transform: uppercase; }
.btn-primary { background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { background-color: #f1f5f9; color: #1e293b; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: background 0.2s;}
.btn-secondary:hover { background-color: #e2e8f0; }
.btn-outline { background-color: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
/* Nuevos estilos para filtros */
.filtros-container { display: flex; gap: 15px; margin-bottom: 30px; align-items: center; flex-wrap: wrap; background: #fff; padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0;}
.search-input { flex: 1; min-width: 250px; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: #2563eb; }
.btn-filter { background: transparent; border: 1px solid #cbd5e1; color: #64748b; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.btn-filter.active { background: #2563eb; color: white; border-color: #2563eb; }
`;

export default function Dashboard({ usuario, onLogout }) {
  const [vistaActiva, setVistaActiva] = useState("obras");
  const [obras, setObras] = useState([]);

  // --- NUEVOS ESTADOS PARA BÚSQUEDA Y FILTROS ---
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [obraInventario, setObraInventario] = useState(null);
  const [obraDetalle, setObraDetalle] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const datosUsuario = JSON.parse(atob(payloadBase64));
        setRolUsuario(datosUsuario.rol);
      } catch (error) {
        console.error("Error al leer el token:", error);
      }
    }
    cargarObras();
  }, []);

  const cargarObras = async () => {
    const token = localStorage.getItem("token");
    try {
      const respuesta = await fetch("http://localhost:3000/obras", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.status === 401 || respuesta.status === 403) {
        alert(
          "Tu sesión ha expirado por seguridad. Por favor, vuelve a ingresar.",
        );
        onLogout();
        return;
      }

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setObras(datos);
      }
    } catch (error) {
      console.warn("Error cargando obras:", error);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const obrasFiltradas = obras.filter((obra) => {
    // 1. Verificamos si el texto buscado coincide con el nombre o la dirección
    const textoBuscado = busqueda.toLowerCase();
    const coincideBusqueda =
      obra.nombre.toLowerCase().includes(textoBuscado) ||
      obra.direccion.toLowerCase().includes(textoBuscado);

    // 2. Verificamos si el estado coincide con el filtro seleccionado
    // Manejamos el caso especial donde el estado es null o vacío (asumimos "Planificación")
    const estadoObra = obra.estado || "Planificación";
    const coincideEstado =
      filtroEstado === "Todos" || estadoObra === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      <header className="topbar">
        <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#1e293b" }}>
          🚧 ConstructoraApp
        </h2>

        <div className="menu-navegacion">
          <button
            onClick={() => setVistaActiva("obras")}
            className="btn-secondary"
          >
            Ver Obras
          </button>

          {rolUsuario === 1 && (
            <button
              onClick={() => setVistaActiva("usuarios")}
              className="btn-secondary"
            >
              Gestionar Usuarios
            </button>
          )}

          <button onClick={onLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="content">
        {vistaActiva === "obras" ? (
          <>
            <div className="stats-container">
              <div className="stat-card" style={{ borderLeftColor: "#3b82f6" }}>
                <div className="stat-label">Total Proyectos</div>
                <p className="stat-value">{obras.length}</p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#ef4444" }}>
                <div className="stat-label">Pausadas</div>
                <p className="stat-value">
                  {obras.filter((o) => o.estado === "Pausada").length}
                </p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#f59e0b" }}>
                <div className="stat-label">En Planificación</div>
                <p className="stat-value">
                  {
                    obras.filter(
                      (o) => o.estado === "Planificación" || !o.estado,
                    ).length
                  }
                </p>
              </div>
              <div className="stat-card" style={{ borderLeftColor: "#10b981" }}>
                <div className="stat-label">En Ejecución</div>
                <p className="stat-value">
                  {obras.filter((o) => o.estado === "En Ejecución").length}
                </p>
              </div>
            </div>

            <div className="header-section">
              <h1 style={{ color: "#0f172a", fontSize: "1.85rem", margin: 0 }}>
                Tus Obras
              </h1>
              {rolUsuario === 1 && (
                <button
                  onClick={() => setMostrarModal(true)}
                  className="btn-primary"
                >
                  + Nueva Obra
                </button>
              )}
            </div>

            {/* --- BARRA DE BÚSQUEDA Y BOTONES DE FILTRO --- */}
            <div className="filtros-container">
              <input
                type="text"
                placeholder="Buscar por nombre o dirección..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  "Todos",
                  "Planificación",
                  "En Ejecución",
                  "Pausada",
                  "Finalizada",
                ].map((estado) => (
                  <button
                    key={estado}
                    className={`btn-filter ${filtroEstado === estado ? "active" : ""}`}
                    onClick={() => setFiltroEstado(estado)}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-obras">
              {/* Cambiamos obras.map por obrasFiltradas.map */}
              {obrasFiltradas.length > 0 ? (
                obrasFiltradas.map((obra) => (
                  <div key={obra.id_obra} className="card-obra">
                    <div className="badge">
                      {obra.estado || "Planificación"}
                    </div>
                    <h3 style={{ margin: "10px 0 5px 0", color: "#1e293b" }}>
                      {obra.nombre}
                    </h3>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        marginBottom: "20px",
                      }}
                    >
                      📍 {obra.direccion}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "auto",
                      }}
                    >
                      <button
                        onClick={() => setObraDetalle(obra)}
                        className="btn-secondary"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => setObraInventario(obra)}
                        className="btn-outline"
                      >
                        Inventario
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#64748b",
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  No se encontraron obras que coincidan con la búsqueda.
                </p>
              )}
            </div>

            {mostrarModal && (
              <ModalObra
                onClose={() => setMostrarModal(false)}
                onObraCreada={cargarObras}
              />
            )}
            {obraInventario && (
              <ModalInventario
                obra={obraInventario}
                onClose={() => setObraInventario(null)}
              />
            )}
            {obraDetalle && (
              <ModalDetalles
                obra={obraDetalle}
                onClose={() => setObraDetalle(null)}
                onObraActualizada={cargarObras}
              />
            )}
          </>
        ) : (
          <PanelUsuarios />
        )}
      </main>
    </div>
  );
}
