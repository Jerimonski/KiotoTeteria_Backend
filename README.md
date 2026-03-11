# 🍵 Kioto Tetería Backend

## 📌 Descripción General

Backend desarrollado con **NestJS** para la gestión integral de una tetería. Provee una API robusta y escalable para el manejo de catálogo, ventas y administración.

- **Catálogo de productos:** Gestión de stock, precios y visibilidad.
- **Gestión de categorías:** Organización lógica de los tipos de té.
- **Procesamiento de pedidos:** Registro de compras y flujo de estados.
- **Suscripciones a newsletter:** Captación de correos para marketing.
- **Panel administrativo:** Acceso protegido mediante autenticación basada en **JWT** y roles.

---

## 📊 Modelo de Base de Datos

Estructura relacional diseñada en **PostgreSQL** y gestionada con **Prisma ORM**.



<img width="1261" height="585" alt="image" src="https://github.com/user-attachments/assets/0f389384-3823-499d-9428-7bccf5647748" />


---

## 🔍 Calidad de Código (SonarQube)

Para garantizar un código limpio, mantenible y libre de vulnerabilidades, el proyecto integra **SonarQube**. Se realizan análisis estáticos constantes para evaluar:
- **Bugs y Vulnerabilidades:** Identificación de posibles fallos de seguridad o lógica.
- **Code Smells:** Detección de código confuso o difícil de mantener.
- **Coverage:** Medición de la cobertura de pruebas unitarias.
- **Duplicaciones:** Control de código redundante.

<img width="1037" height="593" alt="image" src="https://github.com/user-attachments/assets/99b00902-6fd2-40a1-af65-c812b98fba77" />


---

## 🏗 Arquitectura Modular

El proyecto sigue una arquitectura modular basada en dominios para asegurar un código limpio y fácil de mantener.

- **Modules:** Organización por dominio (Auth, Products, Categories, Orders, Newsletter).
- **Controllers:** Capa de entrada que maneja las peticiones HTTP y define los endpoints.
- **Services:** Contienen la lógica de negocio y el procesamiento de los datos.
- **Prisma (Models):** Esquema relacional y acceso a base de datos PostgreSQL.
- **Guards:** Control de acceso y protección de rutas mediante roles y JWT.

---

## 🧠 Stack Tecnológico

- Node.js & NestJS 11
- TypeScript
- PostgreSQL & Prisma ORM
- JWT (Passport.js) & bcrypt
- class-validator & class-transformer
- SonarQube (Análisis de calidad de código)

---

## 🔐 Autenticación (Auth)

### POST /auth/login
Valida las credenciales del administrador y genera un token de acceso.

**Body:**
```
{
  "email": "admin@kiototeteria.cl",
  "password": "password123"
}
```
---

## 📂 Categorías (Categories)

### GET /categories
Obtiene todas las categorías disponibles.
**Ejemplo:** `GET http://localhost:3000/categories`

### GET /categories/:identifier
Busca por ID o Slug.
**Ejemplo:** `GET http://localhost:3000/categories/te-verde` o `GET http://localhost:3000/categories/1`

### POST /categories (Protegido - ADMIN)
Crea una nueva categoría.

**Body:** 
```
{
"name": "Té Blanco"
}
```

### PATCH /categories/:id (Protegido - ADMIN)
Actualiza el nombre de una categoría.
**Ejemplo:** `PATCH http://localhost:3000/categories/1`
<br>
**Body:** 
```
{
  "name": "Té Blanco Premium"
}
```

### DELETE /categories/:id (Protegido - ADMIN)
Elimina una categoría del sistema.
**Ejemplo:** `DELETE http://localhost:3000/categories/1`

---

## 📦 Productos (Products)

### GET /products
Lista productos con paginación.
**Ejemplo:** `GET http://localhost:3000/products?page=1&pageSize=5`

### GET /products/:id
Detalle de un producto por ID.
**Ejemplo:** `GET http://localhost:3000/products/12`

### GET /products/category/:categoryId
Productos de una categoría específica.
**Ejemplo:** `GET http://localhost:3000/products/category/2`

### POST /products (Protegido - ADMIN)
Crea un nuevo producto.

**Body:**
```
{ 
  "name": "Té Oolong", 
  "description": "Té semi-oxidado", 
  "price": 18.50, 
  "categoryId": 1 
}
```

### PATCH /products/:id/status (Protegido - ADMIN)
Cambia la visibilidad del producto (isActive).
**Ejemplo:** `PATCH http://localhost:3000/products/5/status`

**Body:** 
```
{
  "isActive": true
}
```

### DELETE /products/:id (Protegido - ADMIN)
Elimina un producto del catálogo.
**Ejemplo:** `DELETE http://localhost:3000/products/5`

---

## 🛒 Pedidos (Orders)

### GET /orders (Protegido - ADMIN)
Lista de pedidos con filtros opcionales.
**Ejemplo:** `GET http://localhost:3000/orders?status=PAID&customerEmail=user@mail.com`

### GET /orders/:id
Busca una orden específica.
**Ejemplo:** `GET http://localhost:3000/orders/101`

### POST /orders
Registra una nueva compra (Checkout).

**Body:**
```
{
  "customerEmail": "cliente@mail.com",
  "items": [ { "productId": 1, "quantity": 3 } ]
}
```

### PATCH /orders/:id/status (Protegido - ADMIN)
Cambia el estado de la orden (PENDING, PAID, CANCELLED).
**Ejemplo:** `PATCH http://localhost:3000/orders/101/status`

**Body:** 
```
{
  "status": "PAID"
}
```

---

## 📧 Newsletter

### POST /newsletter/subscribe
Suscribe un correo a la lista.

**Body:** 
```
{
"email": "interesado@mail.com"
}
```
---

## 🗂 Estructura del Proyecto
```
src/
├── main.ts                 # Punto de entrada
├── app.module.ts           # Módulo raíz
├── common/                 # DTOs y paginación
├── guards/                 # Seguridad (JWT/Roles)
├── modules/
│   ├── auth/               # Seguridad y JWT
│   ├── categories/         # CRUD de categorías
│   ├── newsletter/         # Suscriptores
│   ├── orders/             # Transacciones y pedidos
│   └── products/           # Catálogo de productos
└── prisma/                 # Schema y cliente Prisma
```
---

## 🚀 Scripts

Instalación:
```
pnpm install
```

Base de datos:
```
pnpm run prisma:generate
pnpm run prisma:migrate
```

Desarrollo:
```
pnpm run start:dev
```

Producción:
```
npm run build
npm run start:prod
```
