import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import "./Olvidar.css";

const Olvidar = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const eMail = (email || "").trim();
    if (!eMail) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    // Validar que sea correo institucional @uao.edu.co
    if (!eMail.endsWith('@uao.edu.co')) {
      setError("Solo se permiten correos institucionales (@uao.edu.co)");
      return;
    }

    try {
      setLoading(true);
      const result = await forgotPassword(eMail);
      if (result.success) {
        setMessage("✅ Se ha enviado un enlace a tu correo para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(result.message || "No fue posible procesar la solicitud");
      }
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvidar-wrapper">
      <div className="olvidar-card">
        <button className="btn-close" onClick={() => navigate("/login")}>
          ✕
        </button>

        <h2 className="olvidar-title">Recuperación contraseña</h2>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Correo electrónico</label>
          <input
            className="field-input"
            type="email"
            placeholder="usuario@uao.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {message && <p className="notif-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <p className="info-text">
          Recibirás un enlace válido por 30 minutos para crear una nueva contraseña.
        </p>
      </div>
    </div>
  );
};

export default Olvidar;
