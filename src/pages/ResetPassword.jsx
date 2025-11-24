import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Token de recuperación no encontrado en la URL");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    // Validaciones
    if (!token) {
      setError("Token inválido o expirado");
      return;
    }

    if (!nuevaContrasena.trim() || nuevaContrasena.trim().length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const result = await resetPassword(token, nuevaContrasena);
      
      if (result.success) {
        setMensaje("✅ Contraseña actualizada exitosamente. Redirigiendo al login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message || "Error al restablecer la contraseña");
      }
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-card">
        <button className="btn-close" onClick={() => navigate("/login")}>
          ✕
        </button>

        <h2 className="reset-password-title">Restablecer contraseña</h2>
        <p className="reset-password-subtitle">Ingresa tu nueva contraseña</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="field-label">Nueva contraseña</label>
            <div className="password-input-wrapper">
              <input
                className="field-input"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Confirmar contraseña</label>
            <div className="password-input-wrapper">
              <input
                className="field-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading || !token}>
            {loading ? "Procesando..." : "Restablecer contraseña"}
          </button>
        </form>

        {mensaje && <p className="success-text">{mensaje}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
