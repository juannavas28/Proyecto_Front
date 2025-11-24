import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getStoredUser, logoutUser } from "../services/authService";
import { getPendingEvents } from "../services/eventService";
import "./MainNavbar.css";

const MainNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logoutUser();
    setShowLogoutModal(false);
  };

  const handleGoToInicio = () => {
    setShowLogoutModal(false);
    navigate("/inicio");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Función para determinar si un botón está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para determinar si estamos en una página de perfil
  const isProfilePage = () => {
    return location.pathname === '/EditarPerfil';
  };

  // Cargar contador de eventos pendientes para SECRETARIO
  useEffect(() => {
    if (user?.rol?.toUpperCase() === 'SECRETARIO') {
      getPendingEvents()
        .then(result => setPendingCount(result?.data?.total || 0))
        .catch(() => setPendingCount(0));
    }
  }, [user, location.pathname]); // Actualiza al cambiar de página

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
            className={`nav-btn ${isActive('/events') || isActive('/events/pending') ? 'active' : ''}`} 
            onClick={() => navigate("/events")}
          >
            Eventos
          </button>
          {user?.rol?.toUpperCase() === 'SECRETARIO' && (
            <button 
              className={`nav-btn ${isActive('/events/pending') ? 'active' : ''}`} 
              onClick={() => navigate("/events/pending")}
              style={{ 
                backgroundColor: isActive('/events/pending') ? '#059669' : '#10b981',
                position: 'relative'
              }}
            >
              Pendientes
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  border: '2px solid white'
                }}>
                </span>
              )}
            </button>
          )}
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
          <button className="logout-btn" onClick={handleLogoutClick}>
            Salir
          </button>
        </div>
      </div>

      {/* Modal de confirmación de salida */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={handleCancelLogout}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Qué deseas hacer?</h3>
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={handleConfirmLogout}>
                Cerrar Sesión
              </button>
              <button className="modal-btn secondary-btn" onClick={handleGoToInicio}>
                Ir al Inicio
              </button>
              <button className="modal-btn cancel-btn" onClick={handleCancelLogout}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;
