import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    contrasena: "",
    rol_id: 1, // Por defecto estudiante
    facultad: "",
    programa_academico: "",
  });

  const [avalPdf, setAvalPdf] = useState(null);
  const [otraFacultad, setOtraFacultad] = useState("");
  const [otroPrograma, setOtroPrograma] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación simple
    // Validación simple (ignorar espacios)
    const nombre = (form.nombre || "").trim();
    const apellido = (form.apellido || "").trim();
    const correo = (form.correo || "").trim();
    const telefono = (form.telefono || "").trim();
    const contrasena = form.contrasena || "";

    if (!nombre || !apellido || !correo || !contrasena.replace(/\s/g, "")) {
      setError("Todos los campos obligatorios deben completarse (sin dejar sólo espacios)");
      setLoading(false);
      return;
    }

    // Validar email
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(correo)) {
      setError("Por favor ingresa un correo válido");
      setLoading(false);
      return;
    }

    // Validar que sea correo institucional @uao.edu.co
    if (!correo.endsWith('@uao.edu.co')) {
      setError("Solo se permiten correos institucionales (@uao.edu.co)");
      setLoading(false);
      return;
    }

    // Validar contraseña contando sólo caracteres no-espacio
    if (contrasena.replace(/\s/g, "").length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres (sin contar espacios)");
      setLoading(false);
      return;
    }

    // Validar facultad solo para docentes y secretarios
    if ((form.rol_id == 2 || form.rol_id == 3)) {
      if (!form.facultad || form.facultad.trim() === "") {
        setError("Debe seleccionar una facultad");
        setLoading(false);
        return;
      }
      
      if (form.facultad === "OTRO" && (!otraFacultad || otraFacultad.trim() === "")) {
        setError("Debe escribir el nombre de su facultad");
        setLoading(false);
        return;
      }
    }

    // Validar programa académico solo para estudiantes
    if (form.rol_id == 1) {
      if (!form.programa_academico || form.programa_academico.trim() === "") {
        setError("Los estudiantes deben seleccionar un programa académico");
        setLoading(false);
        return;
      }
      
      if (form.programa_academico === "OTRO" && (!otroPrograma || otroPrograma.trim() === "")) {
        setError("Debe escribir el nombre de su programa académico");
        setLoading(false);
        return;
      }
    }

    // Validar PDF para docentes y secretarios
    if ((form.rol_id == 2 || form.rol_id == 3) && !avalPdf) {
      setError("Los docentes y secretarios deben adjuntar un PDF de aval");
      setLoading(false);
      return;
    }

    try {
      let result;
      
      // Preparar payload base
      const facultadFinal = (form.rol_id == 2 || form.rol_id == 3) 
        ? (form.facultad === "OTRO" ? otraFacultad.trim() : form.facultad)
        : null;
      const programaFinal = form.programa_academico === "OTRO" ? otroPrograma.trim() : form.programa_academico;
      
      const payload = { 
        ...form, 
        nombre, 
        apellido, 
        correo, 
        telefono,
        contrasena,
        facultad: facultadFinal,
        programa_academico: programaFinal
      };
      
      // Si hay PDF, enviar como FormData
      if (avalPdf) {
        const formData = new FormData();
        
        // Convertir rol_id a texto
        const rolMap = { 1: 'ESTUDIANTE', 2: 'DOCENTE', 3: 'SECRETARIO', 4: 'ADMINISTRADOR' };
        const rolTexto = rolMap[form.rol_id] || 'ESTUDIANTE';
        
        // Agregar todos los campos del formulario
        Object.keys(payload).forEach(key => {
          if (key !== 'rol_id' && payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });
        
        // Agregar rol como texto (no rol_id)
        formData.append('rol', rolTexto);
        
        // Agregar el archivo PDF
        formData.append('aval_pdf', avalPdf);
        
        result = await registerUser(formData);
      } else {
        result = await registerUser(payload);
      }

      if (result.success) {
        alert("Usuario registrado exitosamente 🎉");
        navigate("/login");
      } else {
        setError(result.message || "Error al registrar el usuario");
      }
    } catch (err) {
      console.error("❌ Error en el registro:", err);
      setError(err.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <button className="btn-close" onClick={() => navigate("/login")}>✕</button>
      
      <div className="register-form">
        <h2>Crear cuenta</h2>

        <form onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="row">
            <label className="field-label">Nombre</label>
            <input
              className="field-input"
              type="text"
              name="nombre"
              placeholder="Ingrese su nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Apellido */}
          <div className="row">
            <label className="field-label">Apellido</label>
            <input
              className="field-input"
              type="text"
              name="apellido"
              placeholder="Ingrese su apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>

          {/* Correo */}
          <div className="row">
            <label className="field-label">Correo electrónico</label>
            <input
              className="field-input"
              type="email"
              name="correo"
              placeholder="usuario@uao.edu.co"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Teléfono */}
          <div className="row">
            <label className="field-label">Teléfono</label>
            <input
              className="field-input"
              type="text"
              name="telefono"
              placeholder="Número de contacto (opcional)"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>

          {/* Rol */}
          <div className="row">
            <label className="field-label">Rol</label>
            <select
              className="field-input"
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              required
            >
              <option value={1}>Estudiante</option>
              <option value={2}>Docente</option>
              <option value={3}>Secretario</option>
              <option value={4}>Administrador</option>
            </select>
          </div>

          {/* Aval PDF - Solo para Docentes y Secretarios */}
          {(form.rol_id == 2 || form.rol_id == 3) && (
            <div className="row">
              <label className="field-label">Certificación PDF (Obligatorio)</label>
              <input
                className="field-input"
                type="file"
                accept=".pdf"
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
                    setAvalPdf(file);
                  }
                }}
                required
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Sube tu certificación para verificar tu cuenta (PDF, máximo 5MB)
              </small>
              {avalPdf && (
                <div style={{ marginTop: '8px', color: 'green' }}>
                  ✓ Archivo seleccionado: {avalPdf.name}
                </div>
              )}
            </div>
          )}

          {/* Facultad - Solo para Docentes y Secretarios */}
          {(form.rol_id == 2 || form.rol_id == 3) && (
            <>
              <div className="row">
                <label className="field-label">Facultad</label>
                <select
                  className="field-input"
                  name="facultad"
                  value={form.facultad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="Ingeniería">Ingeniería</option>
                  <option value="Artes">Artes</option>
                  <option value="Comunicación">Comunicación</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Negocios Internacionales">Negocios Internacionales</option>
                  <option value="OTRO">Otro (escribir manualmente)</option>
                </select>
              </div>

              {/* Campo de texto para otra facultad */}
              {form.facultad === "OTRO" && (
                <div className="row">
                  <label className="field-label">Especifique su facultad</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Escriba el nombre de su facultad"
                    value={otraFacultad}
                    onChange={(e) => setOtraFacultad(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Programa Académico - Solo para estudiantes */}
          {form.rol_id == 1 && (
            <>
              <div className="row">
                <label className="field-label">Programa Académico</label>
                <select
                  className="field-input"
                  name="programa_academico"
                  value={form.programa_academico}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                  <option value="Ingeniería Civil">Ingeniería Civil</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Física">Física</option>
                  <option value="Administración de Empresas">Administración de Empresas</option>
                  <option value="Psicología">Psicología</option>
                  <option value="OTRO">Otro (escribir manualmente)</option>
                </select>
              </div>

              {/* Campo de texto para otro programa */}
              {form.programa_academico === "OTRO" && (
                <div className="row">
                  <label className="field-label">Especifique su programa académico</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Escriba el nombre de su programa"
                    value={otroPrograma}
                    onChange={(e) => setOtroPrograma(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Contraseña */}
          <div className="row">
            <label className="field-label">Contraseña</label>
            <input
              className="field-input"
              type="password"
              name="contrasena"
              placeholder="Mínimo 4 caracteres"
              value={form.contrasena}
              onChange={handleChange}
              required
              minLength={4}
            />
          </div>

          {/* Botón */}
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="extra-links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
