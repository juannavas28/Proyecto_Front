// src/pages/Organizations.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOrganizations, searchOrganizations, createOrganization, deleteOrganization } from "../services/organizationService";
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
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, orgId: null, orgName: "" });
  const [showDeleteList, setShowDeleteList] = useState(false);
  const [newOrg, setNewOrg] = useState({
    nombre: "",
    nit: "",
    representante_legal: "",
    telefono: "",
    email: "",
    ubicacion: "",
    actividad_principal: "",
    tipo_organizacion: ""
  });
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
      // Si el término es sólo dígitos, buscar por NIT, sino por nombre
      const term = searchTerm.trim();
      const isNit = /^\d+$/.test(term);
      const params = isNit ? { nit: term } : { nombre: term };
      const result = await searchOrganizations(params);
      
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
    if (!user || !user.rol) return false;
    const rol = user.rol.toUpperCase();
    return rol === 'SECRETARIO' || rol === 'ADMINISTRADOR';
  };

  const handleDeleteClick = (orgId, orgName) => {
    setDeleteModal({ show: true, orgId, orgName });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteOrganization(deleteModal.orgId);
      
      if (result.success) {
        setOrganizations(organizations.filter(org => org.id !== deleteModal.orgId));
        setDeleteModal({ show: false, orgId: null, orgName: "" });
      } else {
        // Mostrar el mensaje específico del backend
        setError(result.message || "Error al eliminar la organización");
      }
    } catch (err) {
      // Mostrar el mensaje de error del backend si está disponible
      const errorMessage = err.response?.data?.message || err.message || "Error al eliminar la organización";
      setError(errorMessage);
      console.error('Error eliminando organización:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, orgId: null, orgName: "" });
  };

  return (
    <div className="organizations-container">
      <MainNavbar />
      
      <div className="organizations-content content-with-navbar">
        <div className="organizations-header">
        <h1>Organizaciones Externas</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => setShowCreateOrg(s => !s)}>
            {showCreateOrg ? 'Cancelar' : 'Crear Organización'}
          </button>
          {canManageOrganizations() && (
            <button className="btn-delete" onClick={() => setShowDeleteList(true)}>
              Eliminar Organizaciones
            </button>
          )}
        </div>
      </div>

      {showCreateOrg && (
        <div className="inline-create-organization">
          <h2>Crear Organización</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              // Validación de campos obligatorios
              if (!newOrg.nombre || !newOrg.nombre.trim()) {
                setError('El nombre de la organización es obligatorio');
                setLoading(false);
                return;
              }
              if (!newOrg.nit || !newOrg.nit.trim()) {
                setError('El NIT es obligatorio');
                setLoading(false);
                return;
              }
              if (!newOrg.representante_legal || !newOrg.representante_legal.trim()) {
                setError('El representante legal es obligatorio');
                setLoading(false);
                return;
              }
              if (!newOrg.email || !newOrg.email.trim()) {
                setError('El email es obligatorio');
                setLoading(false);
                return;
              }
              if (!newOrg.telefono || !newOrg.telefono.trim()) {
                setError('El teléfono es obligatorio');
                setLoading(false);
                return;
              }
              
              const formData = new FormData();
              Object.keys(newOrg).forEach(key => { if (newOrg[key]) formData.append(key, newOrg[key]); });
              const res = await createOrganization(formData);
              if (res.success && res.data && res.data.organization) {
                // add new org to list and hide form
                setOrganizations(prev => [res.data.organization, ...prev]);
                setShowCreateOrg(false);
                setNewOrg({ nombre: '', nit: '', representante_legal: '', telefono: '', email: '', ubicacion: '', actividad_principal: '', tipo_organizacion: '' });
              } else {
                setError(res.message || 'No fue posible crear la organización');
              }
            } catch (err) {
              console.error('Error creando organización desde Organizations:', err);
              setError(err.message || 'Error al crear organización');
            } finally {
              setLoading(false);
            }
          }} className="org-inline-form">
            <div className="form-row">
              <div className="form-group"><label>Nombre *</label><input name="nombre" value={newOrg.nombre} onChange={(e)=>setNewOrg({...newOrg, nombre: e.target.value})} required /></div>
              <div className="form-group"><label>NIT *</label><input name="nit" value={newOrg.nit} onChange={(e)=>setNewOrg({...newOrg, nit: e.target.value})} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Representante Legal *</label><input name="representante_legal" value={newOrg.representante_legal} onChange={(e)=>setNewOrg({...newOrg, representante_legal: e.target.value})} required /></div>
              <div className="form-group"><label>Email *</label><input name="email" type="email" value={newOrg.email} onChange={(e)=>setNewOrg({...newOrg, email: e.target.value})} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Teléfono *</label><input name="telefono" value={newOrg.telefono} onChange={(e)=>setNewOrg({...newOrg, telefono: e.target.value})} required /></div>
              <div className="form-group"><label>Ubicación</label><input name="ubicacion" value={newOrg.ubicacion} onChange={(e)=>setNewOrg({...newOrg, ubicacion: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Actividad Principal</label><input name="actividad_principal" value={newOrg.actividad_principal} onChange={(e)=>setNewOrg({...newOrg, actividad_principal: e.target.value})} /></div>
              <div className="form-group"><label>Tipo</label><select name="tipo_organizacion" value={newOrg.tipo_organizacion} onChange={(e)=>setNewOrg({...newOrg, tipo_organizacion: e.target.value})}><option value="">Seleccionar</option><option value="ENTIDAD">Entidad</option><option value="EMPRESA">Empresa</option><option value="ONG">ONG</option><option value="OTRA">Otra</option></select></div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Crear Organización'}</button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      )}

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

      {/* Modal de lista para eliminar organizaciones */}
      {showDeleteList && (
        <div className="modal-overlay" onClick={() => setShowDeleteList(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Organización a Eliminar</h3>
            <p>Selecciona la organización que deseas eliminar</p>
            <div className="delete-list">
              {organizations.length === 0 ? (
                <p>No hay organizaciones disponibles</p>
              ) : (
                organizations.map((org) => (
                  <div key={org.id} className="delete-list-item">
                    <div className="org-info">
                      <strong>{org.nombre}</strong>
                      <span>{org.representante_legal}</span>
                    </div>
                    <button 
                      className="btn-delete-item" 
                      onClick={() => {
                        setShowDeleteList(false);
                        handleDeleteClick(org.id, org.nombre);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={() => setShowDeleteList(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar organización?</h3>
            <p>¿Estás seguro de que deseas eliminar la organización <strong>{deleteModal.orgName}</strong>?</p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={handleConfirmDelete}>
                Eliminar
              </button>
              <button className="modal-btn cancel-btn" onClick={handleCancelDelete}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {/* Editar y Eliminar: el creador o el secretario */}
                    {(org.creado_por === user?.id || user?.rol?.toUpperCase() === 'SECRETARIO') && (
                      <>
                        <Link to={`/organizations/${org.id}/edit`} className="btn-outline">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(org.id, org.nombre)} 
                          className="btn-delete"
                        >
                          Eliminar
                        </button>
                      </>
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
