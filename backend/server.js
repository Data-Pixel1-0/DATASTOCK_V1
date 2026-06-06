const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

async function ensureUsuarioSchema() {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'usuarios'");
    if (tables.length === 0) {
      await db.query(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          usuario VARCHAR(50) UNIQUE NOT NULL,
          contrasena VARCHAR(255) NOT NULL,
          correo VARCHAR(100) UNIQUE,
          rol VARCHAR(30) DEFAULT 'usuario',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
  } catch (error) {
    console.error("Error al asegurar el esquema de usuarios:", error);
    process.exit(1);
  }
}

app.get("/api/status", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: true });
  } catch (error) {
    res.status(500).json({ status: "error", database: false, message: error.message });
  }
});

app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los productos." });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;

    // Validar campos obligatorios
    if (!nombre || !descripcion || !precio || stock === undefined) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar campos no vacíos
    if (nombre.trim() === "" || descripcion.trim() === "" || precio === "" || stock === "") {
      return res.status(400).json({ error: "Los campos no pueden estar vacíos." });
    }

    // Validar que precio y stock sean números válidos
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);

    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ error: "El precio debe ser un número válido y positivo." });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: "El stock debe ser un número válido y no negativo." });
    }

    // Insertar producto
    const [result] = await db.query(
      "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre.trim(), descripcion.trim(), precioNum, stockNum]
    );

    res.status(201).json({ 
      success: true, 
      message: "Producto creado exitosamente.",
      productId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto." });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;

    if (!nombre || !descripcion || !precio || stock === undefined) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (nombre.trim() === "" || descripcion.trim() === "" || precio === "" || stock === "") {
      return res.status(400).json({ error: "Los campos no pueden estar vacíos." });
    }

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);

    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ error: "El precio debe ser un número válido y positivo." });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: "El stock debe ser un número válido y no negativo." });
    }

    const [result] = await db.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre.trim(), descripcion.trim(), precioNum, stockNum, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json({ success: true, message: "Producto actualizado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto." });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json({ success: true, message: "Producto eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nombre, usuario, correo AS email, rol FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los usuarios." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validar campos obligatorios
    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
    }

    if (correo.trim() === "" || password.trim() === "") {
      return res.status(400).json({ error: "Los campos no pueden estar vacíos." });
    }

    const [rows] = await db.query(
      "SELECT id, nombre, usuario FROM usuarios WHERE correo = ? AND contrasena = ? LIMIT 1",
      [correo, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña inválidos." });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el proceso de inicio de sesión." });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { nombre, usuario, password, email } = req.body;

    // Validar todos los campos obligatorios
    if (!nombre || !usuario || !password || !email) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar campos no vacíos
    if (nombre.trim() === "" || usuario.trim() === "" || password.trim() === "" || email.trim() === "") {
      return res.status(400).json({ error: "Los campos no pueden estar vacíos." });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "El email no es válido." });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db.query(
      "SELECT id FROM usuarios WHERE usuario = ? OR correo = ?",
      [usuario, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "El usuario o email ya está registrado." });
    }

    // Crear nuevo usuario
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, usuario, contrasena, correo, rol) VALUES (?, ?, ?, ?, ?)",
      [nombre, usuario, password, email, "usuario"]
    );

    res.status(201).json({ 
      success: true, 
      message: "Usuario registrado exitosamente.",
      userId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error en el proceso de registro." });
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const port = process.env.PORT || 3000;

async function startServer() {
  await ensureUsuarioSchema();
  app.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
  });
}

startServer();
