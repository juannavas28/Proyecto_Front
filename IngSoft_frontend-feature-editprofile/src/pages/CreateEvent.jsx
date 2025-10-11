// src/pages/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/eventService";
import { getAllOrganizations } from "../services/organizationService";
import { getStoredUser } from "../services/authService";
import "./CreateEvent.css";

const CreateEvent = () => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "academico",
    fecha_inicio: "",
    fecha_fin: "",
    lugar: "",
    unidad_academica_id: "",
    organizacion_externa_id: "",
    aval_pdf: null,
    acta_comite_pdf: null
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const result = await getAllOrganizations(1, 100); // Cargar todas las organizaciones
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
    setForm({ ...form, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación
    if (!form.titulo || !form.descripcion || !form.fecha_inicio || !form.fecha_fin || !form.lugar) {
      setError("Los campos título, descripción, fechas y lugar son obligatorios");
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
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("descripcion", form.descripcion);
      formData.append("tipo", form.tipo);
      formData.append("fecha_inicio", form.fecha_inicio);
      formData.append("fecha_fin", form.fecha_fin);
      formData.append("lugar", form.lugar);
      
      if (form.unidad_academica_id) {
        formData.append("unidad_academica_id", form.unidad_academica_id);
      }
      if (form.organizacion_externa_id) {
        formData.append("organizacion_externa_id", form.organizacion_externa_id);
      }
      if (form.aval_pdf) {
        formData.append("aval_pdf", form.aval_pdf);
      }
      if (form.acta_comite_pdf) {
        formData.append("acta_comite_pdf", form.acta_comite_pdf);
      }

      const result = await createEvent(formData);

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
            <label htmlFor="titulo">Título del Evento *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={form.titulo}
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
            <label htmlFor="lugar">Lugar *</label>
            <input
              type="text"
              id="lugar"
              name="lugar"
              value={form.lugar}
              onChange={handleChange}
              required
              placeholder="Ej: Auditorio Principal, Universidad"
            />
          </div>
          <div className="form-group">
            <label htmlFor="organizacion_externa_id">Organización Externa</label>
            <select
              id="organizacion_externa_id"
              name="organizacion_externa_id"
              value={form.organizacion_externa_id}
              onChange={handleChange}
              disabled={loadingOrgs}
            >
              <option value="">Seleccionar organización (opcional)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

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
          <div className="form-group">
            <label htmlFor="acta_comite_pdf">Acta de Comité PDF (Opcional)</label>
            <input
              type="file"
              id="acta_comite_pdf"
              name="acta_comite_pdf"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <small>Acta de aprobación del comité</small>
          </div>
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
