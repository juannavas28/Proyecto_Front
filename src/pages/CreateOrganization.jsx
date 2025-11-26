// src/pages/CreateOrganization.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "../services/organizationService";
import { getStoredUser } from "../services/authService";
import "./CreateOrganization.css";

const CreateOrganization = () => {
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    representante_legal: "",
    persona_responsable: "",
    telefono: "",
    email: "",
    ubicacion: "",
    actividad_principal: "",
    tipo_organizacion: "",
    certificado_pdf: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getStoredUser();

  // Verificar permisos
  if (!user || !['secretario', 'administrador'].includes(user.rol)) {
    navigate("/organizations");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        e.target.value = '';
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo PDF no debe superar los 5MB');
        e.target.value = '';
        return;
      }
      
      setError('');
      setForm({ ...form, certificado_pdf: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación de campos obligatorios
    if (!form.nombre || !form.nombre.trim()) {
      setError("El nombre de la organización es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.nit || !form.nit.trim()) {
      setError("El NIT es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.representante_legal || !form.representante_legal.trim()) {
      setError("El representante legal es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.persona_responsable || !form.persona_responsable.trim()) {
      setError("La persona responsable es obligatoria");
      setLoading(false);
      return;
    }

    if (!form.email || !form.email.trim()) {
      setError("El email de contacto es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.telefono || !form.telefono.trim()) {
      setError("El teléfono es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.persona_responsable || !form.persona_responsable.trim()) {
      setError("La persona responsable es obligatoria");
      setLoading(false);
      return;
    }

    if (!form.certificado_pdf) {
      setError("El certificado PDF (aval) es obligatorio");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre.trim());
      formData.append("nit", form.nit.trim());
      formData.append("representante_legal", form.representante_legal.trim());
      formData.append("email", form.email.trim());
      formData.append("telefono", form.telefono.trim());
      
      if (form.ubicacion) formData.append("ubicacion", form.ubicacion.trim());
      if (form.actividad_principal) formData.append("actividad_principal", form.actividad_principal.trim());
      formData.append("tipo_organizacion", form.tipo_organizacion || 'OTRA');
      
      if (form.certificado_pdf) {
        formData.append("certificado_pdf", form.certificado_pdf);
      }

      const result = await createOrganization(formData);

      if (result.success) {
        // Mostrar resumen de datos registrados
        const resumen = `\n✅ Organización registrada exitosamente\n\nDatos guardados:\n- Nombre: ${form.nombre}\n- NIT: ${form.nit}\n- Representante Legal: ${form.representante_legal}\n- Email: ${form.email}\n- Teléfono: ${form.telefono}${form.certificado_pdf ? '\n- Certificado PDF: Adjuntado' : ''}`;
        alert(resumen);
        navigate("/organizations");
      } else {
        setError(result.message || "Error al crear la organización");
      }
    } catch (err) {
      console.error("Error al crear organización:", err);
      setError(err.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-organization-container">
      <div className="form-header">
        <h1>Crear Nueva Organización</h1>
        <button 
          className="btn-back" 
          onClick={() => navigate("/organizations")}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="organization-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Organización *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Empresa ABC S.A.S"
            />
          </div>
          <div className="form-group">
            <label htmlFor="representante_legal">Representante Legal *</label>
            <input
              type="text"
              id="representante_legal"
              name="representante_legal"
              value={form.representante_legal}
              onChange={handleChange}
              required
              placeholder="Nombre completo del representante"
            />
          </div>
          <div className="form-group">
            <label htmlFor="persona_responsable">Persona Responsable/Asistente al Evento *</label>
            <input
              type="text"
              id="persona_responsable"
              name="persona_responsable"
              value={form.persona_responsable}
              onChange={handleChange}
              required
              placeholder="Nombre de quien asistirá al evento"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nit">NIT *</label>
            <input
              type="text"
              id="nit"
              name="nit"
              value={form.nit}
              onChange={handleChange}
              required
              placeholder="Número de identificación"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email de contacto *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="contacto@organizacion.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 3001234567"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Dirección de la organización"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="actividad_principal">Actividad Principal</label>
            <input
              type="text"
              id="actividad_principal"
              name="actividad_principal"
              value={form.actividad_principal}
              onChange={handleChange}
              placeholder="Descripción de la actividad principal"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tipo_organizacion">Tipo de organización</label>
            <select
              id="tipo_organizacion"
              name="tipo_organizacion"
              value={form.tipo_organizacion || ''}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo</option>
              <option value="ENTIDAD">Entidad</option>
              <option value="EMPRESA">Empresa</option>
              <option value="ONG">ONG</option>
              <option value="OTRA">Otra</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="certificado_pdf">Certificado PDF (Aval) *</label>
          <input
            type="file"
            id="certificado_pdf"
            name="certificado_pdf"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          <small>Formatos permitidos: PDF (máximo 5MB) - Obligatorio</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate("/organizations")}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Organización"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganization;
