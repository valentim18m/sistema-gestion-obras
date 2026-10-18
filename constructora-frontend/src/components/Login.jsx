import { useState } from "react";

export default function Login({ onLoginSuccess, irARegistro }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const respuesta = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok)
        throw new Error(datos.error || "Error al iniciar sesión");

      localStorage.setItem("token", datos.token);
      onLoginSuccess(datos.usuario);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario)); // <-- ¡Agrega esta línea!
      onLogin(datos.usuario);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Constructora - Acceso</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@constructora.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.btnSubmit}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button type="button" onClick={irARegistro} style={styles.btnLink}>
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: { textAlign: "center", marginBottom: "25px", color: "#2c3e50" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" },
  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#4a4a4a",
    color: "white",
    fontSize: "1rem",
  },
  btnSubmit: {
    backgroundColor: "#2980b9",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "10px",
  },
  btnLink: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "0.9rem",
  },
  error: {
    color: "#e74c3c",
    backgroundColor: "#fadbd8",
    padding: "10px",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "0.9rem",
    marginBottom: "15px",
  },
};
