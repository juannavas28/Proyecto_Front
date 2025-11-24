import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrganizationById, updateOrganization } from "../services/organizationService";
import MainNavbar from "../components/MainNavbar";
import "./EditOrganization.css";

const EditOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    representante_legal: "",
    telefono: "",
    email: "",
    ubicacion: "",
    actividad_principal: "",
    tipo_organizacion: "",
    certificado_pdf: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOrganization();
  }, [id]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const result = await getOrganizationById(id);
      
      if (result.success) {
        const org = result.data.organization;
        setForm({
          nombre: org.nombre || "",
          nit: org.nit || "",
          representante_legal: org.representante_legal || "",
          telefono: org.telefono || "",
          email: org.email || "",
          ubicacion: org.ubicacion || "",
          actividad_principal: org.actividad_principal || "",
          tipo_organizacion: org.tipo_organizacion || "",
          certificado_pdf: org.certificado_pdf || ""
        });
      } else {
        setError(result.message || "Error al cargar la organización");
      }
    } catch (err) {
      setError("Error al cargar los datos de la organización");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Por ahora solo guardamos el nombre del archivo
      // En una implementación real, aquí subirías el archivo al servidor
      setForm({ ...form, certificado_pdf: file.name });
    }
  };

  const removeCertificate = () => {
    setForm({ ...form, certificado_pdf: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    // Validación de campos obligatorios
    if (!form.nombre || !form.nombre.trim()) {
      setError("El nombre de la organización es obligatorio");
      setSaving(false);
      return;
    }
    if (!form.nit || !form.nit.trim()) {
      setError("El NIT es obligatorio");
      setSaving(false);
      return;
    }
    if (!form.representante_legal || !form.representante_legal.trim()) {
      setError("El representante legal es obligatorio");
      setSaving(false);
      return;
    }
    if (!form.email || !form.email.trim()) {
      setError("El email es obligatorio");
      setSaving(false);
      return;
    }
    if (!form.telefono || !form.telefono.trim()) {
      setError("El teléfono es obligatorio");
      setSaving(false);
      return;
    }

    try {
      const result = await updateOrganization(id, form);
      
      if (result.success) {
        setSuccess("✅ Organización actualizada exitosamente");
        setTimeout(() => {
          navigate(`/organizations/${id}`);
        }, 2000);
      } else {
        setError(result.message || "Error al actualizar la organización");
      }
    } catch (err) {
      console.error("Error actualizando organización:", err);
      setError(err.message || "Error al actualizar la organización");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-organization-container">
        <MainNavbar />
        <div className="edit-organization-content content-with-navbar">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Cargando información de la organización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !form.nombre) {
    return (
      <div className="edit-organization-container">
        <MainNavbar />
        <div className="edit-organization-content content-with-navbar">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/organizations")} className="btn-primary">
              Volver a Organizaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-organization-container">
      <MainNavbar />
      
      <div className="edit-organization-content content-with-navbar">
        {/* Header */}
        <div className="form-header">
          <div className="header-info">
            <h1>Editar Organización</h1>
            <p>Modifica la información de la organización externa</p>
          </div>
          <button 
            className="btn-back"
            onClick={() => navigate(`/organizations/${id}`)}
          >
            ← Volver
          </button>
        </div>

        {/* Formulario */}
        <div className="organization-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Información básica */}
              <div className="form-section">
                <h3>Información Básica</h3>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre de la Organización *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Empresa Tech S.A.S"
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
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

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
                  <label htmlFor="email">Email de Contacto *</label>
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
              </div>

              {/* Información adicional */}
              <div className="form-section">
                <h3>Información Adicional</h3>
                
                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación</label>
                  <input
                    type="text"
                    id="ubicacion"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Calle 123 #45-67, Bogotá"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipo_organizacion">Tipo de Organización</label>
                  <select
                    id="tipo_organizacion"
                    name="tipo_organizacion"
                    value={form.tipo_organizacion}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="ENTIDAD">Entidad</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="ONG">ONG</option>
                    <option value="OTRA">Otra</option>
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
                    placeholder="Ej: Desarrollo de software"
                  />
                </div>
              </div>
            </div>

            {/* Sección de documentos */}
            <div className="form-section">
              <h3>Documentos</h3>
              
              <div className="form-group">
                <label htmlFor="certificado_pdf">Certificado PDF</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="certificado_pdf"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="certificado_pdf" className="file-input-label">
                    📄 {form.certificado_pdf ? 'Cambiar archivo' : 'Seleccionar archivo PDF'}
                  </label>
                </div>
                
                {form.certificado_pdf && (
                  <div className="current-file">
                    <span className="file-name">📄 {form.certificado_pdf}</span>
                    <button 
                      type="button" 
                      className="btn-remove-file"
                      onClick={removeCertificate}
                    >
                      ✕ Quitar
                    </button>
                  </div>
                )}
                
                <small className="form-help">
                  Sube un archivo PDF del certificado de la organización. Máximo 10MB.
                </small>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate(`/organizations/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOrganization;
