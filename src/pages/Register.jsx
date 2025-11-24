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
  });

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

    try {
      const payload = { ...form, nombre, apellido, correo, telefono };
      const result = await registerUser(payload);

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
