import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getStoredUser, logoutUser } from "../services/authService";
import "./MainNavbar.css";

const MainNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const handleLogout = () => {
    logoutUser();
  };

  // Función para determinar si un botón está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para determinar si estamos en una página de perfil
  const isProfilePage = () => {
    return location.pathname === '/EditarPerfil';
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        {/* Lado izquierdo - Navegación principal */}
        <div className="nav-left">
          <button 
            className={`nav-btn ${isActive('/inicio') ? 'active' : ''}`} 
            onClick={() => navigate("/inicio")}
          >
            Inicio
          </button>
          <button 
            className={`nav-btn ${isActive('/organizations') ? 'active' : ''}`} 
            onClick={() => navigate("/organizations")}
          >
            Organizaciones
          </button>
          <button 
            className={`nav-btn ${isActive('/events') ? 'active' : ''}`} 
            onClick={() => navigate("/events")}
          >
            Eventos
          </button>
        </div>

        {/* Lado derecho - Información del usuario */}
        <div className="nav-right">
          <span className="user-info">
            Hola, {user?.nombre} ({user?.rol})
          </span>
          <img
            src="./campana.png"
            alt="Notificaciones"
            className="icon"
          />
          <img
            src="./perfil.png"
            alt="Perfil"
            className={`profile-img ${isProfilePage() ? 'active' : ''}`}
            onClick={() => navigate("/EditarPerfil")}
          />
          <button className="logout-btn" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
