// src/pages/Events.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEventsByStatus, deleteEvent } from "../services/eventService";
import { getStoredUser } from "../services/authService";
import MainNavbar from "../components/MainNavbar";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(""); // borrador, enviado, aprobado, rechazado
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showDeleteList, setShowDeleteList] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, eventId: null, eventName: "" });
  const user = getStoredUser();

  useEffect(() => {
    loadEvents();
  }, [currentPage, filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getEventsByStatus(filter || null, currentPage, 10);
      
      if (result.success) {
        setEvents(result.data.events);
        setPagination(result.data.pagination);
      }
    } catch (err) {
      setError("Error al cargar los eventos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'borrador': return 'status-draft';
      case 'enviado': return 'status-sent';
      case 'aprobado': return 'status-approved';
      case 'rechazado': return 'status-rejected';
      default: return 'status-draft';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'enviado': return 'Enviado';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canManageEvents = () => {
    // Todos los usuarios autenticados pueden gestionar (eliminar) sus propios eventos
    return user && user.id;
  };

  const handleDeleteClick = (eventId, eventName) => {
    setDeleteModal({ show: true, eventId, eventName });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteEvent(deleteModal.eventId);
      
      if (result.success) {
        setEvents(events.filter(evt => evt.id !== deleteModal.eventId));
        setDeleteModal({ show: false, eventId: null, eventName: "" });
      } else {
        setError(result.message || "Error al eliminar el evento");
      }
    } catch (err) {
      setError("Error al eliminar el evento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, eventId: null, eventName: "" });
  };

  return (
    <div className="events-container">
      <MainNavbar />
      
      <div className="events-content content-with-navbar">
        <div className="events-header">
        <h1>Eventos</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/events/create" className="btn-primary">
            Crear Evento
          </Link>
          {canManageEvents() && (
            <button className="btn-delete" onClick={() => setShowDeleteList(true)}>
              Eliminar Eventos
            </button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={filter === "" ? "btn-filter active" : "btn-filter"}
            onClick={() => setFilter("")}
          >
            Todos
          </button>
          <button
            className={filter === "borrador" ? "btn-filter active" : "btn-filter"}
            onClick={() => setFilter("borrador")}
          >
            Borradores
          </button>
          <button
            className={filter === "enviado" ? "btn-filter active" : "btn-filter"}
            onClick={() => setFilter("enviado")}
          >
            Enviados
          </button>
          <button
            className={filter === "aprobado" ? "btn-filter active" : "btn-filter"}
            onClick={() => setFilter("aprobado")}
          >
            Aprobados
          </button>
          <button
            className={filter === "rechazado" ? "btn-filter active" : "btn-filter"}
            onClick={() => setFilter("rechazado")}
          >
            Rechazados
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando eventos...</div>
      ) : (
        <>
          <div className="events-grid">
            {events.length === 0 ? (
              <div className="no-data">
                No se encontraron eventos
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                        <h3>{event.nombre_evento || event.titulo}</h3>
                    <span className={`status-badge ${getStatusColor(event.estado)}`}>
                      {getStatusText(event.estado)}
                    </span>
                  </div>
                  
                  <p className="event-description">{event.descripcion}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <strong>Tipo:</strong> {event.tipo === 'academico' ? 'Académico' : 'Lúdico'}
                    </div>
                    <div className="detail-item">
                      <strong>Fecha:</strong> {formatDate(event.fecha_inicio)} - {formatDate(event.fecha_fin)}
                    </div>
                    <div className="detail-item">
                      <strong>Lugar:</strong> {event.ubicacion || event.lugar}
                    </div>
                    {event.organizador_nombre && (
                      <div className="detail-item">
                        <strong>Organizador:</strong> {event.organizador_nombre}
                      </div>
                    )}
                    {event.organizacion_nombre && (
                      <div className="detail-item">
                        <strong>Organización:</strong> {event.organizacion_nombre}
                      </div>
                    )}
                  </div>

                  {/* Mostrar justificación si el evento fue rechazado y el usuario es el creador */}
                  {event.estado === 'rechazado' && event.creado_por === user?.id && event.justificacion && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: '#fee2e2', 
                      borderLeft: '4px solid #dc2626',
                      borderRadius: '4px'
                    }}>
                      <strong style={{ color: '#991b1b' }}>Motivo del rechazo:</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#7f1d1d' }}>{event.justificacion}</p>
                    </div>
                  )}

                  <div className="card-actions">
                    <Link to={`/events/${event.id}`} className="btn-secondary">
                      Ver Detalles
                    </Link>
                    {/* Editar solo si el usuario es el creador y el estado es borrador o rechazado */}
                    {event.creado_por === user?.id && (event.estado === 'borrador' || event.estado === 'rechazado') && (
                      <Link to={`/events/${event.id}/edit`} className="btn-outline">
                        Editar
                      </Link>
                    )}
                    {/* Enviar a validación solo si el usuario es el creador y el estado es borrador */}
                    {event.creado_por === user?.id && event.estado === 'borrador' && (
                      <Link to={`/events/${event.id}/submit`} className="btn-primary">
                        Enviar a Validación
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {currentPage} de {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="btn-pagination"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

        {/* Modal de lista para eliminar eventos */}
        {showDeleteList && (
        <div className="modal-overlay" onClick={() => setShowDeleteList(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Evento a Eliminar</h3>
            <p>Solo puedes eliminar tus propios eventos en estado borrador o rechazado</p>
            <div className="delete-list">
              {events.filter(e => e.creado_por === user?.id && (e.estado === 'borrador' || e.estado === 'rechazado')).length === 0 ? (
                <p>No tienes eventos en borrador o rechazados disponibles para eliminar</p>
              ) : (
                events
                  .filter(event => event.creado_por === user?.id && (event.estado === 'borrador' || event.estado === 'rechazado'))
                  .map((event) => (
                  <div key={event.id} className="delete-list-item">
                    <div className="org-info">
                      <strong>{event.nombre_evento}</strong>
                      <span>{event.tipo === 'ACADEMICO' ? 'Académico' : 'Lúdico'} - {formatDate(event.fecha_inicio)} - Estado: {getStatusText(event.estado)}</span>
                    </div>
                    <button 
                      className="btn-delete-item" 
                      onClick={() => {
                        setShowDeleteList(false);
                        handleDeleteClick(event.id, event.nombre_evento);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={() => setShowDeleteList(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Modal de confirmación de eliminación */}
        {deleteModal.show && (
          <div className="modal-overlay" onClick={handleCancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>¿Eliminar evento?</h3>
              <p>¿Estás seguro de que deseas eliminar el evento <strong>{deleteModal.eventName}</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
              <div className="modal-buttons">
                <button className="modal-btn confirm-btn" onClick={handleConfirmDelete}>
                  Eliminar
                </button>
                <button className="modal-btn cancel-btn" onClick={handleCancelDelete}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Events;
