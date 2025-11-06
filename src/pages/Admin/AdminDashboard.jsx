import React from 'react';
import './AdminDashboard.css';
import { getCurrentUser } from '../../utils/auth';

function AdminDashboard() {
  const user = getCurrentUser();

  return (
    <main className="admin-dashboard" role="main" aria-label="Panel de administración">
      <section className="admin-dashboard__card" tabIndex="-1">
        <h1 className="admin-dashboard__title">¡Bienvenido!</h1>
        <p className="admin-dashboard__subtitle">
          Hola <strong className="admin-dashboard__user">{user?.firstName ?? 'Usuario'}</strong>, estás en el panel de administración
        </p>
      </section>
    </main>
  );
}

export default AdminDashboard;