import { useState } from "react";

export default function ModalObra({ onClose, onObraCreada }) {
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    fecha_inicio: "",
    fecha_fin_estimada: "",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const respuesta = await fetch("http://localhost:3000/obras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!respuesta.ok) throw new Error("Error al crear la obra");

      onObraCreada(); // Le avisa al Dashboard que recargue las tarjetas
      onClose(); // Cierra el modal automáticamente
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
          Describir Nueva Obra
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
              placeholder="Ej: Ampliación Escuela 12"
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
              placeholder="Ej: Av. San Martín 456"
            />
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
              Confirmar y Guardar
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
    backgroundColor: "#2563eb",
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
