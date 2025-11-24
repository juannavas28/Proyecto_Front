import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, submitEventForValidation } from "../services/eventService";
import MainNavbar from "../components/MainNavbar";

const SubmitEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getEventById(id);
        if (result.success) {
          // backend devuelve el evento en result.data (objeto)
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const result = await submitEventForValidation(id);
      if (result.success) {
        setSuccess("✅ Evento enviado a validación");
        setTimeout(() => navigate(`/events/${id}`), 1500);
      } else {
        setError(result.message || "No fue posible enviar el evento a validación");
      }
    } catch (err) {
      setError(err.message || "Error al enviar a validación");
    } finally {
      setSubmitting(false);
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

  if (error && !event) {
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
          <h1>Enviar evento a validación</h1>
          <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>← Volver</button>
        </div>

        {event && (
          <div className="event-card">
            <div className="event-details">
              <div className="detail-item"><strong>Título:</strong> {event.nombre_evento || event.titulo}</div>
              <div className="detail-item"><strong>Estado actual:</strong> {event.estado}</div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <button className="btn-cancel" onClick={() => navigate(`/events/${id}`)} disabled={submitting}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar a Validación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitEvent;



