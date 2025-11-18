import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Checkbox, Radio, Button, Select, Card, Tag, Empty, Spin, Drawer } from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    FilterOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { obtenerAtracciones } from '../../service/atraccionService';
import './ListaAtacciones.css';

const { Option } = Select;

const ListaAtacciones = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
    const [atracciones, setAtracciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [favoritos, setFavoritos] = useState([]);
    const [ordenamiento, setOrdenamiento] = useState('nombre');

    // Cargar atracciones desde la API
    useEffect(() => {
        const fetchAtracciones = async () => {
            try {
                setLoading(true);
                const data = await obtenerAtracciones();
                
                console.log('Atracciones recibidas en lista:', data);
                
                const atraccionesActivas = data.filter(a => 
                    a.estado === 'activo' || a.estado === 'activa'
                );
                
                console.log('Atracciones activas en lista:', atraccionesActivas);
                
                const mappedAtracciones = atraccionesActivas.map(atraccion => ({
                    id: atraccion.id,
                    nombre: atraccion.nombre,
                    categoria: atraccion.categoria || 'Sin categoría',
                    dificultad: atraccion.nivelDificultad || 'No especificada',
                    distancia: atraccion.distancia || 'N/A',
                    // Priorizar imagen Base64, luego imagen por defecto SVG
                    imagen: (atraccion.fotos && atraccion.fotos.length > 0) 
                        ? atraccion.fotos[0] 
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E%F0%9F%8F%9E%EF%B8%8F Sin imagen%3C/text%3E%3C/svg%3E",
                    costo: atraccion.costoEntrada || 'Gratuito'
                }));

                console.log('Atracciones mapeadas:', mappedAtracciones);
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

    const toggleFavorito = (atraccionId) => {
        setFavoritos(prev => {
            if (prev.includes(atraccionId)) {
                return prev.filter(id => id !== atraccionId);
            } else {
                return [...prev, atraccionId];
            }
        });
    };

    const limpiarFiltros = () => {
        setSearchText('');
        setSelectedCategory('Todas');
        setSelectedDifficulty('Todas');
    };

    const contarFiltrosActivos = () => {
        let count = 0;
        if (searchText) count++;
        if (selectedCategory !== 'Todas') count++;
        if (selectedDifficulty !== 'Todas') count++;
        return count;
    };

    // Filtrar y ordenar
    let atraccionesFiltradas = atracciones.filter(atraccion => {
        const matchSearch = atraccion.nombre.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = selectedCategory === 'Todas' || atraccion.categoria === selectedCategory;
        const matchDifficulty = selectedDifficulty === 'Todas' || atraccion.dificultad === selectedDifficulty;
        return matchSearch && matchCategory && matchDifficulty;
    });

    // Ordenamiento
    switch (ordenamiento) {
        case 'nombre':
            atraccionesFiltradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'categoria':
            atraccionesFiltradas.sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''));
            break;
        case 'dificultad':
            atraccionesFiltradas.sort((a, b) => (a.dificultad || '').localeCompare(b.dificultad || ''));
            break;
        default:
            break;
    }

    if (loading) {
        return (
            <div className="atracciones-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando atracciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="atracciones-container">
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
        <div className="atracciones-container">
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
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Categorías */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Categorías</h2>
                        <Radio.Group
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="radio-group"
                        >
                            {categorias.map(cat => (
                                <Radio key={cat} value={cat}>{cat}</Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    {/* Dificultad */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Dificultad</h2>
                        <Radio.Group
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="radio-group"
                        >
                            {dificultades.map(dif => (
                                <Radio key={dif} value={dif}>{dif}</Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    {/* Botones de acción */}
                    <div className="filtro-actions">
                        <Button
                            type="primary"
                            block
                            size="large"
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
            <aside className="atracciones-sidebar atracciones-sidebar-desktop">
                <div className="sidebar-header">
                    <AppstoreOutlined className="sidebar-icon" />
                    <h1 className="sidebar-title">Atracciones</h1>
                </div>

                <div className="filtros-container">
                    {/* Búsqueda */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Buscar por nombre</h2>
                        <Input
                            size="large"
                            placeholder="Buscar por palabra clave..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Categorías */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Categorías</h2>
                        <Radio.Group
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="radio-group"
                        >
                            {categorias.map(cat => (
                                <Radio key={cat} value={cat}>{cat}</Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    {/* Dificultad */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Dificultad</h2>
                        <Radio.Group
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="radio-group"
                        >
                            {dificultades.map(dif => (
                                <Radio key={dif} value={dif}>{dif}</Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    {/* Botones de acción */}
                    <div className="filtro-actions">
                        <Button
                            type="primary"
                            block
                            size="large"
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
            <main className="atracciones-main">
                <div className="atracciones-content">
                    {/* Barra de filtros móvil */}
                    <div className="mobile-filter-bar">
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setDrawerVisible(true)}
                            className="filter-btn"
                        >
                            Filtros {contarFiltrosActivos() > 0 && `(${contarFiltrosActivos()})`}
                        </Button>
                        <Select
                            value={ordenamiento}
                            onChange={setOrdenamiento}
                            className="mobile-sort-select"
                            suffixIcon={null}
                        >
                            <Option value="nombre">Nombre</Option>
                            <Option value="categoria">Categoría</Option>
                            <Option value="dificultad">Dificultad</Option>
                        </Select>
                    </div>

                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Atracciones Turísticas</h1>
                            <p className="page-subtitle">Descubre lugares increíbles</p>
                        </div>
                    </div>

                    {/* Controles de ordenamiento - Desktop */}
                    <div className="controles-wrapper">
                        <div></div>
                        <Select
                            value={ordenamiento}
                            onChange={setOrdenamiento}
                            style={{ width: 250 }}
                            size="large"
                        >
                            <Option value="nombre">Ordenar por: Nombre</Option>
                            <Option value="categoria">Ordenar por: Categoría</Option>
                            <Option value="dificultad">Ordenar por: Dificultad</Option>
                        </Select>
                    </div>

                    {/* Grid de atracciones */}
                    {atraccionesFiltradas.length === 0 ? (
                        <div className="empty-state">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <h3>No se encontraron atracciones</h3>
                                        <p>No hay atracciones que coincidan con tu búsqueda.<br/>
                                            ¡Intenta ajustar tus filtros!</p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="atracciones-grid">
                            {atraccionesFiltradas.map((atraccion) => (
                                <Card
                                    key={atraccion.id}
                                    hoverable
                                    className="atraccion-card"
                                    cover={
                                        <div className="atraccion-image-container">
                                            <img
                                                alt={atraccion.nombre}
                                                src={atraccion.imagen}
                                                className="atraccion-image"
                                            />
                                            <Button
                                                type="text"
                                                icon={
                                                    favoritos.includes(atraccion.id)
                                                        ? <HeartFilled style={{ color: '#ff4d4f' }} />
                                                        : <HeartOutlined />
                                                }
                                                className="favorito-btn"
                                                onClick={() => toggleFavorito(atraccion.id)}
                                            />
                                        </div>
                                    }
                                >
                                    <h3 className="atraccion-nombre">{atraccion.nombre}</h3>
                                    <Tag color="green" style={{ marginBottom: '8px' }}>{atraccion.categoria}</Tag>

                                    <div className="atraccion-info">
                                        <AppstoreOutlined />
                                        <span>{atraccion.dificultad}</span>
                                    </div>

                                    <div className="atraccion-footer">
                                        <span className="atraccion-precio">
                                            {atraccion.costo === 'Gratuito' ? 'Gratis' : atraccion.costo}
                                        </span>
                                        <Button 
                                            type="primary" 
                                            ghost
                                            onClick={() => navigate(`/experiencia/atracciones/${atraccion.id}`)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ListaAtacciones;