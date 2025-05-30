import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
  Outlet,
} from "react-router-dom";

// Contexto para autenticación
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Login
  async function login(email, password) {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login fallido");
      const data = await res.json();
      setUser(data);
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  // Logout
  async function logout() {
    await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  // Verificar sesión al cargar
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/perfil", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    }
    checkProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Ruta protegida
function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Layout con menú de navegación y logout
function Layout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link
            to="/events"
            className="hover:underline"
            aria-current={
              window.location.pathname === "/events" ? "page" : undefined
            }
          >
            Eventos
          </Link>
          <Link
            to="/reservations"
            className="hover:underline"
            aria-current={
              window.location.pathname === "/reservations" ? "page" : undefined
            }
          >
            Reservas
          </Link>
        </div>
        <div>
          {user && (
            <>
              <span className="mr-4">Hola, {user.username || user.email}</span>
              <button
                onClick={logout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center py-4 text-gray-700">
        &copy; {new Date().getFullYear()} Mi Aplicación Eventos
      </footer>
    </div>
  );
}

// Login Page
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/events");
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded shadow">
      <h2 className="text-2xl mb-6 text-center font-bold">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
        >
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}

// Register Page
function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.username || !form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Registro exitoso. Por favor inicia sesión.");
        navigate("/login");
      } else {
        const data = await res.json();
        setError(data[0] || "Error en el registro");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded shadow">
      <h2 className="text-2xl mb-6 text-center font-bold">Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}

// Events Page con CRUD
function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    maxCapacity: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch("http://localhost:5000/api/events", {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.date || !form.maxCapacity) {
      alert("Completa título, fecha y capacidad");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/events/${editingId}`
      : "http://localhost:5000/api/events";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        date: form.date,
        maxCapacity: Number(form.maxCapacity),
      }),
    });

    if (res.ok) {
      await fetchEvents();
      setForm({ title: "", description: "", date: "", maxCapacity: "" });
      setEditingId(null);
    } else {
      const err = await res.json();
      alert(err.message || "Error");
    }
  }

  function handleEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
      maxCapacity: event.maxCapacity,
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar evento?")) return;
    const res = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      await fetchEvents();
    } else {
      alert("Error al eliminar evento");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Eventos</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 border p-4 rounded max-w-lg mx-auto"
      >
        <h3 className="mb-2 text-lg font-semibold">
          {editingId ? "Editar Evento" : "Crear Evento"}
        </h3>
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={form.title}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="maxCapacity"
            placeholder="Capacidad máxima"
            value={form.maxCapacity}
            onChange={handleChange}
            className="border p-2 rounded"
            required
            min={1}
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            className="border p-2 rounded"
            rows={3}
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", description: "", date: "", maxCapacity: "" });
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="max-w-3xl mx-auto space-y-4">
        {events.map((ev) => (
          <li
            key={ev._id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <strong className="text-lg">{ev.title}</strong> <br />
              <small>{new Date(ev.date).toLocaleDateString()}</small> <br />
              <small>Capacidad: {ev.maxCapacity}</small>
              <p>{ev.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(ev)}
                className="text-yellow-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(ev._id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Reservations Page con gestión completa
function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchReservations();
    fetchEvents();
  }, []);

  async function fetchReservations() {
    const res = await fetch("http://localhost:5000/api/reservations", {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  }

  async function fetchEvents() {
    const res = await fetch("http://localhost:5000/api/events", {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }

  async function handleReserve(eventId) {
    const res = await fetch("http://localhost:5000/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) {
      alert("Reserva creada");
      await fetchReservations();
    } else {
      const err = await res.json();
      alert(err.message || "Error al reservar");
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancelar reserva?")) return;
    const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      alert("Reserva cancelada");
      await fetchReservations();
    } else {
      alert("Error al cancelar reserva");
    }
  }

  const reservedEventIds = new Set(reservations.map((r) => r.eventId?._id));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mis Reservas</h2>
      <ul className="mb-8 border-b pb-4 max-w-3xl mx-auto space-y-2">
        {reservations.length === 0 && <p>No tienes reservas.</p>}
        {reservations.map((r) => (
          <li
            key={r._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <strong>{r.eventId?.title}</strong> -{" "}
              {new Date(r.eventId?.date).toLocaleDateString()}
            </div>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleCancel(r._id)}
            >
              Cancelar
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mb-2">Eventos Disponibles</h3>
      <ul className="max-w-3xl mx-auto space-y-2">
        {events.length === 0 && <p>No hay eventos.</p>}
        {events.map((ev) => {
          const isReserved = reservedEventIds.has(ev._id);
          return (
            <li
              key={ev._id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <strong>{ev.title}</strong> -{" "}
                {new Date(ev.date).toLocaleDateString()} - Capacidad:{" "}
                {ev.maxCapacity}
              </div>
              <button
                disabled={isReserved}
                onClick={() => handleReserve(ev._id)}
                className={`px-3 py-1 rounded ${
                  isReserved
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isReserved ? "Reservado" : "Reservar"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/events" replace />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
