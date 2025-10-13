import React, { useState, useEffect } from 'react';
import { Input, Dropdown } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { BarChart2, MapPin } from 'lucide-react';
import { obtenerAtracciones } from '../../service/atraccionService';
import './ListaAtacciones.css';

const ListaAtacciones = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
    const [atracciones, setAtracciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar atracciones desde la API
    useEffect(() => {
        const fetchAtracciones = async () => {
            try {
                setLoading(true);
                const data = await obtenerAtracciones();
                
                // Filtrar solo activas en el cliente
                const atraccionesActivas = data.filter(a => a.estado === 'activo');
                
                // Mapear datos de la API según los campos reales
                const mappedAtracciones = atraccionesActivas.map(atraccion => ({
                    id: atraccion.id,
                    nombre: atraccion.nombre,
                    categoria: atraccion.categoria || 'Sin categoría',
                    dificultad: atraccion.nivelDificultad || 'No especificada',
                    distancia: atraccion.distancia || 'N/A',
                    imagen: atraccion.fotos?.[0] || 'https://via.placeholder.com/400',
                    costo: atraccion.costoEntrada || 'Gratuito'
                }));

                setAtracciones(mappedAtracciones);
            } catch (err) {
                console.error('Error al cargar atracciones:', err);
                setError('No se pudieron cargar las atracciones');
            } finally {
                setLoading(false);
            }
        };

        fetchAtracciones();
    }, []);

    // Obtener categorías y dificultades únicas
    const categorias = ['Todas', ...new Set(atracciones.map(a => a.categoria).filter(Boolean))];
    const dificultades = ['Todas', ...new Set(atracciones.map(a => a.dificultad).filter(Boolean))];

    // Configurar items del menú para Dropdown
    const menuCategoriaItems = categorias.map(cat => ({
        key: cat,
        label: cat,
        onClick: () => setSelectedCategory(cat)
    }));

    const menuDificultadItems = dificultades.map(dif => ({
        key: dif,
        label: dif,
        onClick: () => setSelectedDifficulty(dif)
    }));

    const atraccionesFiltradas = atracciones.filter(atraccion => {
        const matchSearch = atraccion.nombre.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = selectedCategory === 'Todas' || atraccion.categoria === selectedCategory;
        const matchDifficulty = selectedDifficulty === 'Todas' || atraccion.dificultad === selectedDifficulty;
        return matchSearch && matchCategory && matchDifficulty;
    });

    if (loading) {
        return (
            <div className="page-container">
                <main className="main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando atracciones...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <main className="main-content">
                    <div className="error-container">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-container">
            <main className="main-content">
                <div className="container">
                    {/* Search Bar */}
                    <div className="search-container">
                        <Input
                            size="large"
                            placeholder="Buscar atracciones por nombre..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Filters */}
                    <div className="filters-container">
                        <span className="filter-label">Filtrar por:</span>

                        <Dropdown menu={{ items: menuCategoriaItems }} trigger={['click']}>
                            <button className="filter-button">
                                {selectedCategory}
                                <DownOutlined style={{ fontSize: '12px' }} />
                            </button>
                        </Dropdown>

                        <Dropdown menu={{ items: menuDificultadItems }} trigger={['click']}>
                            <button className="filter-button">
                                {selectedDifficulty}
                                <DownOutlined style={{ fontSize: '12px' }} />
                            </button>
                        </Dropdown>
                    </div>

                    {/* Cards Grid */}
                    <div className="cards-grid">
                        {atraccionesFiltradas.map((atraccion) => (
                            <div key={atraccion.id} className="attraction-card">
                                <div
                                    className="card-image"
                                    style={{ backgroundImage: `url("${atraccion.imagen}")` }}
                                >
                                    <div className="card-overlay" />
                                </div>

                                <div className="card-content">
                                    <h3 className="card-title">{atraccion.nombre}</h3>
                                    <p className="card-category">{atraccion.categoria}</p>

                                    <div className="card-info">
                                        <span className="info-item">
                                            <BarChart2 size={16} />
                                            {atraccion.dificultad}
                                        </span>
                                        <span className="info-item">
                                            <MapPin size={16} />
                                            {atraccion.costo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {atraccionesFiltradas.length === 0 && (
                        <div className="no-results">
                            <p>No se encontraron atracciones con los filtros seleccionados</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ListaAtacciones;