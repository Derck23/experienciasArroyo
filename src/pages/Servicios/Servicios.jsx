import React, { useState, useEffect } from 'react';
import { obtenerServicios } from '../../service/servicioService'; // ¡El que creamos!
import ServicioCard from '../../components/ServicioCard/ServicioCard'; // ¡El que creamos!
import './Servicios.css'; // Crearemos este archivo ahora

const Servicios = () => {
    const [todosLosServicios, setTodosLosServicios] = useState([]);
    const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todos'); // 'todos', 'alojamiento', 'gastronomia', 'tour'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Cargar todos los servicios desde la API al montar
    useEffect(() => {
        const cargarServicios = async () => {
            try {
                setLoading(true);
                const data = await obtenerServicios();
                // Si tu API devuelve { data: [...] }, usa data.data
                // Si devuelve [...], usa data
                // Basado en el backend, debe ser 'data'
                setTodosLosServicios(data || []);
                setServiciosFiltrados(data || []); 
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los servicios. Intenta más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarServicios();
    }, []);

    // 2. Aplicar filtros cuando cambie la categoría seleccionada
    useEffect(() => {
        if (filtroCategoria === 'todos') {
            setServiciosFiltrados(todosLosServicios);
        } else {
            const filtrados = todosLosServicios.filter(
                (s) => s.categoria === filtroCategoria
            );
            setServiciosFiltrados(filtrados);
        }
    }, [filtroCategoria, todosLosServicios]);

    return (
        <div className="servicios-page">
            <h1 className="servicios-titulo">Servicios</h1>
            <p className="servicios-subtitulo">Descubre los mejores tours, alojamientos y restaurantes.</p>

            {/* --- Barra de Filtros --- */}
            <div className="servicios-filtros">
                <button
                    className={`filtro-btn ${filtroCategoria === 'todos' ? 'activo' : ''}`}
                    onClick={() => setFiltroCategoria('todos')}
                >
                    Todos
                </button>
                <button
                    className={`filtro-btn ${filtroCategoria === 'alojamiento' ? 'activo' : ''}`}
                    onClick={() => setFiltroCategoria('alojamiento')}
                >
                    🏨 Alojamientos
                </button>
                <button
                    className={`filtro-btn ${filtroCategoria === 'gastronomia' ? 'activo' : ''}`}
                    onClick={() => setFiltroCategoria('gastronomia')}
                >
                    🍽️ Gastronomía
                </button>
                <button
                    className={`filtro-btn ${filtroCategoria === 'tour' ? 'activo' : ''}`}
                    onClick={() => setFiltroCategoria('tour')}
                >
                    🚶‍♂️ Tours
                </button>
            </div>

            {/* --- Cuadrícula de Servicios --- */}
            {loading && <p>Cargando servicios...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {!loading && !error && (
                <div className="servicios-grid">
                    {serviciosFiltrados.length > 0 ? (
                        serviciosFiltrados.map((servicio) => (
                            <ServicioCard key={servicio.id} servicio={servicio} />
                        ))
                    ) : (
                        <p>No se encontraron servicios para esta categoría.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Servicios;