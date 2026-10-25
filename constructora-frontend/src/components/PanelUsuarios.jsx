import { useState, useEffect } from "react";

export default function PanelUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Obtenemos el token de la memoria para las peticiones
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch("http://localhost:3000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setCargando(false);
    }
  };
  // ... dentro de tu componente PanelUsuarios, debajo de la función cargarUsuarios ...

  const descargarReporte = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/reportes/auditoria",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (respuesta.ok) {
        // Magia para descargar el archivo en React
        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Auditoria_Constructora.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Error al descargar el reporte.");
      }
    } catch (error) {
      console.error("Error en la descarga:", error);
    }
  };

  // ... más abajo, en el return, agrega el botón justo debajo del párrafo ...

  const cambiarRol = async (idUsuario, nuevoRol) => {
    // Evitamos que un admin se quite el rol a sí mismo por accidente
    const confirmacion = window.confirm(
      `¿Estás seguro de cambiar el rol de este usuario?`,
    );
    if (!confirmacion) return;

    try {
      const respuesta = await fetch(
        `http://localhost:3000/usuarios/${idUsuario}/rol`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_rol: nuevoRol }),
        },
      );

      if (respuesta.ok) {
        // Recargamos la lista para ver los cambios reflejados
        cargarUsuarios();
      } else {
        alert("Hubo un error al actualizar los permisos.");
      }
    } catch (error) {
      console.error("Error cambiando rol:", error);
    }
  };

  if (cargando) return <p>Cargando lista de usuarios...</p>;

  return (
    <div className="panel-usuarios">
      <h2>Gestión de Accesos</h2>
      <p>Administra los niveles de permiso de tu equipo.</p>
      {/* NUEVO BOTÓN DE EXPORTACIÓN */}
      <button
        onClick={descargarReporte}
        style={{
          background: "#10b981",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        📥 Descargar Reporte de Auditoría (CSV)
      </button>
      <table
        style={{
          width: "100%",
          textAlign: "left",
          marginTop: "20px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr
              key={user.id_usuario}
              style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}
            >
              <td>{user.nombre_completo}</td>
              <td>{user.email}</td>
              <td>
                <span
                  style={{
                    fontWeight: "bold",
                    color: user.id_rol === 1 ? "blue" : "gray",
                  }}
                >
                  {user.id_rol === 1 ? "Administrador" : "Estándar"}
                </span>
              </td>
              <td>
                {/* Si es Admin, el botón ofrece pasarlo a Estándar, y viceversa */}
                {user.id_rol === 1 ? (
                  <button onClick={() => cambiarRol(user.id_usuario, 2)}>
                    Quitar Admin
                  </button>
                ) : (
                  <button onClick={() => cambiarRol(user.id_usuario, 1)}>
                    Hacer Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
