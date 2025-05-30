import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');

      const data = await res.json();

      console.log('Token recibido:', data.token); // Para verificar token

      if (!data.token) throw new Error('Token no recibido');

      login(data.token); // Guardar token en contexto y localStorage

      navigate('/events'); // Redirigir al área protegida

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Inputs y botones */}
      {error && <p>{error}</p>}
    </form>
  );
};

export default Login;
