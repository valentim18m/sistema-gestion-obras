// 1. Importar las librerías necesarias
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const puerto = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro_123";

app.use(cors());
app.use(express.json());

// 2. Configurar conexión MySQL
const conexion = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "constructora_api",
  password: process.env.DB_PASSWORD || "GimnasioAtomPorton123!",
  database: process.env.DB_NAME || "db_constructora",
});

conexion.connect((error) => {
  if (error) return console.error("Error MySQL:", error.message);
  console.log("¡Conectado a db_constructora!");
});

// ==========================================
// FUNCIÓN AUXILIAR: BITÁCORA DE AUDITORÍA (VERSIÓN CORREGIDA)
// ==========================================
const registrarEnBitacora = (idUsuario, accion, detalles) => {
  if (!idUsuario) return;
  // Adaptamos los nombres a las columnas EXACTAS de tu tabla
  const query = `INSERT INTO bitacora_auditoria (id_usuario, accion, tabla_afectada, detalles_anteriores) VALUES (?, ?, ?, ?)`;
  // Pasamos 'obras' como tabla afectada por defecto
  conexion.query(query, [idUsuario, accion, "obras", detalles], (err) => {
    if (err) console.error("Error guardando en bitácora:", err);
  });
};

// 3. MIDDLEWARE DE SEGURIDAD
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ error: "Acceso denegado." });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err)
      return res.status(401).json({ error: "Token inválido o expirado." });
    req.usuario = usuario;
    next();
  });
};

// ==========================================
// RUTAS DE LA API
// ==========================================

app.get("/", (req, res) => res.send("Backend funcionando."));

// --- RUTA LOGIN ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Faltan datos" });

  const query = "SELECT * FROM usuarios WHERE email = ? AND activo = 1";
  conexion.query(query, [email], async (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error del servidor" });
    if (resultados.length === 0)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const usuario = resultados[0];
    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (passwordValida) {
      const token = jwt.sign(
        { id: usuario.id_usuario, rol: usuario.id_rol },
        JWT_SECRET,
        { expiresIn: "8h" },
      );
      res.json({
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre_completo,
          rol: usuario.id_rol,
        },
      });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  });
});

// --- RUTA REGISTRO ---
app.post("/registro", async (req, res) => {
  const { nombre_completo, email, password } = req.body;

  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query =
      "INSERT INTO usuarios (nombre_completo, email, password_hash, id_rol, activo) VALUES (?, ?, ?, 2, 1)";
    conexion.query(
      query,
      [nombre_completo, email, password_hash],
      (err, resultados) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res
              .status(400)
              .json({ error: "El email ya está registrado" });
          return res.status(500).json({ error: "Error interno del servidor" });
        }
        res.status(201).json({ mensaje: "Usuario registrado con éxito" });
      },
    );
  } catch (error) {
    res.status(500).json({ error: "Error procesando el registro" });
  }
});

// ==========================================
// RUTAS DE INVENTARIO Y MATERIALES
// ==========================================

app.get("/materiales", (req, res) => {
  const query = "SELECT id_material, nombre, unidad_medida FROM materiales";
  conexion.query(query, (err, resultados) => {
    if (err)
      return res.status(500).json({ error: "Error interno del servidor" });
    res.json(resultados);
  });
});

app.post("/obras/:id/inventario", (req, res) => {
  const id_obra = req.params.id;
  const { id_material, cantidad } = req.body;

  if (!id_material || cantidad === undefined) {
    return res
      .status(400)
      .json({ error: "El material y la cantidad son obligatorios" });
  }

  const query = `
    INSERT INTO inventario_obra (id_obra, id_material, cantidad_disponible) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE cantidad_disponible = cantidad_disponible + VALUES(cantidad_disponible)
  `;
  conexion.query(query, [id_obra, id_material, cantidad], (err, resultados) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error al actualizar el inventario" });
    res.status(200).json({ mensaje: "Inventario actualizado correctamente" });
  });
});

app.get("/obras/:id/inventario", (req, res) => {
  const id_obra = req.params.id;
  const query = `
    SELECT io.id_inventario, io.id_material, m.nombre, m.unidad_medida, io.cantidad_disponible 
    FROM inventario_obra io
    JOIN materiales m ON io.id_material = m.id_material
    WHERE io.id_obra = ?
  `;
  conexion.query(query, [id_obra], (err, resultados) => {
    if (err)
      return res.status(500).json({ error: "Error interno del servidor" });
    res.json(resultados);
  });
});

app.delete("/obras/:id_obra/inventario/:id_material", (req, res) => {
  const { id_obra, id_material } = req.params;
  const query =
    "DELETE FROM inventario_obra WHERE id_obra = ? AND id_material = ?";
  conexion.query(query, [id_obra, id_material], (err, resultados) => {
    if (err)
      return res.status(500).json({ error: "Error interno del servidor" });
    res.status(200).json({ mensaje: "Material eliminado con éxito" });
  });
});

// ==========================================
// RUTAS DE OBRAS
// ==========================================

app.get("/obras", verificarToken, (req, res) => {
  const query = "SELECT * FROM obras ORDER BY creado_en DESC";
  conexion.query(query, (err, resultados) => {
    if (err)
      return res.status(500).json({ error: "Error obteniendo las obras" });
    res.json(resultados);
  });
});

app.post("/obras", verificarToken, (req, res) => {
  const { nombre, direccion, fecha_inicio, fecha_fin_estimada } = req.body;

  if (!nombre || !direccion) {
    return res
      .status(400)
      .json({ error: "El nombre y la dirección son obligatorios" });
  }

  const query = `INSERT INTO obras (nombre, direccion, fecha_inicio, fecha_fin_estimada) VALUES (?, ?, ?, ?)`;
  conexion.query(
    query,
    [nombre, direccion, fecha_inicio, fecha_fin_estimada],
    (err, resultados) => {
      if (err)
        return res.status(500).json({ error: "Error al guardar la obra" });

      registrarEnBitacora(req.usuario.id, "CREAR", `Creó la obra: ${nombre}`);

      res.status(201).json({
        mensaje: "Obra creada con éxito",
        id_obra: resultados.insertId,
      });
    },
  );
});

app.put("/obras/:id", verificarToken, (req, res) => {
  const id_obra = req.params.id;
  const { nombre, direccion, fecha_inicio, fecha_fin_estimada, estado } =
    req.body;

  if (!nombre || !direccion)
    return res.status(400).json({ error: "Obligatorios incompletos" });

  const fechaInicioDB = fecha_inicio ? fecha_inicio : null;
  const fechaFinDB = fecha_fin_estimada ? fecha_fin_estimada : null;

  const query = `UPDATE obras SET nombre = ?, direccion = ?, fecha_inicio = ?, fecha_fin_estimada = ?, estado = ? WHERE id_obra = ?`;

  conexion.query(
    query,
    [nombre, direccion, fechaInicioDB, fechaFinDB, estado, id_obra],
    (err, resultados) => {
      if (err) return res.status(500).json({ error: "Error interno en la BD" });

      registrarEnBitacora(
        req.usuario.id,
        "EDITAR",
        `Actualizó la obra #${id_obra} al estado: ${estado}`,
      );

      res.status(200).json({ mensaje: "Obra actualizada correctamente" });
    },
  );
});

// ==========================================
// RUTAS DE GESTIÓN DE USUARIOS (PANEL ADMIN)
// ==========================================

app.get("/usuarios", verificarToken, (req, res) => {
  // Quitamos la columna 'creado_en' que causaba el error
  const query =
    "SELECT id_usuario, nombre_completo, email, id_rol, activo FROM usuarios";

  conexion.query(query, (err, resultados) => {
    if (err) {
      console.error("Error SQL al obtener usuarios:", err); // Mostrará el error en la terminal por si acaso
      return res.status(500).json({ error: "Error obteniendo usuarios" });
    }
    res.json(resultados);
  });
});
app.put("/usuarios/:id/rol", verificarToken, (req, res) => {
  const id_usuario_modificado = req.params.id;
  const { id_rol } = req.body;

  if (!id_rol)
    return res.status(400).json({ error: "El nuevo rol es obligatorio" });

  const query = "UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?";
  conexion.query(query, [id_rol, id_usuario_modificado], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error interno en la BD" });

    registrarEnBitacora(
      req.usuario.id,
      "CAMBIO ROL",
      `Actualizó los permisos del usuario #${id_usuario_modificado} al rol ${id_rol}`,
    );

    res.status(200).json({ mensaje: "Permisos actualizados correctamente" });
  });
});

// ==========================================
// 4. INICIAR EL SERVIDOR
// ==========================================
app.listen(puerto, () => console.log(`Servidor en http://localhost:${puerto}`));
