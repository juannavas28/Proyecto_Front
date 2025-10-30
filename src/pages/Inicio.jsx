import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Inicio.css";
import MainNavbar from "../components/MainNavbar";
import { getEventsByStatus } from "../services/eventService";

const Inicio = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Cargar todos los eventos (o solo aprobados si prefieres)
      const result = await getEventsByStatus(null, 1, 20);
      
      if (result.success) {
        setEvents(result.data.events);
      }
    } catch (err) {
      setError("Error al cargar los eventos");
      console.error(err);
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

  return (
    <div className="main-container">
      <MainNavbar />

      {/* Contenido principal */}
      <div className="content content-with-navbar">
        <h1>Nuestra agenda de eventos</h1>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Cargando eventos...</div>
        ) : (
          <div className="cards">
            {events.length === 0 ? (
              <div className="no-events">
                <p>No hay eventos disponibles en este momento</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="card">
                  <div className="card-header">
                    <h3>{event.titulo}</h3>
                  </div>
                  <div className="card-content">
                    <p className="event-description">{event.descripcion}</p>
                    <div className="event-info">
                      <p><strong>Tipo:</strong> {event.tipo === 'academico' ? 'Académico' : 'Lúdico'}</p>
                      <p><strong>Fecha:</strong> {formatDate(event.fecha_inicio)}</p>
                      <p><strong>Lugar:</strong> {event.lugar}</p>
                    </div>
                    <Link to={`/events/${event.id}`} className="btn-ver-detalles">
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;
