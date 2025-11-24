// src/services/organizationService.js
import axios from "axios";

// ✅ Configurar axios con la variable de entorno con fallback
const API_BASE = (import.meta?.env?.VITE_API_URL)
  || (typeof window !== 'undefined' && window.__API_URL__)
  || 'http://localhost:3000';
const api = axios.create({
  baseURL: `${API_BASE}/api/organizations`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para agregar token automáticamente
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

// HU2.1 - Registro de organización externa
export const createOrganization = async (organizationData) => {
  try {
    // Si ya viene como FormData, enviarlo directamente
    const isFormData = organizationData instanceof FormData;
    
    let dataToSend = organizationData;
    let headers = {};

    if (isFormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await api.post("/", dataToSend, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al crear organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.2 - Búsqueda de organización externa
export const searchOrganizations = async (searchParams) => {
  try {
    const response = await api.get("/search", { params: searchParams }); // ✅ simplificado
    return response.data;
  } catch (error) {
    console.error("Error al buscar organizaciones:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.3 - Visualización de datos de organización externa
export const getOrganizationById = async (id) => {
  try {
    const response = await api.get(`/${id}`); // ✅ ajustado
    return response.data;
  } catch (error) {
    console.error("Error al obtener organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.4 - Edición de organización externa
export const updateOrganization = async (id, organizationData) => {
  try {
    // 🔹 También permitimos actualización con PDF
    const hasFile = organizationData.certificado_pdf instanceof File;

    let dataToSend = organizationData;
    let headers = {};

    if (hasFile) {
      const formData = new FormData();
      Object.keys(organizationData).forEach((key) => {
        formData.append(key, organizationData[key]);
      });
      dataToSend = formData;
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await api.put(`/${id}`, dataToSend, { headers }); // ✅ ajustado
    return response.data;
  } catch (error) {
    console.error("Error al actualizar organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.5 - Listar todas las organizaciones externas
export const getAllOrganizations = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/", { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las organizaciones:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU2.6 - Eliminar organización externa
export const deleteOrganization = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar organización:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};
