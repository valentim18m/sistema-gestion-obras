import { useState } from "react";

export default function Registro({ onRegistroExitoso, irALogin }) {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    try {
      const respuesta = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) throw new Error(datos.error);

      setMensaje("¡Registro exitoso! Ya puedes iniciar sesión.");
      setTimeout(() => irALogin(), 2000); // Redirige al login tras 2 segundos
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          name="nombre_completo"
          placeholder="Nombre Completo"
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
          style={{ padding: "8px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#2980b9",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Registrarse
        </button>
      </form>
      <button
        onClick={irALogin}
        style={{
          marginTop: "15px",
          background: "none",
          border: "none",
          color: "#3498db",
          cursor: "pointer",
        }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
