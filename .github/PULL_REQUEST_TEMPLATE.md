# Descripción

> Explica de forma breve para qué es esta PR. Añade issues relacionados abajo.

---

## Tipo de Cambio:

- [ ] Bug fix
- [ ] Nueva Característica
- [ ] Refactor (sin cambios funcionales)
- [ ] Actualización de dependencias
- [ ] Fix de seguridad
- [ ] Actualización a la documentación
- [ ] Cambio en Config / DevOps

---

## Qué cambió y por qué:

> Describe específicamente los cambios y las razones detrás de cada decisión.

---

## Pasos para reproducir / test:

> ¿Cómo puede un reviewer verificar que esto funciona? Aprovecha de mencionar si se necesita variables de entorno, datos provicionales o configuración extra si lo requieres.

1. Instalar dependencias con `pnpm install`.
2. Inicia el servidor de desarrollo con `pnpm run start:dev`.
3. Haz una request:
```bash
curl -X [METHOD] http://localhost:3000/[route] \
  -H "Content-Type: application/json" \
  -d '{ }'
```
4. Resultado esperado.

---

## Endpoints Afectados:

> Menciona cualquer endpoint nuevo, modificado o eliminado:

| Método | Ruta | Cambio |
|--------|-------|--------|
| `GET`  | `/example` | Añadido |

---

## Screenshots / Logs _(opcional)_

> Agrega output de Postman/curl o cualquier imagen relevante.
