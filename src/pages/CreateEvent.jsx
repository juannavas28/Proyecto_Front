// src/pages/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/eventService";
import { getAllOrganizations, createOrganization } from "../services/organizationService";
import { getStoredUser } from "../services/authService";
import "./CreateEvent.css";

const CreateEvent = () => {
  const [form, setForm] = useState({
    nombre_evento: "",
    descripcion: "",
    tipo: "academico",
    fecha_inicio: "",
    fecha_fin: "",
    ubicacion: "",
    unidad_academica_id: "",
    organizacion_externa_id: "",
    aval_pdf: null,
    // acta_comite_pdf removed per request
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState("");
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({
    nombre: "",
    nit: "",
    representante_legal: "",
    telefono: "",
    email: "",
    ubicacion: "",
    actividad_principal: "",
    tipo_organizacion: ""
  });
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const result = await getAllOrganizations(1, 100);
      if (result.success) {
        setOrganizations(result.data.organizations);
      }
    } catch (err) {
      console.error("Error al cargar organizaciones:", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    // Validar que sea PDF
    if (file) {
      if (file.type !== 'application/pdf') {
        setError(`El archivo ${name === 'aval_pdf' ? 'de aval' : 'de acta'} debe ser un PDF`);
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`El archivo ${name === 'aval_pdf' ? 'de aval' : 'de acta'} no puede superar los 5 MB`);
        e.target.value = '';
        return;
      }
    }
    
    setForm({ ...form, [name]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación (ignorar espacios)
    const nombre_evento = (form.nombre_evento || "").trim();
    const descripcion = (form.descripcion || "").trim();
    const fecha_inicio = form.fecha_inicio;
    const fecha_fin = form.fecha_fin;
    const ubicacion = (form.ubicacion || "").trim();

    if (!nombre_evento || !descripcion || !fecha_inicio || !fecha_fin || !ubicacion) {
      setError("Campos obligatorios: Título, Descripción, Fecha inicio, Fecha fin y Lugar. No dejes sólo espacios.");
      setLoading(false);
      return;
    }

    // Validar longitud mínima de descripción
    if (descripcion.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      setLoading(false);
      return;
    }

    // Validar fechas
    if (new Date(form.fecha_inicio) >= new Date(form.fecha_fin)) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin");
      setLoading(false);
      return;
    }

    try {
      // Construir payload o FormData (si hay archivo de aval)
      let result;
      if (form.aval_pdf) {
        const formData = new FormData();
        formData.append("nombre_evento", nombre_evento);
        formData.append("descripcion", descripcion);
        formData.append("tipo", form.tipo);
        formData.append("fecha_inicio", fecha_inicio);
        formData.append("fecha_fin", fecha_fin);
        formData.append("ubicacion", ubicacion);
        if (form.unidad_academica_id) formData.append("unidad_academica_id", form.unidad_academica_id);
        if (form.organizacion_externa_id) formData.append("organizacion_externa_id", form.organizacion_externa_id);
        formData.append("aval_pdf", form.aval_pdf);
        result = await createEvent(formData);
      } else {
        const payload = {
          nombre_evento,
          descripcion,
          tipo: form.tipo,
          fecha_inicio,
          fecha_fin,
          ubicacion,
          unidad_academica_id: form.unidad_academica_id || null,
          organizacion_externa_id: form.organizacion_externa_id || null
        };
        result = await createEvent(payload);
      }

      if (result.success) {
        alert("Evento creado exitosamente 🎉");
        navigate("/events");
      } else {
        setError(result.message || "Error al crear el evento");
      }
    } catch (err) {
      console.error("Error al crear evento:", err);
      setError(err.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <div className="form-header">
        <h1>Crear Nuevo Evento</h1>
        <button 
          className="btn-back" 
          onClick={() => navigate("/events")}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre_evento">Título del Evento *</label>
            <input
              type="text"
              id="nombre_evento"
              name="nombre_evento"
              value={form.nombre_evento}
              onChange={handleChange}
              required
              placeholder="Ej: Conferencia de Inteligencia Artificial"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipo">Tipo de Evento *</label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              required
            >
              <option value="academico">Académico</option>
              <option value="ludico">Lúdico</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe el evento, objetivos, agenda, etc."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fecha_fin">Fecha de Fin *</label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ubicacion">Lugar *</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              required
              placeholder="Ej: Auditorio Principal, Universidad"
            />
          </div>
        </div>

        {/* Organización Externa */}
        <div className="form-group">
          <label htmlFor="organizacion_externa_id">Organización Externa (Opcional)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              id="organizacion_externa_id"
              name="organizacion_externa_id"
              value={form.organizacion_externa_id}
              onChange={handleChange}
              disabled={loadingOrgs}
              style={{ flex: 1 }}
            >
              <option value="">Seleccionar organización (opcional)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn-small" 
              onClick={() => setShowCreateOrg(!showCreateOrg)}
            >
              {showCreateOrg ? 'Cancelar' : 'Nueva Organización'}
            </button>
          </div>
        </div>

        {/* Formulario inline para crear organización */}
        {showCreateOrg && (
          <div className="inline-create-org-box">
            <h4>Crear Nueva Organización</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input 
                  type="text" 
                  value={newOrg.nombre} 
                  onChange={(e) => setNewOrg({...newOrg, nombre: e.target.value})}
                  placeholder="Nombre de la organización"
                />
              </div>
              <div className="form-group">
                <label>NIT *</label>
                <input 
                  type="text" 
                  value={newOrg.nit} 
                  onChange={(e) => setNewOrg({...newOrg, nit: e.target.value})}
                  placeholder="NIT"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Representante Legal *</label>
                <input 
                  type="text" 
                  value={newOrg.representante_legal} 
                  onChange={(e) => setNewOrg({...newOrg, representante_legal: e.target.value})}
                  placeholder="Nombre del representante"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={newOrg.email} 
                  onChange={(e) => setNewOrg({...newOrg, email: e.target.value})}
                  placeholder="email@organizacion.com"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono *</label>
                <input 
                  type="tel" 
                  value={newOrg.telefono} 
                  onChange={(e) => setNewOrg({...newOrg, telefono: e.target.value})}
                  placeholder="3001234567"
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select 
                  value={newOrg.tipo_organizacion} 
                  onChange={(e) => setNewOrg({...newOrg, tipo_organizacion: e.target.value})}
                >
                  <option value="">Seleccionar</option>
                  <option value="ENTIDAD">Entidad</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="ONG">ONG</option>
                  <option value="OTRA">Otra</option>
                </select>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-create-org" 
              onClick={async () => {
                try {
                  if (!newOrg.nombre || !newOrg.nit || !newOrg.representante_legal || !newOrg.email || !newOrg.telefono) {
                    setError('Todos los campos obligatorios de la organización deben estar completos');
                    return;
                  }
                  const formData = new FormData();
                  Object.keys(newOrg).forEach(key => { if (newOrg[key]) formData.append(key, newOrg[key]); });
                  const res = await createOrganization(formData);
                  if (res.success && res.data && res.data.organization) {
                    setOrganizations([...organizations, res.data.organization]);
                    setForm({...form, organizacion_externa_id: res.data.organization.id});
                    setShowCreateOrg(false);
                    setNewOrg({ nombre: '', nit: '', representante_legal: '', telefono: '', email: '', ubicacion: '', actividad_principal: '', tipo_organizacion: '' });
                    alert('Organización creada y seleccionada exitosamente');
                  }
                } catch (err) {
                  setError('Error al crear organización: ' + (err.message || 'Error desconocido'));
                }
              }}
            >
              Crear y Seleccionar
            </button>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="aval_pdf">Aval PDF (Opcional)</label>
            <input
              type="file"
              id="aval_pdf"
              name="aval_pdf"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <small>Documento de aval del evento</small>
          </div>
          {/* acta_comite_pdf removed per request */}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate("/events")}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
