import { useState, useEffect } from "react";

export default function ModalDetalles({ obra, onClose, onObraActualizada }) {
  // Función para que el input type="date" lea la fecha de MySQL (YYYY-MM-DD)
  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return "";
    return new Date(fechaOriginal).toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    nombre: obra?.nombre || "",
    direccion: obra?.direccion || "",
    fecha_inicio: formatearFecha(obra?.fecha_inicio),
    fecha_fin_estimada: formatearFecha(obra?.fecha_fin_estimada),
    estado: obra?.estado || "Planificación",
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const respuesta = await fetch(
        `http://localhost:3000/obras/${obra.id_obra}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      if (!respuesta.ok) throw new Error("Error al actualizar la obra");

      onObraActualizada(); // Le avisa al Dashboard que recargue las obras
      onClose(); // Cierra el modal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
          }}
        >
          Detalles y Edición de Obra
        </h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre del Proyecto *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Dirección *</label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Estado de la Obra</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              style={styles.input}
            >
              <option value="Planificación">Planificación</option>
              <option value="En Ejecución">En Ejecución</option>
              <option value="Pausada">Pausada</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Fecha de Inicio</label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm({ ...form, fecha_inicio: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Fin Estimado</label>
              <input
                type="date"
                value={form.fecha_fin_estimada}
                onChange={(e) =>
                  setForm({ ...form, fecha_fin_estimada: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button type="button" onClick={onClose} style={styles.btnCancelar}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnGuardar}>
              Guardar Cambios
            </button>
          </div>
        </form>
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
    padding: "25px",
    borderRadius: "10px",
    width: "450px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.85rem", fontWeight: "bold", color: "#475569" },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  btnGuardar: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnCancelar: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  errorBox: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "5px",
    fontSize: "0.9rem",
  },
};
