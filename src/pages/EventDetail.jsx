import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventById, approveEvent, rejectEvent, submitEventForValidation } from "../services/eventService";
import { getStoredUser } from "../services/authService";
import MainNavbar from "../components/MainNavbar";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [pdfAprobacion, setPdfAprobacion] = useState(null);
  const [processing, setProcessing] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getEventById(id);
        if (result.success) {
          setEvent(result.data);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isSecretario = () => {
    return user?.rol?.toUpperCase() === 'SECRETARIO';
  };

  const handleApprove = async () => {
    if (!pdfAprobacion) {
      alert("Debe adjuntar el PDF de aprobación");
      return;
    }

    try {
      setProcessing(true);
      const result = await approveEvent(id, justificacion, pdfAprobacion);
      if (result.success) {
        alert("Evento aprobado exitosamente");
        window.location.reload();
      } else {
        alert(result.message || "Error al aprobar evento");
      }
    } catch (err) {
      alert(err.message || "Error al aprobar evento");
    } finally {
      setProcessing(false);
      setShowApproveModal(false);
      setJustificacion("");
      setPdfAprobacion(null);
    }
  };

  const handleReject = async () => {
    if (!justificacion.trim()) {
      alert("Debe proporcionar una justificación para rechazar el evento");
      return;
    }
    try {
      setProcessing(true);
      const result = await rejectEvent(id, justificacion);
      if (result.success) {
        alert("Evento rechazado exitosamente");
        window.location.reload();
      } else {
        alert(result.message || "Error al rechazar evento");
      }
    } catch (err) {
      alert(err.message || "Error al rechazar evento");
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
      setJustificacion("");
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm("¿Está seguro que desea reenviar este evento a validación?")) {
      return;
    }
    try {
      setProcessing(true);
      const result = await submitEventForValidation(id);
      if (result.success) {
        alert("Evento reenviado a validación exitosamente");
        window.location.reload();
      } else {
        alert(result.message || "Error al reenviar evento");
      }
    } catch (err) {
      alert(err.message || "Error al reenviar evento");
    } finally {
      setProcessing(false);
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

  if (error) {
    return (
      <div className="events-container">
        <MainNavbar />
        <div className="events-content content-with-navbar">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/events")} className="btn-primary">
              Volver a Eventos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="events-container">
      <MainNavbar />
      <div className="events-content content-with-navbar">
        <div className="events-header">
          <h1>{event.nombre_evento || event.titulo}</h1>
          <Link to="/events" className="btn-back">← Volver</Link>
        </div>

        <div className="event-card">
          <div className="event-details">
            <div className="detail-item"><strong>Estado:</strong> {event.estado}</div>
            <div className="detail-item"><strong>Descripción:</strong> {event.descripcion}</div>
            <div className="detail-item"><strong>Tipo:</strong> {event.tipo === "academico" ? "Académico" : "Lúdico"}</div>
            <div className="detail-item"><strong>Fecha inicio:</strong> {formatDate(event.fecha_inicio)}</div>
            <div className="detail-item"><strong>Fecha fin:</strong> {formatDate(event.fecha_fin)}</div>
            {/* Lugares del evento */}
            {event.ubicaciones && event.ubicaciones.length > 0 && (
              <div className="detail-item">
                <strong>Lugares:</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {event.ubicaciones.map((ub, index) => (
                    <li key={ub.id || index}>
                      {ub.nombre_lugar || "Lugar sin nombre"}
                      {ub.capacidad && ` (${ub.capacidad} personas)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(!event.ubicaciones || event.ubicaciones.length === 0) && event.ubicacion && (
              <div className="detail-item">
                <strong>Lugar:</strong> {event.ubicacion}
              </div>
            )}
            {event.organizador_nombre && (
              <div className="detail-item"><strong>Organizador:</strong> {event.organizador_nombre}</div>
            )}
            {event.organizaciones && event.organizaciones.length > 0 && (
              <>
                <div className="detail-item">
                  <strong>Organizaciones:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                    {event.organizaciones.map((org) => (
                      <li key={org.rel_id}>
                        {org.nombre} - {org.tipo_organizacion}
                      </li>
                    ))}
                  </ul>
                </div>
                {event.organizaciones.some(org => org.persona_responsable) && (
                  <div className="detail-item">
                    <strong>Personas Asistentes:</strong>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                      {event.organizaciones
                        .filter(org => org.persona_responsable)
                        .map((org) => (
                          <li key={`responsable-${org.rel_id}`}>
                            {org.persona_responsable} - {org.nombre}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Participantes (docentes y estudiantes) */}
            {event.participantes && event.participantes.length > 0 && (
              <div className="detail-item">
                <strong>Participantes:</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {event.participantes.map((part) => (
                    <li key={`participante-${part.usuario_id}`}>
                      {part.nombre} {part.apellido} - {part.rol} 
                      {part.programa_academico && ` (${part.programa_academico})`}
                      {part.facultad && ` - ${part.facultad}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mostrar justificación de rechazo solo al organizador del evento */}
          {event.estado === 'rechazado' && event.justificacion && event.creado_por === user?.id && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#fee2e2',
              borderLeft: '4px solid #dc2626',
              borderRadius: '4px'
            }}>
              <strong style={{ color: '#991b1b', fontSize: '16px' }}>
                Motivo del rechazo:
              </strong>
              <p style={{ 
                margin: '10px 0 0 0', 
                color: '#7f1d1d',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {event.justificacion}
              </p>
              
              {/* Botón para reenviar evento rechazado */}
              <button 
                className="btn-primary" 
                onClick={handleResubmit}
                disabled={processing}
                style={{ marginTop: '15px' }}
              >
                Reenviar a Validación
              </button>
            </div>
          )}

          {/* Botones de validación solo para SECRETARIO en eventos enviados */}
          {isSecretario() && event.estado === 'enviado' && (
            <div className="card-actions" style={{ marginTop: '20px', gap: '10px' }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowApproveModal(true)}
                disabled={processing}
              >
                Aprobar Evento
              </button>
              <button 
                className="btn-delete" 
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
              >
                Rechazar Evento
              </button>
            </div>
          )}
        </div>

        {/* Modal de Aprobación */}
        {showApproveModal && (
          <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Aprobar Evento</h2>
              <p>¿Está seguro que desea aprobar el evento "{event.nombre_evento}"?</p>
              
              <div style={{ marginTop: '15px' }}>
                <label><strong>PDF de Aprobación (Obligatorio):</strong></label>
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
                      setPdfAprobacion(file);
                    }
                  }}
                  style={{ width: '100%', marginTop: '5px', padding: '8px' }}
                  required
                />
                <small style={{ color: '#666' }}>Formatos permitidos: PDF (máximo 5MB)</small>
                {pdfAprobacion && (
                  <div style={{ marginTop: '8px', color: 'green' }}>
                    ✓ Archivo seleccionado: {pdfAprobacion.name}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '15px' }}>
                <label><strong>Justificación (opcional):</strong></label>
                <textarea
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  rows="4"
                  style={{ width: '100%', marginTop: '5px', padding: '8px' }}
                  placeholder="Añadir comentarios sobre la aprobación..."
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => { setShowApproveModal(false); setPdfAprobacion(null); }}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleApprove} disabled={processing || !pdfAprobacion}>
                  {processing ? 'Procesando...' : 'Confirmar Aprobación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Rechazo */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Rechazar Evento</h2>
              <p>¿Está seguro que desea rechazar el evento "{event.nombre_evento}"?</p>
              <div style={{ marginTop: '15px' }}>
                <label><strong>Justificación (requerida):</strong></label>
                <textarea
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  rows="4"
                  style={{ width: '100%', marginTop: '5px', padding: '8px' }}
                  placeholder="Explicar el motivo del rechazo..."
                  required
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancelar
                </button>
                <button className="btn-delete" onClick={handleReject} disabled={processing || !justificacion.trim()}>
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

export default EventDetail;




