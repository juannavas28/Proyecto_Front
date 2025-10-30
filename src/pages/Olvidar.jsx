import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Olvidar.css";

const Olvidar = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage(" Por favor ingresa tu correo electrónico.");
      return;
    }

    setMessage(" Se ha enviado un correo para recuperar tu contraseña.");

    // Redirige al login después de 2s
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="olvidar-wrapper">
      <div className="olvidar-card">
        {/* Botón cerrar */}
        <button className="btn-close" onClick={() => navigate("/login")}>
          ✕
        </button>

        <h2 className="olvidar-title">Recuperación contraseña</h2>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Correo electrónico</label>
          <input
            className="field-input"
            type="email"
            placeholder="Ingrese su correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn-submit" type="submit">
            Enviar
          </button>
        </form>

        {message && <p className="notif-text">{message}</p>}

        <p className="info-text">
          Cuando presiones el botón recibirás un correo recordándote tu contraseña.
        </p>
      </div>
    </div>
  );
};

export default Olvidar;
