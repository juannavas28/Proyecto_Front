// src/services/eventService.js
import axios from "axios";

// ✅ Configuración de API para eventos con fallback VITE_API_URL
const API_BASE = (import.meta?.env?.VITE_API_URL)
  || (typeof window !== 'undefined' && window.__API_URL__)
  || 'http://localhost:3000';
const api = axios.create({
  baseURL: `${API_BASE}/api/events`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para agregar token (usando el mismo esquema del authService)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// HU1.1 - Registro de evento
export const createEvent = async (eventData) => {
  try {
    // Soportar FormData (archivos) y objetos planos
    if (eventData instanceof FormData) {
      // Normalizar clave 'titulo' -> 'nombre_evento' si existe
      if (eventData.has('titulo') && !eventData.has('nombre_evento')) {
        const val = eventData.get('titulo');
        eventData.delete('titulo');
        eventData.append('nombre_evento', val);
      }
      const response = await api.post("/", eventData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    // objeto plano
    const payload = { ...eventData };
    if (payload.titulo && !payload.nombre_evento) {
      payload.nombre_evento = payload.titulo;
      delete payload.titulo;
    }
    const response = await api.post("/", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear evento:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    if (error.response?.data?.errors) {
      console.error("📋 Errores detallados:", error.response.data.errors);
    }
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU1.2 - Edición de evento antes de validación
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/${id}`, eventData); // ✅ ajustado
    return response.data;
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU1.5 - Envío de evento a validación/aprobación
export const submitEventForValidation = async (id) => {
  try {
    // Ruta en el backend: POST /:id/enviar
    const response = await api.post(`/${id}/enviar`);
    return response.data;
  } catch (error) {
    console.error("Error al enviar evento a validación:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener evento por ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/${id}`); // ✅ simplificado
    return response.data;
  } catch (error) {
    console.error("Error al obtener evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener eventos por estado con paginación
export const getEventsByStatus = async (estado = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    if (estado) params.estado = estado;
    
    const response = await api.get("/", { params }); // ✅ baseURL ya maneja /events
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener todos los eventos del usuario actual
export const getUserEvents = async (page = 1, limit = 10) => {
  try {
    // En el backend el endpoint para eventos del usuario es GET /mis
    const response = await api.get(`/mis`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos del usuario:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Eliminar evento
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Aprobar evento (SECRETARIO) - Requiere PDF
export const approveEvent = async (id, justificacion = "", pdfFile = null) => {
  try {
    const formData = new FormData();
    formData.append('justificacion', justificacion);
    
    if (pdfFile) {
      formData.append('pdf_aprobacion', pdfFile);
    }

    const response = await api.post(`/${id}/aprobar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Error al aprobar evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Rechazar evento (SECRETARIO)
export const rejectEvent = async (id, justificacion) => {
  try {
    const response = await api.post(`/${id}/rechazar`, { justificacion });
    return response.data;
  } catch (error) {
    console.error("Error al rechazar evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener eventos pendientes de evaluación (SECRETARIO)
export const getPendingEvents = async () => {
  try {
    const response = await api.get("/pendientes");
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos pendientes:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};
