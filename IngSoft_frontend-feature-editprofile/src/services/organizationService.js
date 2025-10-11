// src/services/organizationService.js
import api from "./authService";

// HU2.1 - Registro de organización externa
export const createOrganization = async (organizationData) => {
  try {
    const response = await api.post("/organizations", organizationData);
    return response.data;
  } catch (error) {
    console.error("Error al crear organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.2 - Búsqueda de organización externa
export const searchOrganizations = async (searchParams) => {
  try {
    const response = await api.get("/organizations/search", { params: searchParams });
    return response.data;
  } catch (error) {
    console.error("Error al buscar organizaciones:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.3 - Visualización de datos de organización externa
export const getOrganizationById = async (id) => {
  try {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.4 - Edición de organización externa
export const updateOrganization = async (id, organizationData) => {
  try {
    const response = await api.put(`/organizations/${id}`, organizationData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Obtener todas las organizaciones con paginación
export const getAllOrganizations = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/organizations", {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener organizaciones:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};
