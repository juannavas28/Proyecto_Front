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

  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedParticipantes, setSelectedParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLugares, setLoadingLugares] = useState(true);
  const [error, setError] = useState("");
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({
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
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    loadOrganizations();
    loadUsers();
    loadLugares();
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

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadLugares = async () => {
    try {
      setLoadingLugares(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/lugares", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setLugares(result.data);
      }
    } catch (err) {
      console.error("Error al cargar lugares:", err);
    } finally {
      setLoadingLugares(false);
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

  const handleOrganizationSelect = (e) => {
    const orgId = e.target.value;
    if (orgId && !selectedOrganizations.includes(orgId)) {
      setSelectedOrganizations([...selectedOrganizations, orgId]);
    }
  };

  const removeOrganization = (orgId) => {
    setSelectedOrganizations(selectedOrganizations.filter(id => id !== orgId));
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

    // Validar al menos una ubicación
    if (ubicaciones.length === 0) {
      setError("Debes seleccionar al menos un lugar para el evento");
      setLoading(false);
      return;
    }

    if (!nombre_evento || !descripcion || !fecha_inicio || !fecha_fin) {
      setError("Campos obligatorios: Título, Descripción, Fechas y al menos un lugar.");
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
        console.log("📤 Enviando con FormData (hay PDF)");
        const formData = new FormData();
        formData.append("nombre_evento", nombre_evento);
        formData.append("descripcion", descripcion);
        formData.append("tipo", form.tipo);
        formData.append("fecha_inicio", fecha_inicio);
        formData.append("fecha_fin", fecha_fin);
        formData.append("ubicaciones", JSON.stringify(ubicaciones));
        formData.append("organizaciones", JSON.stringify(selectedOrganizations));
        formData.append("participantes", JSON.stringify(selectedParticipantes));
        if (form.unidad_academica_id) formData.append("unidad_academica_id", form.unidad_academica_id);
        formData.append("aval_pdf", form.aval_pdf);
        
        console.log("📋 Datos a enviar:");
        console.log("  - Ubicaciones:", ubicaciones);
        console.log("  - Organizaciones:", selectedOrganizations);
        console.log("  - PDF:", form.aval_pdf.name);
        
        result = await createEvent(formData);
      } else {
        console.log("📤 Enviando con JSON (sin PDF)");
        const payload = {
          nombre_evento,
          descripcion,
          tipo: form.tipo,
          fecha_inicio,
          fecha_fin,
          ubicaciones: ubicaciones,
          organizaciones: selectedOrganizations,
          participantes: selectedParticipantes,
          unidad_academica_id: form.unidad_academica_id || null
        };
        
        console.log("📋 Payload:", payload);
        result = await createEvent(payload);
      }
      
      console.log("✅ Respuesta del servidor:", result);

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

        {/* Selección de Lugares Predefinidos */}
        <div className="form-group">
          <label>Lugares del Evento *</label>
          
          {/* Lugares seleccionados */}
          {ubicaciones.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {ubicaciones.map((lugarId, index) => {
                const lugar = lugares.find(l => l.id === parseInt(lugarId));
                return lugar ? (
                  <div key={index} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '6px 12px', 
                    background: '#fff3e0', 
                    borderRadius: '4px', 
                    marginRight: '8px',
                    marginBottom: '8px'
                  }}>
                    <span>{lugar.nombre} ({lugar.capacidad} personas)</span>
                    <button
                      type="button"
                      onClick={() => setUbicaciones(ubicaciones.filter((_, i) => i !== index))}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#666'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          <select
            onChange={(e) => {
              const lugarId = e.target.value;
              if (lugarId && !ubicaciones.includes(lugarId)) {
                setUbicaciones([...ubicaciones, lugarId]);
              }
              e.target.value = "";
            }}
            disabled={loadingLugares}
            value=""
          >
            <option value="">Seleccionar lugar</option>
            {lugares.map((lugar) => (
              <option key={lugar.id} value={lugar.id}>
                {lugar.nombre} - {lugar.capacidad} personas
              </option>
            ))}
          </select>
        </div>

        {/* Múltiples Organizaciones Externas */}
        <div className="form-group">
          <label htmlFor="organizacion_select">Organizaciones Externas (Opcional)</label>
          
          {/* Organizaciones seleccionadas */}
          {selectedOrganizations.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {selectedOrganizations.map(orgId => {
                const org = organizations.find(o => o.id === parseInt(orgId));
                return org ? (
                  <div key={orgId} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '6px 12px', 
                    background: '#e3f2fd', 
                    borderRadius: '4px', 
                    marginRight: '8px',
                    marginBottom: '8px'
                  }}>
                    <span>{org.nombre}</span>
                    <button
                      type="button"
                      onClick={() => removeOrganization(orgId)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#666'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              id="organizacion_select"
              onChange={handleOrganizationSelect}
              disabled={loadingOrgs}
              value=""
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

        {/* Participantes (Docentes y Estudiantes) */}
        <div className="form-group">
          <label htmlFor="participantes_select">Participantes (Docentes y Estudiantes)</label>
          
          {/* Participantes seleccionados */}
          {selectedParticipantes.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {selectedParticipantes.map(userId => {
                const usuario = users.find(u => u.id === parseInt(userId));
                return usuario ? (
                  <div key={userId} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '6px 12px', 
                    background: '#f3e5f5', 
                    borderRadius: '4px', 
                    marginRight: '8px',
                    marginBottom: '8px'
                  }}>
                    <span>{usuario.nombre} {usuario.apellido} ({usuario.rol})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedParticipantes(selectedParticipantes.filter(id => id !== userId))}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#666'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          <select
            id="participantes_select"
            onChange={(e) => {
              const userId = e.target.value;
              if (userId && !selectedParticipantes.includes(userId)) {
                setSelectedParticipantes([...selectedParticipantes, userId]);
              }
              e.target.value = "";
            }}
            disabled={loadingUsers}
            value=""
          >
            <option value="">Seleccionar participante (opcional)</option>
            {users.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre} {usuario.apellido} - {usuario.rol} {usuario.programa_academico ? `(${usuario.programa_academico})` : usuario.facultad ? `(${usuario.facultad})` : ''}
              </option>
            ))}
          </select>
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
                <label>Persona Responsable/Asistente al Evento *</label>
                <input 
                  type="text" 
                  value={newOrg.persona_responsable} 
                  onChange={(e) => setNewOrg({...newOrg, persona_responsable: e.target.value})}
                  placeholder="Nombre de quien asistirá al evento"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={newOrg.email} 
                  onChange={(e) => setNewOrg({...newOrg, email: e.target.value})}
                  placeholder="email@organizacion.com"
                />
              </div>
              <div className="form-group">
                <label>Teléfono *</label>
                <input 
                  type="tel" 
                  value={newOrg.telefono} 
                  onChange={(e) => setNewOrg({...newOrg, telefono: e.target.value})}
                  placeholder="3001234567"
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
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Certificado PDF *</label>
              <input 
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
                    setNewOrg({...newOrg, certificado_pdf: file});
                  }
                }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Sube el certificado de la organización (PDF, máximo 5MB)
              </small>
              {newOrg.certificado_pdf && (
                <div style={{ marginTop: '6px', color: 'green', fontSize: '14px' }}>
                  ✓ Archivo seleccionado: {newOrg.certificado_pdf.name}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="btn-create-org" 
              onClick={async () => {
                try {
                  if (!newOrg.nombre || !newOrg.nit || !newOrg.representante_legal || !newOrg.persona_responsable || !newOrg.email || !newOrg.telefono) {
                    setError('Todos los campos obligatorios de la organización deben estar completos');
                    return;
                  }
                  if (!newOrg.certificado_pdf) {
                    setError('Debes adjuntar el certificado PDF de la organización');
                    return;
                  }
                  const formData = new FormData();
                  Object.keys(newOrg).forEach(key => { if (newOrg[key]) formData.append(key, newOrg[key]); });
                  const res = await createOrganization(formData);
                  if (res.success && res.data && res.data.organization) {
                    setOrganizations([...organizations, res.data.organization]);
                    setForm({...form, organizacion_externa_id: res.data.organization.id});
                    setShowCreateOrg(false);
                    setNewOrg({ nombre: '', nit: '', representante_legal: '', persona_responsable: '', telefono: '', email: '', ubicacion: '', actividad_principal: '', tipo_organizacion: '' });
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
