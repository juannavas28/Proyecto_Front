import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../services/eventService";
import { getAllOrganizations } from "../services/organizationService";
import MainNavbar from "../components/MainNavbar";
import authService from "../services/authService";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre_evento: "",
    descripcion: "",
    tipo: "academico",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedParticipantes, setSelectedParticipantes] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [loadingLugares, setLoadingLugares] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Cargar lugares disponibles
        await loadLugares();
        
        // Cargar usuarios (docentes y estudiantes)
        await loadUsers();
        
        // Cargar organizaciones disponibles
        const orgsResult = await getAllOrganizations(1, 100);
        if (orgsResult.success) {
          setOrganizations(orgsResult.data.organizations);
        }
        
        // Cargar datos del evento
        const result = await getEventById(id);
        if (result.success) {
          const ev = result.data;
          setForm({
            nombre_evento: ev.nombre_evento || ev.titulo || "",
            descripcion: ev.descripcion || "",
            tipo: ev.tipo || "academico",
            fecha_inicio: ev.fecha_inicio?.slice(0, 10) || "",
            fecha_fin: ev.fecha_fin?.slice(0, 10) || "",
          });
          
          // Cargar organizaciones asociadas
          if (ev.organizaciones && ev.organizaciones.length > 0) {
            setSelectedOrganizations(ev.organizaciones.map(o => String(o.organizacion_externa_id)));
          } else if (ev.organizacion_externa_id) {
            setSelectedOrganizations([String(ev.organizacion_externa_id)]);
          }
          
          // Cargar ubicaciones asociadas (IDs de lugares)
          if (ev.ubicaciones && ev.ubicaciones.length > 0) {
            setUbicaciones(ev.ubicaciones.map(u => String(u.lugar_evento_id || u.id)));
          }
          
          // Cargar participantes asociados
          if (ev.participantes && ev.participantes.length > 0) {
            setSelectedParticipantes(ev.participantes.map(p => String(p.usuario_id)));
          }
        } else {
          setError(result.message || "Error al cargar el evento");
        }
      } catch (err) {
        setError("Error al cargar el evento");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadLugares = async () => {
    try {
      setLoadingLugares(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/lugares", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLugares(data.data || []);
      }
    } catch (error) {
      console.error("Error cargando lugares:", error);
    } finally {
      setLoadingLugares(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLugarSelect = (e) => {
    const lugarId = e.target.value;
    if (lugarId && !ubicaciones.includes(lugarId)) {
      setUbicaciones([...ubicaciones, lugarId]);
    }
  };

  const removeLugar = (lugarId) => {
    setUbicaciones(ubicaciones.filter(id => id !== lugarId));
  };

  const handleParticipanteSelect = (e) => {
    const userId = e.target.value;
    if (userId && !selectedParticipantes.includes(userId)) {
      setSelectedParticipantes([...selectedParticipantes, userId]);
    }
  };

  const removeParticipante = (userId) => {
    setSelectedParticipantes(selectedParticipantes.filter(id => id !== userId));
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
    setSuccess("");

    // Validar al menos una ubicación
    if (ubicaciones.length === 0) {
      setError("Debes seleccionar al menos un lugar para el evento");
      return;
    }

    if (!form.nombre_evento || !form.descripcion || !form.fecha_inicio || !form.fecha_fin) {
      setError("Los campos título, descripción y fechas son obligatorios");
      return;
    }
    if (new Date(form.fecha_inicio) >= new Date(form.fecha_fin)) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    try {
      setSaving(true);
      // Mapear campos al esquema que espera el backend
      const payload = {
        nombre_evento: form.nombre_evento,
        descripcion: form.descripcion,
        tipo: form.tipo,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        ubicaciones: ubicaciones,
        organizaciones: selectedOrganizations,
        participantes: selectedParticipantes
      };
      const result = await updateEvent(id, payload);
      if (result.success) {
        setSuccess("✅ Evento actualizado correctamente");
        setTimeout(() => navigate(`/events/${id}`), 1500);
      } else {
        setError(result.message || "No fue posible actualizar el evento");
      }
    } catch (err) {
      setError(err.message || "Error al actualizar el evento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="events-container">
        <MainNavbar />
        <div className="events-content content-with-navbar">
          <div className="loading">Cargando evento...</div>
        </div>
      </div>
    );
  }

  if (error && !form.titulo) {
    return (
      <div className="events-container">
        <MainNavbar />
        <div className="events-content content-with-navbar">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <MainNavbar />
      <div className="events-content content-with-navbar">
        <div className="events-header">
          <h1>Editar Evento</h1>
          <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>← Volver</button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre_evento">Título *</label>
              <input id="nombre_evento" name="nombre_evento" value={form.nombre_evento} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="tipo">Tipo *</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="academico">Académico</option>
                <option value="ludico">Lúdico</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
              <input type="date" id="fecha_inicio" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="fecha_fin">Fecha de Fin *</label>
              <input type="date" id="fecha_fin" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
            </div>
          </div>

          {/* Múltiples Lugares */}
          <div className="form-group">
            <label htmlFor="lugar_select">Lugares del Evento *</label>
            
            {/* Lugares seleccionados */}
            {ubicaciones.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {ubicaciones.map(lugarId => {
                  const lugar = lugares.find(l => l.id === parseInt(lugarId));
                  return lugar ? (
                    <div key={lugarId} style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '6px 12px', 
                      background: '#fff3cd', 
                      borderRadius: '4px', 
                      marginRight: '8px',
                      marginBottom: '8px'
                    }}>
                      <span>{lugar.nombre} ({lugar.capacidad} personas)</span>
                      <button
                        type="button"
                        onClick={() => removeLugar(lugarId)}
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
              id="lugar_select"
              onChange={handleLugarSelect}
              value=""
              disabled={loadingLugares}
              style={{ width: '100%' }}
            >
              <option value="">
                {loadingLugares ? "Cargando lugares..." : "Seleccionar lugar"}
              </option>
              {lugares.map((lugar) => (
                <option key={lugar.id} value={lugar.id}>
                  {lugar.nombre} ({lugar.capacidad} personas)
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
            
            <select
              id="organizacion_select"
              onChange={handleOrganizationSelect}
              value=""
              style={{ width: '100%' }}
            >
              <option value="">Seleccionar organización (opcional)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Participantes (Docentes y Estudiantes) */}
          <div className="form-group">
            <label htmlFor="participante_select">Participantes (Docentes y Estudiantes)</label>
            
            {/* Participantes seleccionados */}
            {selectedParticipantes.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {selectedParticipantes.map(userId => {
                  const user = users.find(u => u.id === parseInt(userId));
                  return user ? (
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
                      <span>{user.nombre} {user.apellido} ({user.rol})</span>
                      <button
                        type="button"
                        onClick={() => removeParticipante(userId)}
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
              id="participante_select"
              onChange={handleParticipanteSelect}
              value=""
              disabled={loadingUsers}
              style={{ width: '100%' }}
            >
              <option value="">
                {loadingUsers ? "Cargando usuarios..." : "Seleccionar participante"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido} - {user.rol}
                  {user.programa_academico ? ` (${user.programa_academico})` : ''}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(`/events/${id}`)} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;




