// src/services/authService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

// Configurar axios con interceptores para manejar tokens
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/auth`, // ✅ ajustado para mantener coherencia en endpoints /auth/*
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// HU3.2 - Autenticación de usuarios
export const loginUser = async (correo, contrasena) => {
  try {
    console.log("📤 Enviando datos de login:", { correo, contrasena });
    const response = await api.post(`/login`, { correo, contrasena }); // ✅ usa el mismo api con interceptor
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU3.1 - Registro de usuarios
export const registerUser = async (userData) => {
  const payload = {
    email: userData.correo,
    password: userData.contrasena,
    nombre: userData.nombre,
    apellido: userData.apellido || null,
    telefono: userData.telefono || null,
    rol: userData.rol || 'organizador',
  };
  const resp = await api.post(`/register`, payload);
  return resp.data;
};


// HU3.3 - Obtener información del usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get(`/me`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU3.4 - Recuperación de credenciales
export const forgotPassword = async (correo) => {
  try {
    const response = await api.post(`/forgot-password`, { email: correo });
    return response.data;
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU3.3 - Actualizar perfil de usuario
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put(`/profile`, profileData);
    if (response.data.success) {
      // Actualizar el usuario en localStorage con los nuevos datos
      const updatedUser = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// HU3.5 - Cierre de sesión
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Obtener usuario del localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export default api;
