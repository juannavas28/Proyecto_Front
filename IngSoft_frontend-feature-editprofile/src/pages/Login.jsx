import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { loginUser, isAuthenticated } from "../services/authService";
import "./Login.css";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/inicio");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación simple
    if (!correo || !contrasena) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      const result = await loginUser(correo, contrasena);

      if (result.success) {
        alert("Inicio de sesión exitoso 🚀");
        navigate("/inicio");
      } else {
        setError(result.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Correo electrónico</label>
          <input
            className="field-input"
            type="email"
            placeholder="Ingrese su correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label className="field-label">Contraseña</label>
          <input
            className="field-input"
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <div className="extra-links">
            <p>
              ¿Olvidó su contraseña? <Link to="/olvidar">Click aquí</Link>
            </p>
            <p>
              ¿No tiene cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
