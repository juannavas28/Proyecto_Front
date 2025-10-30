import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrganizationById } from "../services/organizationService";
import MainNavbar from "../components/MainNavbar";
import "./OrganizationDetail.css";

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrganization();
  }, [id]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const result = await getOrganizationById(id);
      
      if (result.success) {
        setOrganization(result.data.organization);
      } else {
        setError(result.message || "Error al cargar la organización");
      }
    } catch (err) {
      setError("Error al cargar los datos de la organización");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="organization-detail-container">
        <MainNavbar />
        <div className="organization-detail-content content-with-navbar">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Cargando información de la organización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organization-detail-container">
        <MainNavbar />
        <div className="organization-detail-content content-with-navbar">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/organizations")} className="btn-primary">
              Volver a Organizaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="organization-detail-container">
        <MainNavbar />
        <div className="organization-detail-content content-with-navbar">
          <div className="no-data">
            <h2>Organización no encontrada</h2>
            <p>La organización que buscas no existe o ha sido eliminada.</p>
            <button onClick={() => navigate("/organizations")} className="btn-primary">
              Volver a Organizaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-detail-container">
      <MainNavbar />
      
      <div className="organization-detail-content content-with-navbar">
        {/* Header con navegación */}
        <div className="detail-header">
          <div className="header-left">
            <div className="breadcrumb">
              <Link to="/organizations" className="breadcrumb-link">
                Organizaciones
              </Link>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{organization.nombre}</span>
            </div>
            <Link to="/organizations" className="btn-back">
              ← Volver a Organizaciones
            </Link>
          </div>
        </div>

        {/* Información principal */}
        <div className="organization-detail-card">
          <div className="card-header">
            <h1>{organization.nombre}</h1>
            <div className="organization-badges">
              <span className="badge-sector">{organization.sector_economico}</span>
              <span className="badge-registered">
                Registrado: {formatDate(organization.fecha_registro)}
              </span>
            </div>
          </div>

          <div className="card-content">
            <div className="info-grid">
              {/* Información básica */}
              <div className="info-section">
                <h3>Información Básica</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Representante Legal:</label>
                    <span>{organization.representante_legal}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>{organization.telefono || 'No especificado'}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Sector Económico:</label>
                    <span>{organization.sector_economico || 'No especificado'}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Actividad Principal:</label>
                    <span>{organization.actividad_principal || 'No especificada'}</span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="info-section">
                <h3>Ubicación</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Dirección:</label>
                    <span>{organization.ubicacion || 'No especificada'}</span>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="info-section">
                <h3>Documentos</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Certificado:</label>
                    <span>
                      {organization.certificado_pdf ? (
                        <a 
                          href={`/uploads/${organization.certificado_pdf}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          📄 Ver certificado
                        </a>
                      ) : (
                        'No disponible'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botón de editar integrado en el contenido */}
            <div className="info-edit-button">
              <Link to={`/organizations/${id}/edit`} className="btn-edit">
                ✏️ Editar Organización
              </Link>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="contact-section">
          <h2>Información de Contacto</h2>
          <div className="contact-card">
            <div className="contact-item">
              <span className="contact-icon">👤</span>
              <div className="contact-info">
                <label>Representante Legal</label>
                <span>{organization.representante_legal}</span>
              </div>
            </div>
            
            {organization.telefono && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-info">
                  <label>Teléfono</label>
                  <a href={`tel:${organization.telefono}`} className="contact-link">
                    {organization.telefono}
                  </a>
                </div>
              </div>
            )}
            
            {organization.ubicacion && (
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div className="contact-info">
                  <label>Ubicación</label>
                  <span>{organization.ubicacion}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetail;
