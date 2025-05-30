import React, { useState, useEffect } from 'react';

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchReservations();
    fetchEvents();
  }, []);

  async function fetchReservations() {
    const res = await fetch('http://localhost:5000/api/reservations', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  }

  async function fetchEvents() {
    const res = await fetch('http://localhost:5000/api/events', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }

  async function handleReserve(eventId) {
    const res = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) {
      alert('Reserva creada');
      await fetchReservations();
    } else {
      const err = await res.json();
      alert(err.message || 'Error al reservar');
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancelar reserva?')) return;
    const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      alert('Reserva cancelada');
      await fetchReservations();
    } else {
      alert('Error al cancelar reserva');
    }
  }

  // Para saber qué eventos ya están reservados por el usuario:
  const reservedEventIds = new Set(reservations.map(r => r.eventId?._id));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mis Reservas</h2>
      <ul className="mb-8 border-b pb-4">
        {reservations.length === 0 && <p>No tienes reservas.</p>}
        {reservations.map(r => (
          <li key={r._id} className="flex justify-between items-center border-b py-2">
            <div>
              <strong>{r.eventId?.title}</strong> - {new Date(r.eventId?.date).toLocaleDateString()}
            </div>
            <button
              className="text-red-600"
              onClick={() => handleCancel(r._id)}
            >
              Cancelar
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mb-2">Eventos Disponibles</h3>
      <ul>
        {events.length === 0 && <p>No hay eventos.</p>}
        {events.map(ev => {
          const isReserved = reservedEventIds.has(ev._id);
          return (
            <li key={ev._id} className="flex justify-between items-center border-b py-2">
              <div>
                <strong>{ev.title}</strong> - {new Date(ev.date).toLocaleDateString()} - Capacidad: {ev.maxCapacity}
              </div>
              <button
                disabled={isReserved}
                onClick={() => handleReserve(ev._id)}
                className={`px-3 py-1 rounded ${isReserved ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white'}`}
              >
                {isReserved ? 'Reservado' : 'Reservar'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ReservationsPage;
