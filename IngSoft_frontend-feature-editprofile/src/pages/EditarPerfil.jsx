import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getStoredUser, updateProfile } from "../services/authService";
import MainNavbar from "../components/MainNavbar";
import "./EditarPerfil.css";

const EditarPerfil = () => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Primero intentar obtener datos actualizados del backend
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          const user = result.user;
          setNombre(user.nombre || "");
          setCorreo(user.correo || "");
          setRol(user.rol || "");
        }
      } catch (error) {
        // Si falla el backend, usar datos del localStorage
        console.log("No se pudieron cargar datos del backend, usando localStorage");
        const user = getStoredUser();
        if (user) {
          setNombre(user.nombre || "");
          setCorreo(user.correo || "");
          setRol(user.rol || "");
        }
      }
    } catch (err) {
      console.error("Error cargando datos del usuario:", err);
      setError("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setSaving(true);

    try {
      const result = await updateProfile({ nombre });
      
      if (result.success) {
        setMensaje("✅ Perfil actualizado correctamente");
        
        // Opcional: redirigir después de un momento
        setTimeout(() => {
          navigate("/inicio");
        }, 2000);
      } else {
        setError(result.message || "Error al actualizar el perfil");
      }
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <MainNavbar />
        <div className="perfil-content content-with-navbar">
          <h1>Editar Perfil</h1>
          <div className="loading">Cargando datos del usuario...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <MainNavbar />
      
      <div className="perfil-content content-with-navbar">
        <h1>Editar Perfil</h1>

        {error && <div className="error-message">{error}</div>}

      <form className="perfil-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico:</label>
          <input
            type="email"
            value={correo}
            disabled
            className="disabled-input"
          />
          <small className="form-help">El correo no se puede modificar</small>
        </div>

        <div className="form-group">
          <label>Rol:</label>
          <input
            type="text"
            value={rol}
            disabled
            className="disabled-input"
          />
          <small className="form-help">El rol no se puede modificar</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={() => navigate("/inicio")}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      </form>
      </div>
    </div>
  );
};
export default EditarPerfil;