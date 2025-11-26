import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Radio, Button, Select, Card, Tag, Empty, Spin, Drawer } from 'antd';
import {
    SearchOutlined,
    HeartOutlined,
    HeartFilled,
    FilterOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { obtenerServicios } from '../../service/servicioService';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../../service/favoritosService';
import ServicioCard from '../../components/ServicioCard/ServicioCard';
import useBackButton from '../../hooks/useBackButton.jsx';
import './Servicios.css';

const { Option } = Select;

const Servicios = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [todosLosServicios, setTodosLosServicios] = useState([]);
    const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [filtroCategoriaTemp, setFiltroCategoriaTemp] = useState('todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchTextTemp, setSearchTextTemp] = useState('');
    const [ordenamiento, setOrdenamiento] = useState('nombre');
    const [favoritos, setFavoritos] = useState([]);

    // Hook para manejar botón atrás del teléfono
    useBackButton('/experiencia');

    // 1. Cargar todos los servicios desde la API al montar
    useEffect(() => {
        const cargarServicios = async () => {
            try {
                setLoading(true);
                const data = await obtenerServicios();
                setTodosLosServicios(data || []);
                setServiciosFiltrados(data || []);
                setError(null);

                // Aplicar filtro de la URL si existe
                const categoriaUrl = searchParams.get('categoria');
                if (categoriaUrl && ['tour', 'alojamiento', 'gastronomia'].includes(categoriaUrl)) {
                    setFiltroCategoria(categoriaUrl);
                    setFiltroCategoriaTemp(categoriaUrl);
                }
                
                // Cargar favoritos
                try {
                    const favs = await obtenerFavoritos();
                    const favServicios = favs.filter(f => f.tipo === 'servicio').map(f => f.itemId);
                    setFavoritos(favServicios);
                } catch (favErr) {
                    console.log('No se pudieron cargar favoritos:', favErr);
                }
            } catch (err) {
                setError('No se pudieron cargar los servicios. Intenta más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarServicios();
    }, [searchParams]);

    // 2. Aplicar filtros cuando cambie la categoría o búsqueda
    useEffect(() => {
        let filtrados = todosLosServicios;

        // Filtro por categoría
        if (filtroCategoria !== 'todos') {
            filtrados = filtrados.filter((s) => s.categoria === filtroCategoria);
        }

        // Filtro por búsqueda
        if (searchText) {
            filtrados = filtrados.filter((s) =>
                s.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
                s.descripcion?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Ordenamiento
        switch (ordenamiento) {
            case 'nombre':
                filtrados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                break;
            case 'categoria':
                filtrados.sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''));
                break;
            default:
                break;
        }

        setServiciosFiltrados(filtrados);
    }, [filtroCategoria, todosLosServicios, searchText, ordenamiento]);

    const aplicarFiltros = () => {
        setFiltroCategoria(filtroCategoriaTemp);
        setSearchText(searchTextTemp);
        setDrawerVisible(false);
    };

    const limpiarFiltros = () => {
        setSearchText('');
        setSearchTextTemp('');
        setFiltroCategoria('todos');
        setFiltroCategoriaTemp('todos');
    };

    const contarFiltrosActivos = () => {
        let count = 0;
        if (searchText) count++;
        if (filtroCategoria !== 'todos') count++;
        return count;
    };

    const toggleFavorito = async (servicioId) => {
        try {
            if (favoritos.includes(servicioId)) {
                const allFavs = await obtenerFavoritos();
                const fav = allFavs.find(f => f.tipo === 'servicio' && f.itemId === servicioId);
                if (fav) {
                    await eliminarFavorito(fav.id);
                    setFavoritos(prev => prev.filter(id => id !== servicioId));
                }
            } else {
                await agregarFavorito('servicio', servicioId);
                setFavoritos(prev => [...prev, servicioId]);
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
        }
    };

    if (loading) {
        return (
            <div className="servicios-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando servicios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="servicios-container">
                <div className="error-container">
                    <p>{error}</p>
                    <Button type="primary" onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="servicios-container">
            {/* Drawer de Filtros para móvil */}
            <Drawer
                title="Filtros"
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={300}
                className="filtros-drawer"
            >
                <div className="filtros-container">
                    {/* Búsqueda */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Buscar por nombre</h2>
                        <Input
                            size="large"
                            placeholder="Buscar por palabra clave..."
                            prefix={<SearchOutlined />}
                            value={searchTextTemp}
                            onChange={(e) => setSearchTextTemp(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Categorías */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Categorías</h2>
                        <Radio.Group
                            value={filtroCategoriaTemp}
                            onChange={(e) => setFiltroCategoriaTemp(e.target.value)}
                            className="radio-group"
                        >
                            <Radio value="todos">Todos</Radio>
                            <Radio value="alojamiento">🏨 Alojamientos</Radio>
                            <Radio value="gastronomia">🍽️ Gastronomía</Radio>
                            <Radio value="tour">🚶‍♂️ Tours</Radio>
                        </Radio.Group>
                    </div>

                    {/* Botones de acción */}
                    <div className="filtro-actions">
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={aplicarFiltros}
                        >
                            Aplicar Filtros
                        </Button>
                        <Button
                            block
                            size="large"
                            onClick={limpiarFiltros}
                        >
                            Limpiar
                        </Button>
                    </div>
                </div>
            </Drawer>

            {/* Sidebar de Filtros - Solo Desktop */}
            <aside className="servicios-sidebar servicios-sidebar-desktop">
                <div className="sidebar-header">
                    <AppstoreOutlined className="sidebar-icon" />
                    <h1 className="sidebar-title" style={{ color: '#1a1a1a' }}>Servicios</h1>
                </div>

                <div className="filtros-container">
                    {/* Búsqueda */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Buscar por nombre</h2>
                        <Input
                            size="large"
                            placeholder="Buscar por palabra clave..."
                            prefix={<SearchOutlined />}
                            value={searchTextTemp}
                            onChange={(e) => setSearchTextTemp(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Categorías */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Categorías</h2>
                        <Radio.Group
                            value={filtroCategoriaTemp}
                            onChange={(e) => setFiltroCategoriaTemp(e.target.value)}
                            className="radio-group"
                        >
                            <Radio value="todos">Todos</Radio>
                            <Radio value="alojamiento">🏨 Alojamientos</Radio>
                            <Radio value="gastronomia">🍽️ Gastronomía</Radio>
                            <Radio value="tour">🚶‍♂️ Tours</Radio>
                        </Radio.Group>
                    </div>

                    {/* Botones de acción */}
                    <div className="filtro-actions">
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={aplicarFiltros}
                        >
                            Aplicar Filtros
                        </Button>
                        <Button
                            block
                            size="large"
                            onClick={limpiarFiltros}
                        >
                            Limpiar
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="servicios-main">
                <div className="servicios-content">
                    {/* Barra de filtros móvil */}
                    <div className="mobile-filter-bar">
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setDrawerVisible(true)}
                            className="filter-btn"
                        >
                            Filtros {contarFiltrosActivos() > 0 && `(${contarFiltrosActivos()})`}
                        </Button>
                    </div>

                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1 className="page-title" style={{ color: '#2D5016', fontWeight: 'normal' }}>Servicios</h1>
                            <p className="page-subtitle">Descubre los mejores tours, alojamientos y restaurantes</p>
                        </div>
                    </div>

                    {/* Grid de servicios */}
                    {serviciosFiltrados.length === 0 ? (
                        <div className="empty-state">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <h3>No se encontraron servicios</h3>
                                        <p>No hay servicios que coincidan con tu búsqueda.<br/>
                                            ¡Intenta ajustar tus filtros!</p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="servicios-grid">
                            {serviciosFiltrados.map((servicio) => (
                                <ServicioCard 
                                    key={servicio.id} 
                                    servicio={servicio}
                                    esFavorito={favoritos.includes(servicio.id)}
                                    onToggleFavorito={toggleFavorito}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Servicios;