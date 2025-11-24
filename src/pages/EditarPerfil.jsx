import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getStoredUser, updateProfile } from "../services/authService";
import MainNavbar from "../components/MainNavbar";
import "./EditarPerfil.css";

const EditarPerfil = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      try {
        const result = await getCurrentUser();
        if (result?.success && result?.data?.user) {
          const user = result.data.user;
          setNombre(user.nombre || "");
              setApellido(user.apellido || "");
          setCorreo(user.correo || "");
              setTelefono(user.telefono || "");
          setRol(user.rol || "");
        } else {
          const user = getStoredUser();
          if (user) {
            setNombre(user.nombre || "");
                setApellido(user.apellido || "");
            setCorreo(user.correo || "");
                setTelefono(user.telefono || "");
            setRol(user.rol || "");
          }
        }
      } catch (error) {
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
      // Validar que los campos obligatorios no estén vacíos (no contar espacios)
      const nNombre = nombre?.trim() || "";
      const nApellido = apellido?.trim() || "";
      const nCorreo = correo?.trim() || "";
      const nTelefono = telefono?.trim() || "";

      if (!nNombre || !nApellido || !nCorreo) {
        setError("Por favor completa Nombre, Apellido y Correo (no pueden quedar vacíos)");
        setSaving(false);
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nCorreo)) {
        setError("Por favor ingresa un correo válido");
        setSaving(false);
        return;
      }

      // Validar que sea correo institucional @uao.edu.co
      if (!nCorreo.endsWith('@uao.edu.co')) {
        setError("Solo se permiten correos institucionales (@uao.edu.co)");
        setSaving(false);
        return;
      }

      // Validar cambio de contraseña si se proporcionaron campos
      if (contrasena || nuevaContrasena || confirmarContrasena) {
        if (!contrasena.trim()) {
          setError("Debes ingresar tu contraseña actual para cambiarla");
          setSaving(false);
          return;
        }
        if (!nuevaContrasena.trim() || nuevaContrasena.trim().length < 6) {
          setError("La nueva contraseña debe tener al menos 6 caracteres");
          setSaving(false);
          return;
        }
        if (nuevaContrasena !== confirmarContrasena) {
          setError("La nueva contraseña y la confirmación no coinciden");
          setSaving(false);
          return;
        }
      }

      const payload = { nombre: nNombre, apellido: nApellido, telefono: nTelefono, correo: nCorreo };
      const result = await updateProfile(payload);

      if (result.success) {
        // Mensaje base
        let msg = "✅ Perfil actualizado correctamente";

        // Si el backend indica que se debe verificar el correo, mostrar info adicional
        const verification = result.data?.verification;
        if (verification) {
          if (verification.sent) {
            msg += ". Se envió un correo de verificación al nuevo email.";
          } else if (verification.token) {
            msg += `. SMTP no configurado. Token de verificación (usar en /verify-email): ${verification.token}`;
          }
        }

        // Si se cambió la contraseña, procesarla
        if (contrasena && nuevaContrasena) {
          const { changePassword } = await import("../services/authService");
          const pwdResult = await changePassword(contrasena, nuevaContrasena);
          if (pwdResult.success) {
            msg += ". Contraseña actualizada correctamente.";
            // Limpiar campos de contraseña
            setContrasena("");
            setNuevaContrasena("");
            setConfirmarContrasena("");
          } else {
            setError(pwdResult.message || "Error al cambiar la contraseña");
            setSaving(false);
            return;
          }
        }

        setMensaje(msg);
        // No navegar inmediatamente para que el usuario vea el mensaje
        setTimeout(() => {
          navigate("/inicio");
        }, 2500);
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
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir letras, espacios y acentos
                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                  setNombre(value);
                }
              }}
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir letras, espacios y acentos
                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                  setApellido(value);
                }
              }}
              placeholder="Ingresa tu apellido"
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@uao.edu.co"
              required
            />
            <small className="form-help">Se puede actualizar; si cambias el correo necesitarás verificarlo</small>
          </div>

          <hr />
          <h3>Cambiar contraseña (opcional)</h3>
          
          <div className="form-group password-group">
            <label>Contraseña actual:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
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

          <div className="form-group password-group">
            <label>Nueva contraseña:</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-group password-group">
            <label>Confirmar nueva contraseña:</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite la nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <small className="form-help">Deja estos campos vacíos si no deseas cambiar tu contraseña</small>
          </div>
          <hr />

          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ingresa tu teléfono"
            />
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