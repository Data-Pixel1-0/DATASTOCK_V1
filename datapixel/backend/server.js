const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los usuarios." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios." });
    }

    const [rows] = await db.query(
      "SELECT id, nombre, usuario FROM usuarios WHERE usuario = ? AND password = ? LIMIT 1",
      [usuario, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña inválidos." });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el proceso de inicio de sesión." });
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en puerto ${port}`);
});
