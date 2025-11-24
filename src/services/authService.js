// src/services/authService.js
import axios from "axios";

// Fallback robusto para la URL del backend
const API_BASE = (import.meta?.env?.VITE_API_URL)
  || (typeof window !== 'undefined' && window.__API_URL__)
  || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/auth`;

// Configurar axios con interceptores para manejar tokens
const api = axios.create({
  baseURL: API_URL,
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
  (error) => Promise.reject(error)
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

//
// 🔹 HU3.1 - Registro de usuarios
//
export const registerUser = async (userData) => {
  try {
    const payload = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      correo: userData.correo,
      telefono: userData.telefono,
      contraseña: userData.contrasena,
      // El backend espera un campo 'rol' como texto (DOCENTE | ESTUDIANTE | SECRETARIO)
      rol: (function() {
        if (userData.rol) return String(userData.rol).toUpperCase();
        const map = { 1: 'ESTUDIANTE', 2: 'DOCENTE', 3: 'SECRETARIO' };
        return map[userData.rol_id] || 'ESTUDIANTE';
      })(),
    };

    console.log("📤 Enviando datos de registro:", payload);
    const resp = await api.post("/register", payload);
    return resp.data;
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

//
// 🔹 HU3.2 - Autenticación de usuarios
//
export const loginUser = async (correo, contrasena) => {
  try {
    console.log("📤 Enviando datos de login:", { correo, contrasena });
    const response = await api.post("/login", { correo, contraseña: contrasena });

    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

//
// 🔹 HU3.3 - Obtener información del usuario actual
//
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

//
// 🔹 HU3.4 - Recuperación de credenciales
//
export const forgotPassword = async (correo) => {
  try {
    // Ruta en el backend: /forgot-password (alias ASCII) — backend también acepta /forgot-contraseña
    const response = await api.post("/forgot-password", { correo });
    return response.data;
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

export const resetPassword = async (token, nuevaContraseña) => {
  try {
    // Ruta en el backend: /reset-password (alias ASCII)
    const response = await api.post("/reset-password", { token, nuevaContraseña });
    return response.data;
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

//
// 🔹 HU3.3 - Actualizar perfil de usuario
//
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/profile", profileData);
    if (response.data.success) {
      const updatedUser = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error.response?.data || { message: "Error al conectar con el servidor" };
  }
};

// Cambiar contraseña para usuario autenticado
export const changePassword = async (currentPassword, nuevaContraseña) => {
  try {
    const response = await api.put('/profile/password', { currentPassword, nuevaContraseña });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error.response?.data || { message: 'Error al conectar con el servidor' };
  }
};

//
// 🔹 HU3.5 - Cierre de sesión
//
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

//
// 🔹 Utilidades
//
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export default api;
