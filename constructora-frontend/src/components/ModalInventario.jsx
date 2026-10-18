import { useState, useEffect } from "react";

export default function ModalInventario({ obra, onClose }) {
  const [inventario, setInventario] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [form, setForm] = useState({ id_material: "", cantidad: "" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!obra || !obra.id_obra) {
      setError("No se recibió una obra válida.");
      setCargando(false);
      return;
    }
    cargarDatos();
  }, [obra]);

  const cargarDatos = async () => {
    const token = localStorage.getItem("token");
    try {
      const respInventario = await fetch(
        `http://localhost:3000/obras/${obra.id_obra}/inventario`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const respCatalogo = await fetch(`http://localhost:3000/materiales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!respInventario.ok) throw new Error("Error al cargar el inventario");
      if (!respCatalogo.ok) throw new Error("Error al cargar el catálogo");

      const datosInventario = await respInventario.json();
      const datosCatalogo = await respCatalogo.json();

      setInventario(Array.isArray(datosInventario) ? datosInventario : []);
      setCatalogo(Array.isArray(datosCatalogo) ? datosCatalogo : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_material || !form.cantidad) return;

    const token = localStorage.getItem("token");
    try {
      const respuesta = await fetch(
        `http://localhost:3000/obras/${obra.id_obra}/inventario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_material: parseInt(form.id_material),
            cantidad: parseFloat(form.cantidad),
          }),
        },
      );

      if (!respuesta.ok) throw new Error("Error al agregar el material");

      setForm({ id_material: "", cantidad: "" });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  const eliminarMaterial = async (id_material) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas quitar este material de la obra?",
      )
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const respuesta = await fetch(
        `http://localhost:3000/obras/${obra.id_obra}/inventario/${id_material}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!respuesta.ok) throw new Error("Error al eliminar el material");

      cargarDatos(); // Recargar la tabla automáticamente
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Inventario: {obra?.nombre || "Obra"}</h2>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formContainer}>
          <select
            value={form.id_material}
            onChange={(e) => setForm({ ...form, id_material: e.target.value })}
            style={styles.input}
            required
          >
            <option value="">Seleccionar Material...</option>
            {catalogo.map((mat) => (
              <option key={mat.id_material} value={mat.id_material}>
                {mat.nombre} ({mat.unidad_medida})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cant."
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            style={{ ...styles.input, width: "80px" }}
            min="0.1"
            step="0.1"
            required
          />

          <button type="submit" style={styles.btnAgregar}>
            Añadir
          </button>
        </form>

        {cargando ? (
          <p>Cargando materiales...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Unidad</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length > 0 ? (
                  inventario.map((item) => (
                    // Importante: usamos item.id_material extraído del JOIN en el backend
                    <tr key={item.id_inventario}>
                      <td style={styles.td}>{item.nombre}</td>
                      <td style={styles.td}>{item.cantidad_disponible}</td>
                      <td style={styles.td}>{item.unidad_medida}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button
                          onClick={() => eliminarMaterial(item.id_material)}
                          style={styles.btnEliminar}
                          title="Quitar de la obra"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "15px" }}
                    >
                      Sin materiales registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={onClose} style={styles.btnCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "500px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  formContainer: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    flex: 1,
  },
  btnAgregar: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tableContainer: {
    overflowY: "auto",
    maxHeight: "300px",
    border: "1px solid #e2e8f0",
    borderRadius: "5px",
  },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "#f8fafc",
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
  },
  td: { padding: "10px", borderBottom: "1px solid #e2e8f0" },
  errorBox: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  btnCerrar: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#34495e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  btnEliminar: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "transform 0.2s",
  },
};
