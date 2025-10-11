// src/pages/Organizations.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOrganizations, searchOrganizations } from "../services/organizationService";
import { getStoredUser } from "../services/authService";
import MainNavbar from "../components/MainNavbar";
import "./Organizations.css";

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const user = getStoredUser();

  useEffect(() => {
    loadOrganizations();
  }, [currentPage]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const result = await getAllOrganizations(currentPage, 10);
      
      if (result.success) {
        setOrganizations(result.data.organizations);
        setPagination(result.data.pagination);
      }
    } catch (err) {
      setError("Error al cargar las organizaciones");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadOrganizations();
      return;
    }

    try {
      setLoading(true);
      const result = await searchOrganizations({ nombre: searchTerm });
      
      if (result.success) {
        setOrganizations(result.data.organizations);
        setPagination({ total: result.data.total });
      }
    } catch (err) {
      setError("Error al buscar organizaciones");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canManageOrganizations = () => {
    return user && ['secretario', 'administrador'].includes(user.rol);
  };

  return (
    <div className="organizations-container">
      <MainNavbar />
      
      <div className="organizations-content content-with-navbar">
        <div className="organizations-header">
        <h1>Organizaciones Externas</h1>
        {canManageOrganizations() && (
          <Link to="/organizations/create" className="btn-primary">
            Crear Organización
          </Link>
        )}
      </div>

      <div className="search-section">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">
            Buscar
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando organizaciones...</div>
      ) : (
        <>
          <div className="organizations-grid">
            {organizations.length === 0 ? (
              <div className="no-data">
                No se encontraron organizaciones
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="organization-card">
                  <h3>{org.nombre}</h3>
                  <p><strong>Representante:</strong> {org.representante_legal}</p>
                  {org.telefono && <p><strong>Teléfono:</strong> {org.telefono}</p>}
                  {org.ubicacion && <p><strong>Ubicación:</strong> {org.ubicacion}</p>}
                  {org.sector_economico && (
                    <p><strong>Sector:</strong> {org.sector_economico}</p>
                  )}
                  <div className="card-actions">
                    <Link to={`/organizations/${org.id}`} className="btn-secondary">
                      Ver Detalles
                    </Link>
                    {canManageOrganizations() && (
                      <Link to={`/organizations/${org.id}/edit`} className="btn-outline">
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {currentPage} de {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="btn-pagination"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Organizations;
