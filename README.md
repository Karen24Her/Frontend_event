# 🎟️ Reserva de eventos

Aplicación web en **React** y **Tailwind CSS** para registrarse, consultar eventos y gestionar reservas.

## Funcionalidades

- Registro e inicio de sesión, con el estado del usuario manejado en un contexto de autenticación (React Context).
- Rutas protegidas: solo los usuarios autenticados ven los eventos y sus reservas.
- Creación y edición de eventos (nombre, descripción, fecha y capacidad máxima).
- Página de reservas del usuario.

## Tecnologías

React · React Router · Tailwind CSS · Fetch API

## Cómo ejecutarla

```bash
git clone https://github.com/Karen24Her/Frontend_event.git
cd Frontend_event
npm install
npm start
```

La app espera un backend en `http://localhost:5000/api` con los endpoints de autenticación (`/login`, `/register`, `/logout`, `/perfil`) y de eventos (`/events`).

## Estructura

```
src/App.jsx       rutas, contexto de autenticación y vistas principales
src/pages/        Login, Registro, Eventos y Reservas
src/context/      contexto de autenticación
```

## Autora

Karen Hernández — [LinkedIn](https://www.linkedin.com/in/karen-julieth-hernandez-chaparro-242432356/)
