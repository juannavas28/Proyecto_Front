// src/pages/CreateOrganization.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "../services/organizationService";
import { getStoredUser } from "../services/authService";
import "./CreateOrganization.css";

const CreateOrganization = () => {
  const [form, setForm] = useState({
    nombre: "",
    representante_legal: "",
    telefono: "",
    ubicacion: "",
    sector_economico: "",
    actividad_principal: "",
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
    setForm({ ...form, certificado_pdf: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación
    if (!form.nombre || !form.representante_legal) {
      setError("Nombre y representante legal son campos obligatorios");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("representante_legal", form.representante_legal);
      formData.append("telefono", form.telefono);
      formData.append("ubicacion", form.ubicacion);
      formData.append("sector_economico", form.sector_economico);
      formData.append("actividad_principal", form.actividad_principal);
      
      if (form.certificado_pdf) {
        formData.append("certificado_pdf", form.certificado_pdf);
      }

      const result = await createOrganization(formData);

      if (result.success) {
        alert("Organización creada exitosamente 🎉");
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
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
            <label htmlFor="sector_economico">Sector Económico</label>
            <select
              id="sector_economico"
              name="sector_economico"
              value={form.sector_economico}
              onChange={handleChange}
            >
              <option value="">Seleccionar sector</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Educación">Educación</option>
              <option value="Salud">Salud</option>
              <option value="Financiero">Financiero</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Servicios">Servicios</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
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

        <div className="form-group">
          <label htmlFor="certificado_pdf">Certificado PDF (Opcional)</label>
          <input
            type="file"
            id="certificado_pdf"
            name="certificado_pdf"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <small>Formatos permitidos: PDF (máximo 5MB)</small>
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
