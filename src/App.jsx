import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Olvidar from "./pages/Olvidar";
import Inicio from "./pages/Inicio";
import EditarPerfil from "./pages/EditarPerfil";
import Organizations from "./pages/Organizations";
import CreateOrganization from "./pages/CreateOrganization";
import OrganizationDetail from "./pages/OrganizationDetail";
import EditOrganization from "./pages/EditOrganization";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import { isAuthenticated } from "./services/authService";

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/olvidar" element={<Olvidar />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/inicio" 
        element={
          <ProtectedRoute>
            <Inicio />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/EditarPerfil" 
        element={
          <ProtectedRoute>
            <EditarPerfil />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas de Organizaciones */}
      <Route 
        path="/organizations" 
        element={
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizations/create" 
        element={
          <ProtectedRoute>
            <CreateOrganization />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizations/:id" 
        element={
          <ProtectedRoute>
            <OrganizationDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizations/:id/edit" 
        element={
          <ProtectedRoute>
            <EditOrganization />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas de Eventos */}
      <Route 
        path="/events" 
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/events/create" 
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/events/:id" 
        element={
          <ProtectedRoute>
            <div>Ver Evento (Por implementar)</div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/events/:id/edit" 
        element={
          <ProtectedRoute>
            <div>Editar Evento (Por implementar)</div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/events/:id/submit" 
        element={
          <ProtectedRoute>
            <div>Enviar Evento a Validación (Por implementar)</div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}