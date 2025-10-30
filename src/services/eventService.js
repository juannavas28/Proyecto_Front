// src/services/eventService.js
import axios from "axios";

// ✅ Configuración de API para eventos (usa variable de entorno)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/events`,
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
    const response = await api.post("/", eventData); // ✅ ya no repite /events
    return response.data;
  } catch (error) {
    console.error("Error al crear evento:", error);
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
    const response = await api.post(`/${id}/submit-validation`); // ✅ ruta coherente
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
    const response = await api.get("/", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos del usuario:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};
