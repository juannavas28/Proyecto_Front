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
  const [facultad, setFacultad] = useState("");
  const [programaAcademico, setProgramaAcademico] = useState("");
  const [avalPdf, setAvalPdf] = useState("");
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
          setFacultad(user.facultad || "");
          setProgramaAcademico(user.programa_academico || "");
          setAvalPdf(user.aval_pdf || "");
        } else {
          const user = getStoredUser();
          if (user) {
            setNombre(user.nombre || "");
                setApellido(user.apellido || "");
            setCorreo(user.correo || "");
                setTelefono(user.telefono || "");
            setRol(user.rol || "");
            setFacultad(user.facultad || "");
            setProgramaAcademico(user.programa_academico || "");
            setAvalPdf(user.aval_pdf || "");
          }
        }
      } catch (error) {
        const user = getStoredUser();
        if (user) {
          setNombre(user.nombre || "");
          setCorreo(user.correo || "");
          setRol(user.rol || "");
          setFacultad(user.facultad || "");
          setProgramaAcademico(user.programa_academico || "");
          setAvalPdf(user.aval_pdf || "");
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

      // Si hay PDF para subir (solo para docentes/secretarios sin verificar)
      const fileInput = document.getElementById('aval-pdf-input');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const formData = new FormData();
        formData.append('aval_pdf', fileInput.files[0]);
        
        try {
          const response = await fetch(`http://localhost:3000/api/auth/upload-aval`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          const pdfResult = await response.json();
          if (pdfResult.success) {
            setAvalPdf(pdfResult.data.filename);
          } else {
            setError('Error al subir el PDF: ' + pdfResult.message);
            setSaving(false);
            return;
          }
        } catch (error) {
          setError('Error al subir el archivo PDF');
          setSaving(false);
          return;
        }
      }

      const payload = { nombre: nNombre, apellido: nApellido, telefono: nTelefono, correo: nCorreo };
      const result = await updateProfile(payload);

      if (result.success) {
        // Mensaje base
        let msg = "✅ Perfil actualizado correctamente";
        
        // Si se subió PDF, agregar mensaje
        if (fileInput && fileInput.files && fileInput.files[0]) {
          msg += " - Tu cuenta ha sido verificada exitosamente";
        }

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

          {/* Facultad - Solo para Docentes y Secretarios */}
          {(rol === 'DOCENTE' || rol === 'SECRETARIO') && (
            <div className="form-group">
              <label>Facultad:</label>
              <input
                type="text"
                value={facultad || 'No especificada'}
                disabled
                className="disabled-input"
              />
              <small className="form-help">Este campo no se puede editar (dato institucional)</small>
            </div>
          )}

          {/* Programa Académico - Solo para estudiantes */}
          {rol === 'ESTUDIANTE' && (
            <div className="form-group">
              <label>Programa Académico:</label>
              <input
                type="text"
                value={programaAcademico || 'No especificado'}
                disabled
                className="disabled-input"
              />
              <small className="form-help">Este campo no se puede editar (dato institucional)</small>
            </div>
          )}

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

          {/* Estado de Verificación - Solo para Docentes y Secretarios */}
          {(rol === 'DOCENTE' || rol === 'SECRETARIO') && (
            <div className="form-group">
              <label>Estado de Verificación:</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px', 
                backgroundColor: avalPdf ? '#d4edda' : '#f8d7da',
                border: `1px solid ${avalPdf ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '5px',
                color: avalPdf ? '#155724' : '#721c24',
                marginBottom: '10px'
              }}>
                {avalPdf ? (
                  <>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>✓</span>
                    <span style={{ fontWeight: 'bold' }}>Verificado - Certificación recibida</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>⚠</span>
                    <span style={{ fontWeight: 'bold' }}>No verificado - Falta certificación</span>
                  </>
                )}
              </div>
              
              {!avalPdf && (
                <>
                  <label style={{ marginTop: '10px', display: 'block' }}>Subir Certificación PDF:</label>
                  <input
                    type="file"
                    accept=".pdf"
                    id="aval-pdf-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          alert('Solo se permiten archivos PDF');
                          e.target.value = '';
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          alert('El archivo PDF no debe superar los 5MB');
                          e.target.value = '';
                          return;
                        }
                      }
                    }}
                    style={{ marginTop: '5px' }}
                  />
                  <small className="form-help">
                    Sube tu certificación y presiona "Guardar cambios" para verificar tu cuenta (PDF, máximo 5MB)
                  </small>
                </>
              )}
              
              {avalPdf && (
                <small className="form-help">
                  Tu certificación ha sido validada correctamente
                </small>
              )}
            </div>
          )}

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