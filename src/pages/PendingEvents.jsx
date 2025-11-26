// src/pages/PendingEvents.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPendingEvents, approveEvent, rejectEvent } from "../services/eventService";
import { getStoredUser } from "../services/authService";
import MainNavbar from "../components/MainNavbar";
import "./Events.css";

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approveModal, setApproveModal] = useState({ show: false, eventId: null, eventName: "" });
  const [rejectModal, setRejectModal] = useState({ show: false, eventId: null, eventName: "" });
  const [justificacion, setJustificacion] = useState("");
  const [processing, setProcessing] = useState(false);
  const user = getStoredUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndLoad = async () => {
      // Verificar que el usuario sea SECRETARIO
      if (!user || user.rol?.toUpperCase() !== 'SECRETARIO') {
        navigate('/events');
        return;
      }
      await loadPendingEvents();
    };
    checkAndLoad();
  }, []);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getPendingEvents();
      setEvents(result?.data?.events || []);
    } catch (err) {
      console.error("Error cargando pendientes:", err);
      setError("Error al cargar eventos pendientes");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveClick = (eventId, eventName) => {
    setApproveModal({ show: true, eventId, eventName });
    setJustificacion("");
  };

  const handleRejectClick = (eventId, eventName) => {
    setRejectModal({ show: true, eventId, eventName });
    setJustificacion("");
  };

  const handleConfirmApprove = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      await approveEvent(approveModal.eventId, justificacion);
      alert("Evento aprobado exitosamente");
      setApproveModal({ show: false, eventId: null, eventName: "" });
      setJustificacion("");
      // Remover de la lista sin recargar
      setEvents(prev => prev.filter(e => e.id !== approveModal.eventId));
    } catch (err) {
      console.error("Error aprobando:", err);
      alert(err.message || "Error al aprobar evento");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!justificacion.trim()) {
      alert("Debe proporcionar una justificación para rechazar el evento");
      return;
    }
    if (processing) return;
    try {
      setProcessing(true);
      await rejectEvent(rejectModal.eventId, justificacion);
      alert("Evento rechazado exitosamente");
      setRejectModal({ show: false, eventId: null, eventName: "" });
      setJustificacion("");
      // Remover de la lista sin recargar
      setEvents(prev => prev.filter(e => e.id !== rejectModal.eventId));
    } catch (err) {
      console.error("Error rechazando:", err);
      alert(err.message || "Error al rechazar evento");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelApprove = () => {
    setApproveModal({ show: false, eventId: null, eventName: "" });
    setJustificacion("");
  };

  const handleCancelReject = () => {
    setRejectModal({ show: false, eventId: null, eventName: "" });
    setJustificacion("");
  };

  return (
    <div className="events-container">
      <MainNavbar />
      
      <div className="events-content content-with-navbar">
        <div className="events-header">
          <h1>Eventos Pendientes de Evaluación</h1>
          <Link to="/events" className="btn-secondary">
            ← Volver a Eventos
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Cargando eventos pendientes...</div>
        ) : (
          <>
            {events.length === 0 ? (
              <div className="no-data">
                No hay eventos pendientes de evaluación
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h3>{event.nombre_evento || event.titulo}</h3>
                      <span className="status-badge status-sent">
                        Enviado
                      </span>
                    </div>
                    
                    <p className="event-description">{event.descripcion}</p>
                    
                    <div className="event-details">
                      <div className="detail-item">
                        <strong>Tipo:</strong> {event.tipo === 'ACADEMICO' ? 'Académico' : 'Lúdico'}
                      </div>
                      <div className="detail-item">
                        <strong>Fecha:</strong> {formatDate(event.fecha_inicio)} - {formatDate(event.fecha_fin)}
                      </div>
                      <div className="detail-item">
                        <strong>Lugar:</strong> {event.ubicacion || event.lugar}
                      </div>
                      {event.organizador_nombre && (
                        <div className="detail-item">
                          <strong>Organizador:</strong> {event.organizador_nombre} {event.organizador_apellido}
                        </div>
                      )}
                      {event.organizacion_nombre && (
                        <div className="detail-item">
                          <strong>Organización:</strong> {event.organizacion_nombre}
                        </div>
                      )}
                      <div className="detail-item">
                        <strong>Fecha de envío:</strong> {event.fecha_registro ? formatDate(event.fecha_registro) : 'N/A'}
                      </div>
                    </div>

                    <div className="card-actions" style={{ gap: '10px' }}>
                      <Link to={`/events/${event.id}`} className="btn-secondary">
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal de Aprobación */}
        {approveModal.show && (
          <div className="modal-overlay" onClick={handleCancelApprove}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Aprobar Evento</h2>
              <p>¿Está seguro que desea aprobar el evento "<strong>{approveModal.eventName}</strong>"?</p>
              <div style={{ marginTop: '15px' }}>
                <label><strong>Justificación (opcional):</strong></label>
                <textarea
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  rows="4"
                  style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Añadir comentarios sobre la aprobación..."
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={handleCancelApprove} disabled={processing}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleConfirmApprove} disabled={processing}>
                  {processing ? 'Procesando...' : 'Confirmar Aprobación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Rechazo */}
        {rejectModal.show && (
          <div className="modal-overlay" onClick={handleCancelReject}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Rechazar Evento</h2>
              <p>¿Está seguro que desea rechazar el evento "<strong>{rejectModal.eventName}</strong>"?</p>
              <div style={{ marginTop: '15px' }}>
                <label><strong>Justificación (requerida):</strong></label>
                <textarea
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  rows="4"
                  style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Explicar el motivo del rechazo..."
                  required
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={handleCancelReject} disabled={processing}>
                  Cancelar
                </button>
                <button 
                  className="btn-delete" 
                  onClick={handleConfirmReject} 
                  disabled={processing || !justificacion.trim()}
                >
                  {processing ? 'Procesando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingEvents;
