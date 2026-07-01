# Setup Backend - Datapixel

## Instalación

### 1. Configurar Base de Datos

Ejecutar el script SQL en MySQL:
```bash
mysql -u root < backend/config/schema.sql
```

### 2. Configurar Variables de Entorno

Editar el archivo `.env` en la carpeta `backend/`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=datapixel
PORT=3000

# Correo para alertas
SMTP_HOST=smtp.tudominio.com
SMTP_PORT=587
SMTP_USER=alertas@tudominio.com
SMTP_PASS=tu_clave_smtp
SMTP_FROM=alertas@tudominio.com
SMTP_SECURE=false
```

### 3. Instalar Dependencias

```bash
cd backend
npm install
```

### 4. Iniciar Servidor

```bash
npm start       # Producción
npm run dev     # Desarrollo con nodemon
```

El servidor estará en: http://localhost:3000

## Endpoints

### Autenticación

- **POST** `/api/login` - Iniciar sesión
  - Body: `{ usuario, password }`

### Productos

- **GET** `/api/productos` - Listar productos
- **POST** `/api/productos` - Crear producto
  - Body: `{ nombre, descripcion, precio, stock }`

### Usuarios

- **GET** `/api/usuarios` - Listar usuarios

### Estado

- **GET** `/api/status` - Verificar conexión a BD

## Validaciones

- Campos no pueden estar vacíos
- Email debe tener formato válido
- Contraseña mínimo 6 caracteres
- Precio y stock deben ser números válidos
- Usuario y email únicos en la BD
