const express = require("express");
const cors = require("cors");
const net = require("net");
const tls = require("tls");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

async function tableExists(tableName) {
  const [tables] = await db.query(`SHOW TABLES LIKE ?`, [tableName]);
  return tables.length > 0;
}

async function getColumns(tableName) {
  const [columns] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set(columns.map((column) => column.Field));
}

async function addColumnIfMissing(tableName, columns, columnName, definition) {
  if (!columns.has(columnName)) {
    await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
    columns.add(columnName);
  }
}

function usuarioColumn(columns, modernName, legacyName) {
  if (columns.has(modernName)) return modernName;
  if (columns.has(legacyName)) return legacyName;
  return modernName;
}

function usuarioValueExpression(columns, modernName, legacyName) {
  const availableColumns = [modernName, legacyName]
    .filter((column) => columns.has(column))
    .map((column) => `\`${column}\``);

  if (availableColumns.length === 0) return `\`${modernName}\``;
  if (availableColumns.length === 1) return availableColumns[0];
  return `COALESCE(${availableColumns.join(", ")})`;
}

async function ensureUsuarioSchema() {
  if (!(await tableExists("usuarios"))) {
    await db.query(`
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        rol VARCHAR(30) DEFAULT 'empleado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  const columns = await getColumns("usuarios");
  await addColumnIfMissing("usuarios", columns, "rol", "VARCHAR(30) DEFAULT 'empleado'");
  await addColumnIfMissing("usuarios", columns, "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await addColumnIfMissing("usuarios", columns, "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
}

async function ensureProductoSchema() {
  if (!(await tableExists("productos"))) {
    await db.query(`
      CREATE TABLE productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        codigo VARCHAR(80) NULL,
        categoria VARCHAR(100) DEFAULT 'General',
        imagen TEXT NULL,
        stock_minimo INT NOT NULL DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  const columns = await getColumns("productos");
  await addColumnIfMissing("productos", columns, "codigo", "VARCHAR(80) NULL");
  await addColumnIfMissing("productos", columns, "categoria", "VARCHAR(100) DEFAULT 'General'");
  await addColumnIfMissing("productos", columns, "imagen", "TEXT NULL");
  await addColumnIfMissing("productos", columns, "stock_minimo", "INT NOT NULL DEFAULT 5");
  await addColumnIfMissing("productos", columns, "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await addColumnIfMissing("productos", columns, "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
}

async function ensureMovimientoSchema() {
  if (!(await tableExists("movimientos"))) {
    await db.query(`
      CREATE TABLE movimientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        tipo ENUM('entrada', 'salida') NOT NULL,
        cantidad INT NOT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        usuario_id INT NULL,
        usuario_nombre VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
  }

  const columns = await getColumns("movimientos");
  await addColumnIfMissing("movimientos", columns, "producto_id", "INT NOT NULL");
  await addColumnIfMissing("movimientos", columns, "tipo", "VARCHAR(20) NOT NULL DEFAULT 'entrada'");
  await addColumnIfMissing("movimientos", columns, "cantidad", "INT NOT NULL DEFAULT 1");
  await addColumnIfMissing("movimientos", columns, "fecha", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await addColumnIfMissing("movimientos", columns, "usuario_id", "INT NULL");
  await addColumnIfMissing("movimientos", columns, "usuario_nombre", "VARCHAR(100) NULL");
  await addColumnIfMissing("movimientos", columns, "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
}

async function resequenceProductos() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [productos] = await connection.query("SELECT id FROM productos ORDER BY id ASC FOR UPDATE");
    const mappings = productos
      .map((producto, index) => ({ oldId: Number(producto.id), newId: index + 1 }))
      .filter((mapping) => mapping.oldId !== mapping.newId);

    if (mappings.length > 0) {
      const maxId = Math.max(...productos.map((producto) => Number(producto.id) || 0));
      const tempOffset = maxId + productos.length + 1000;

      await connection.query("SET FOREIGN_KEY_CHECKS = 0");
      for (const { oldId } of mappings) {
        const tempId = oldId + tempOffset;
        await connection.query("UPDATE productos SET id = ? WHERE id = ?", [tempId, oldId]);
        await connection.query("UPDATE movimientos SET producto_id = ? WHERE producto_id = ?", [tempId, oldId]);
      }
      for (const { oldId, newId } of mappings) {
        const tempId = oldId + tempOffset;
        await connection.query("UPDATE productos SET id = ? WHERE id = ?", [newId, tempId]);
        await connection.query("UPDATE movimientos SET producto_id = ? WHERE producto_id = ?", [newId, tempId]);
      }
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    const nextId = productos.length + 1;
    await connection.query(`ALTER TABLE productos AUTO_INCREMENT = ${nextId}`);
    await connection.commit();
  } catch (error) {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function parsePositiveNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} debe ser un numero valido y no negativo.`);
  }
  return number;
}

function mapProductPayload(body) {
  const precio = parsePositiveNumber(body.precio, "El precio");
  const stock = parseInt(body.stock, 10);
  const stockMinimo = body.stock_minimo === undefined || body.stock_minimo === "" ? 5 : parseInt(body.stock_minimo, 10);

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("El stock debe ser un numero valido y no negativo.");
  }

  if (!Number.isFinite(stockMinimo) || stockMinimo < 0) {
    throw new Error("El stock minimo debe ser un numero valido y no negativo.");
  }

  return {
    nombre: String(body.nombre || "").trim(),
    descripcion: String(body.descripcion || "").trim(),
    precio,
    stock,
    codigo: String(body.codigo || "").trim() || null,
    categoria: String(body.categoria || "General").trim() || "General",
    imagen: String(body.imagen || "").trim() || null,
    stock_minimo: stockMinimo,
  };
}

function productStatus(producto) {
  const stock = Number(producto.stock) || 0;
  const minimum = Number(producto.stock_minimo) || 0;
  if (stock <= 0) return "Agotado";
  if (stock <= minimum) return "Bajo stock";
  return "Disponible";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeEmailAddress(value) {
  return String(value || "").trim();
}

function buildAlertEmail({ user, alertas }) {
  const rows = alertas
    .map(
      (alerta) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #d8e8f7;color:#082758;font-weight:700;">${escapeHtml(alerta.mensaje)}</td>
          <td style="padding:12px;border-bottom:1px solid #d8e8f7;color:${alerta.severidad === "danger" ? "#be123c" : "#b45309"};font-weight:700;">${alerta.severidad === "danger" ? "Critica" : "Advertencia"}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7fbff;padding:28px;color:#082758;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d8e8f7;border-radius:18px;overflow:hidden;">
        <div style="background:#082758;padding:24px;color:#ffffff;">
          <div style="font-size:20px;font-weight:800;letter-spacing:4px;text-transform:uppercase;">Data Stock</div>
          <div style="margin-top:8px;color:#dbeafe;">Alertas de inventario</div>
        </div>
        <div style="padding:24px;">
          <h1 style="margin:0 0 10px;font-size:24px;color:#082758;">Hola ${escapeHtml(user.nombre || user.usuario || "equipo")}</h1>
          <p style="margin:0 0 20px;color:#475569;line-height:1.6;">Estos productos requieren revision para compras o reposicion.</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #d8e8f7;border-radius:12px;overflow:hidden;">
            <thead>
              <tr>
                <th style="padding:12px;background:#eef6ff;color:#082758;text-align:left;">Alerta</th>
                <th style="padding:12px;background:#eef6ff;color:#082758;text-align:left;">Nivel</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin:22px 0 0;color:#64748b;font-size:13px;">Correo generado automaticamente por Data Stock.</p>
        </div>
      </div>
    </div>`;

  const text = [
    `Data Stock - Alertas de inventario`,
    `Usuario: ${user.nombre || user.usuario || "equipo"}`,
    "",
    ...alertas.map((alerta) => `- ${alerta.mensaje} (${alerta.severidad === "danger" ? "Critica" : "Advertencia"})`),
  ].join("\n");

  return { html, text };
}

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  };
}

function smtpEncodeData(message) {
  return message.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function createSmtpClient(config) {
  let socket;
  let buffer = "";

  const connect = () =>
    new Promise((resolve, reject) => {
      const options = { host: config.host, port: config.port };
      socket = config.secure ? tls.connect(options, resolve) : net.connect(options, resolve);
      socket.setEncoding("utf8");
      socket.on("data", (chunk) => {
        buffer += chunk;
      });
      socket.on("error", reject);
    });

  const read = () =>
    new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const lastLine = lines[lines.length - 1] || "";
        if (/^\d{3}\s/.test(lastLine)) {
          const response = buffer;
          buffer = "";
          clearInterval(timer);
          resolve(response);
        } else if (Date.now() - startedAt > 12000) {
          clearInterval(timer);
          reject(new Error("Tiempo de espera agotado con el servidor SMTP."));
        }
      }, 25);
    });

  const command = async (line, expectedCodes = ["250"]) => {
    socket.write(`${line}\r\n`);
    const response = await read();
    if (!expectedCodes.some((code) => response.startsWith(code))) {
      throw new Error(`SMTP rechazo el comando ${line.split(" ")[0]}: ${response.trim()}`);
    }
    return response;
  };

  const startTls = async () => {
    await command("STARTTLS", ["220"]);
    socket = tls.connect({ socket, servername: config.host });
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      buffer += chunk;
    });
  };

  const end = () => {
    if (socket) socket.end();
  };

  return { connect, read, command, startTls, end };
}

async function sendMail({ to, subject, text, html }) {
  const config = getSmtpConfig();
  if (!config.host || !config.from) {
    throw new Error("Configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM en backend/.env.");
  }

  const recipient = normalizeEmailAddress(to);
  const sender = normalizeEmailAddress(config.from);
  if (!recipient || !recipient.includes("@")) {
    throw new Error("El usuario no tiene un correo valido registrado.");
  }

  const client = createSmtpClient(config);
  const boundary = `datastock-${Date.now()}`;
  const message = [
    `From: Data Stock <${sender}>`,
    `To: ${recipient}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  try {
    await client.connect();
    await client.read();
    await client.command(`EHLO ${process.env.SMTP_HELO || "datastock.local"}`);
    if (!config.secure && process.env.SMTP_STARTTLS !== "false") {
      await client.startTls();
      await client.command(`EHLO ${process.env.SMTP_HELO || "datastock.local"}`);
    }
    if (config.user && config.pass) {
      await client.command("AUTH LOGIN", ["334"]);
      await client.command(Buffer.from(config.user).toString("base64"), ["334"]);
      await client.command(Buffer.from(config.pass).toString("base64"), ["235"]);
    }
    await client.command(`MAIL FROM:<${sender}>`);
    await client.command(`RCPT TO:<${recipient}>`, ["250", "251"]);
    await client.command("DATA", ["354"]);
    await client.command(`${smtpEncodeData(message)}\r\n.`, ["250"]);
    await client.command("QUIT", ["221"]);
  } finally {
    client.end();
  }
}

async function getDashboardData() {
  const [productos] = await db.query("SELECT * FROM productos ORDER BY id ASC");
  const [movimientos] = await db.query(`
    SELECT m.id, m.tipo, m.cantidad, m.fecha, m.usuario_nombre, p.nombre AS producto
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    ORDER BY m.fecha DESC, m.id DESC
    LIMIT 12
  `);
  const [movimientosPorFecha] = await db.query(`
    SELECT DATE(fecha) AS fecha,
      SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) AS entradas,
      SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) AS salidas
    FROM movimientos
    GROUP BY DATE(fecha)
    ORDER BY DATE(fecha) DESC
    LIMIT 7
  `);
  const [mayorMovimiento] = await db.query(`
    SELECT p.nombre, SUM(m.cantidad) AS total
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    GROUP BY p.id, p.nombre
    ORDER BY total DESC
    LIMIT 6
  `);
  const [porCategoria] = await db.query(`
    SELECT COALESCE(NULLIF(categoria, ''), 'General') AS categoria, COUNT(*) AS productos, SUM(stock) AS stock
    FROM productos
    GROUP BY COALESCE(NULLIF(categoria, ''), 'General')
    ORDER BY productos DESC
  `);

  const normalized = productos.map((producto) => ({
    ...producto,
    precio: Number(producto.precio) || 0,
    stock: Number(producto.stock) || 0,
    stock_minimo: Number(producto.stock_minimo) || 0,
    estado: productStatus(producto),
  }));

  const totalProductos = normalized.length;
  const valorInventario = normalized.reduce((sum, producto) => sum + producto.precio * producto.stock, 0);
  const stockBajo = normalized.filter((producto) => producto.stock > 0 && producto.stock <= producto.stock_minimo);
  const agotados = normalized.filter((producto) => producto.stock <= 0);
  const alertas = [
    ...stockBajo.map((producto) => ({
      tipo: "stock_bajo",
      mensaje: `El producto ${producto.nombre} tiene poco stock`,
      producto_id: producto.id,
      severidad: "warning",
    })),
    ...agotados.map((producto) => ({
      tipo: "agotado",
      mensaje: `El producto ${producto.nombre} esta agotado`,
      producto_id: producto.id,
      severidad: "danger",
    })),
  ].slice(0, 8);

  return {
    stats: {
      totalProductos,
      valorInventario,
      stockBajo: stockBajo.length,
      movimientosRecientes: movimientos.length,
      agotados: agotados.length,
    },
    alertas,
    movimientos,
    charts: {
      movimientosPorFecha: movimientosPorFecha.reverse(),
      mayorMovimiento,
      porCategoria,
    },
  };
}

app.get("/api/status", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: true });
  } catch (error) {
    res.status(500).json({ status: "error", database: false, message: error.message });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    res.json(await getDashboardData());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo cargar el dashboard." });
  }
});

app.post("/api/alertas/email", async (req, res) => {
  try {
    const usuarioId = parseInt(req.body.usuario_id, 10);
    if (!usuarioId) {
      return res.status(400).json({ error: "Usuario requerido para enviar alertas." });
    }

    const columns = await getColumns("usuarios");
    const emailExpression = usuarioValueExpression(columns, "email", "correo");
    const [users] = await db.query(
      `SELECT id, nombre, usuario, ${emailExpression} AS email
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [usuarioId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const dashboard = await getDashboardData();
    const alertas = dashboard.alertas || [];
    if (alertas.length === 0) {
      return res.json({ success: true, message: "No hay alertas para enviar." });
    }

    const email = buildAlertEmail({ user: users[0], alertas });
    await sendMail({
      to: users[0].email,
      subject: `Data Stock - ${alertas.length} alerta${alertas.length === 1 ? "" : "s"} de inventario`,
      ...email,
    });

    res.json({ success: true, message: "Alertas enviadas al correo registrado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "No se pudieron enviar las alertas por correo." });
  }
});

app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos ORDER BY id ASC");
    res.json(rows.map((producto) => ({ ...producto, estado: productStatus(producto) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los productos." });
  }
});

app.get("/api/productos/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos WHERE id = ? LIMIT 1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const [historial] = await db.query(`
      SELECT m.id, m.tipo, m.cantidad, m.fecha, m.usuario_nombre AS usuario
      FROM movimientos m
      WHERE m.producto_id = ?
      ORDER BY m.fecha DESC, m.id DESC
      LIMIT 20
    `, [req.params.id]);

    res.json({ producto: { ...rows[0], estado: productStatus(rows[0]) }, historial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo cargar el detalle del producto." });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    const producto = mapProductPayload(req.body);
    if (!producto.nombre || !producto.descripcion) {
      return res.status(400).json({ error: "Nombre y descripcion son obligatorios." });
    }

    const [result] = await db.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, codigo, categoria, imagen, stock_minimo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.codigo,
        producto.categoria,
        producto.imagen,
        producto.stock_minimo,
      ]
    );

    res.status(201).json({ success: true, message: "Producto creado exitosamente.", productId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error al crear el producto." });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const producto = mapProductPayload(req.body);
    if (!producto.nombre || !producto.descripcion) {
      return res.status(400).json({ error: "Nombre y descripcion son obligatorios." });
    }

    const [result] = await db.query(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, precio = ?, stock = ?, codigo = ?, categoria = ?, imagen = ?, stock_minimo = ?
       WHERE id = ?`,
      [
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.codigo,
        producto.categoria,
        producto.imagen,
        producto.stock_minimo,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json({ success: true, message: "Producto actualizado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error al actualizar el producto." });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    await resequenceProductos();
    res.json({ success: true, message: "Producto eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
});

app.get("/api/movimientos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, p.nombre AS producto, p.id AS producto_id, m.tipo, m.cantidad, m.fecha, m.usuario_nombre AS usuario
      FROM movimientos m
      JOIN productos p ON p.id = m.producto_id
      ORDER BY m.fecha DESC, m.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los movimientos." });
  }
});

app.post("/api/movimientos", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const productoId = parseInt(req.body.producto_id, 10);
    const cantidad = parseInt(req.body.cantidad, 10);
    const tipo = String(req.body.tipo || "").toLowerCase();
    const usuarioId = req.body.usuario_id ? parseInt(req.body.usuario_id, 10) : null;
    const usuarioNombre = String(req.body.usuario_nombre || "Sistema").trim();
    const fecha = req.body.fecha || new Date();

    if (!productoId || !["entrada", "salida"].includes(tipo) || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: "Producto, tipo y cantidad valida son obligatorios." });
    }

    await connection.beginTransaction();
    const [productos] = await connection.query("SELECT id, stock FROM productos WHERE id = ? FOR UPDATE", [productoId]);
    if (productos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const stockActual = Number(productos[0].stock) || 0;
    const nuevoStock = tipo === "entrada" ? stockActual + cantidad : stockActual - cantidad;
    if (nuevoStock < 0) {
      await connection.rollback();
      return res.status(400).json({ error: "No hay stock suficiente para registrar la salida." });
    }

    await connection.query("UPDATE productos SET stock = ? WHERE id = ?", [nuevoStock, productoId]);
    await connection.query(
      `INSERT INTO movimientos (producto_id, tipo, cantidad, fecha, usuario_id, usuario_nombre)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productoId, tipo, cantidad, fecha, usuarioId, usuarioNombre]
    );
    await connection.commit();

    res.status(201).json({ success: true, message: "Movimiento registrado correctamente.", stock: nuevoStock });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "No se pudo registrar el movimiento." });
  } finally {
    connection.release();
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const columns = await getColumns("usuarios");
    const emailExpression = usuarioValueExpression(columns, "email", "correo");
    const rolExpression = columns.has("rol") ? "`rol`" : "'empleado'";
    const [rows] = await db.query(`SELECT id, nombre, usuario, ${emailExpression} AS email, ${rolExpression} AS rol FROM usuarios`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los usuarios." });
  }
});

app.get("/api/usuarios/:id", async (req, res) => {
  try {
    const columns = await getColumns("usuarios");
    const emailExpression = usuarioValueExpression(columns, "email", "correo");
    const rolExpression = columns.has("rol") ? "`rol`" : "'empleado'";
    const [rows] = await db.query(
      `SELECT id, nombre, usuario, ${emailExpression} AS email, ${rolExpression} AS rol
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo cargar el usuario." });
  }
});

app.put("/api/usuarios/password", async (req, res) => {
  try {
    const { usuario_id, currentPassword, newPassword } = req.body;
    if (!usuario_id || !currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Datos invalidos. La nueva contrasena debe tener al menos 6 caracteres." });
    }

    const columns = await getColumns("usuarios");
    const passwordColumn = usuarioColumn(columns, "password", "contrasena");
    const [rows] = await db.query(`SELECT id FROM usuarios WHERE id = ? AND TRIM(\`${passwordColumn}\`) = TRIM(?)`, [
      usuario_id,
      currentPassword,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "La contrasena actual no coincide." });
    }

    await db.query(`UPDATE usuarios SET \`${passwordColumn}\` = ? WHERE id = ?`, [newPassword, usuario_id]);
    res.json({ success: true, message: "Contrasena actualizada correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar la contrasena." });
  }
});

app.put("/api/usuarios/:id/rol", async (req, res) => {
  try {
    const allowedRoles = ["administrador", "empleado", "consulta"];
    const rol = String(req.body.rol || "").toLowerCase();

    if (!allowedRoles.includes(rol)) {
      return res.status(400).json({ error: "Rol invalido." });
    }

    const [result] = await db.query("UPDATE usuarios SET rol = ? WHERE id = ?", [rol, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ success: true, message: "Rol actualizado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar el rol." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password || correo.trim() === "" || password.trim() === "") {
      return res.status(400).json({ error: "Correo y contrasena son obligatorios." });
    }

    const columns = await getColumns("usuarios");
    const emailExpression = usuarioValueExpression(columns, "email", "correo");
    const passwordExpression = usuarioValueExpression(columns, "password", "contrasena");
    const rolExpression = columns.has("rol") ? "`rol`" : "'empleado'";

    const [rows] = await db.query(
      `SELECT id, nombre, usuario, ${emailExpression} AS email, ${rolExpression} AS rol
       FROM usuarios
       WHERE (
           LOWER(TRIM(${emailExpression})) = LOWER(TRIM(?))
           OR LOWER(TRIM(usuario)) = LOWER(TRIM(?))
         )
         AND TRIM(${passwordExpression}) = TRIM(?)
       LIMIT 1`,
      [correo, correo, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Correo o contrasena invalidos." });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el proceso de inicio de sesion." });
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
  await ensureProductoSchema();
  await ensureMovimientoSchema();
  app.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
  });
}

startServer();
