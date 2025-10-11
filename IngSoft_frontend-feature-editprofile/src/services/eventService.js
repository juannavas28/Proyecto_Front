// src/services/eventService.js
import api from "./authService";

// HU1.1 - Registro de evento
export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/events", eventData);
    return response.data;
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU1.2 - Edición de evento antes de validación
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU1.5 - Envío de evento a validación/aprobación
export const submitEventForValidation = async (id) => {
  try {
    const response = await api.post(`/events/${id}/submit-validation`);
    return response.data;
  } catch (error) {
    console.error("Error al enviar evento a validación:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener evento por ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
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
    
    const response = await api.get("/events", { params });
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener todos los eventos del usuario actual
export const getUserEvents = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/events", {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos del usuario:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};
