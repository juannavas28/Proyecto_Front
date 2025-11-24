import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../services/eventService";
import MainNavbar from "../components/MainNavbar";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre_evento: "",
    descripcion: "",
    tipo: "academico",
    fecha_inicio: "",
    fecha_fin: "",
    ubicacion: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getEventById(id);
        if (result.success) {
          const ev = result.data;
          setForm({
            nombre_evento: ev.nombre_evento || ev.titulo || "",
            descripcion: ev.descripcion || "",
            tipo: ev.tipo || "academico",
            fecha_inicio: ev.fecha_inicio?.slice(0, 10) || "",
            fecha_fin: ev.fecha_fin?.slice(0, 10) || "",
            ubicacion: ev.ubicacion || ev.lugar || "",
          });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre_evento || !form.descripcion || !form.fecha_inicio || !form.fecha_fin || !form.ubicacion) {
      setError("Los campos título, descripción, fechas y lugar son obligatorios");
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
        ubicacion: form.ubicacion
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

          <div className="form-group">
            <label htmlFor="ubicacion">Lugar *</label>
            <input id="ubicacion" name="ubicacion" value={form.ubicacion} onChange={handleChange} />
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




