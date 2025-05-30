import React, { useState, useEffect } from 'react';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', date: '', maxCapacity: '' });
  const [editingId, setEditingId] = useState(null);

  // Cargar eventos
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch('http://localhost:5000/api/events', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }

  // Manejo formulario
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Crear o actualizar
  async function handleSubmit(e) {
    e.preventDefault();

    // Validación básica
    if (!form.title || !form.date || !form.maxCapacity) {
      alert('Completa título, fecha y capacidad');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/events/${editingId}`
      : 'http://localhost:5000/api/events';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        date: form.date,
        maxCapacity: Number(form.maxCapacity)
      })
    });

    if (res.ok) {
      await fetchEvents();
      setForm({ title: '', description: '', date: '', maxCapacity: '' });
      setEditingId(null);
    } else {
      const err = await res.json();
      alert(err.message || 'Error');
    }
  }

  // Editar
  function handleEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10), // para input date
      maxCapacity: event.maxCapacity
    });
  }

  // Eliminar
  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar evento?')) return;
    const res = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) {
      await fetchEvents();
    } else {
      alert('Error al eliminar evento');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Eventos</h2>

      <form onSubmit={handleSubmit} className="mb-6 border p-4 rounded">
        <h3 className="mb-2">{editingId ? 'Editar Evento' : 'Crear Evento'}</h3>
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          className="border p-1 mr-2"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-1 mr-2"
          required
        />
        <input
          type="number"
          name="maxCapacity"
          placeholder="Capacidad máxima"
          value={form.maxCapacity}
          onChange={handleChange}
          className="border p-1 mr-2"
          required
          min={1}
        />
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="border p-1 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
        {editingId && (
          <button
            type="button"
            className="ml-2 px-3 py-1 rounded border"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', description: '', date: '', maxCapacity: '' });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {events.map(ev => (
          <li
            key={ev._id}
            className="border-b py-2 flex justify-between items-center"
          >
            <div>
              <strong>{ev.title}</strong> - {new Date(ev.date).toLocaleDateString()} - Capacidad: {ev.maxCapacity}
              <br />
              <small>{ev.description}</small>
            </div>
            <div>
              <button
                onClick={() => handleEdit(ev)}
                className="text-yellow-600 mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(ev._id)}
                className="text-red-600"
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

export default EventsPage;
