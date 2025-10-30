// src/pages/Events.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEventsByStatus } from "../services/eventService";
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

  return (
    <div className="events-container">
      <MainNavbar />
      
      <div className="events-content content-with-navbar">
        <div className="events-header">
        <h1>Eventos</h1>
        <Link to="/events/create" className="btn-primary">
          Crear Evento
        </Link>
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
                    <h3>{event.titulo}</h3>
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
                      <strong>Lugar:</strong> {event.lugar}
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

                  <div className="card-actions">
                    <Link to={`/events/${event.id}`} className="btn-secondary">
                      Ver Detalles
                    </Link>
                    {(event.estado === 'borrador' || event.estado === 'rechazado') && (
                      <Link to={`/events/${event.id}/edit`} className="btn-outline">
                        Editar
                      </Link>
                    )}
                    {event.estado === 'borrador' && (
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
      </div>
    </div>
  );
};

export default Events;
