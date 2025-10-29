import React, { useState, useEffect } from 'react';
import { Input, Checkbox, Radio, Button, Select, Card, Tag, Empty, Spin } from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    AppstoreOutlined,
    UnorderedListOutlined,
    EnvironmentFilled
} from '@ant-design/icons';
import './ListaEventos.css';

const { Option } = Select;

// 🎭 DATOS MOCK - Simulación de eventos
const EVENTOS_MOCK = [
    {
        id: 1,
        nombre: "Festival de Música Electrónica",
        descripcion: "Los mejores DJs nacionales e internacionales en un evento inolvidable",
        categoria: "conciertos",
        fecha: "2025-11-25",
        hora: "20:00",
        ubicacion: "Foro Sol, Ciudad de México",
        precio: 1200,
        imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4KFINh0OvSFNYk-PrGSbjWEt9QO0P3LWdxWMyU6g8N8Snw1oLUg0xGeiTMLo3IcRM0r0SERmat3kaCvimEgFcxoYrhdm3Nw-cpTfb6LQDEabe8FH4JhorweqxPm7GU8-DPN1BWznCN_cpbVkfti9Du_5eWqiFuJamtGlsqBME7icuAGXoXsU4OhQYRwLQ6d5uYnVCCOyyabc1ocm-NQWwQGw8nYE5SNwnVz9P_lt2iCSJ-XWE6qBwBb-8iAFAeGqCaf7NSkNTE4wi",
        estado: "activo",
        asistentes: 450,
        destacado: false
    },
    {
        id: 2,
        nombre: "Exposición de Arte Moderno",
        descripcion: "Descubre las obras más innovadoras del arte contemporáneo",
        categoria: "cultural",
        fecha: "2025-11-26",
        hora: "11:00",
        ubicacion: "Museo de Arte Contemporáneo",
        precio: 0,
        imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPVsBqJZC14IQU-AiwsD94Lu2Wg4kvWYb3LkmY44I9KnUNFzLpbw4thfO4y_O1_NMhjZ1gKroX9WW6CtAnsM1XlFa3S9c8srpkrS6_6UZrejN3Wu8vXOq8kaVU7AglkfDeXoZ2645nax7grfyH9PL6T_zrolybmx8GIwvSoLbAXOMF2IMV89CX8-91dUKFVASDRI4PIWwlBJet031pSz-zhyaEgEwghBdMiRuZE9XN5ShkjPrww1MtoD6m6XCzqeATpNUPrJQTfyzE",
        estado: "activo",
        asistentes: 320,
        destacado: true
    },
    {
        id: 3,
        nombre: "Festival Gastronómico 'Sabores del Mundo'",
        descripcion: "Una experiencia culinaria única con chefs reconocidos internacionalmente",
        categoria: "gastronomia",
        fecha: "2025-12-01",
        hora: "14:00",
        ubicacion: "Parque Bicentenario",
        precio: 500,
        imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5Am3QBRzQ6RtH4DJLcI3sCICCE3Yj9Vz1Ki6o_pzub-d93G-tS4EdgySfAZ6xCnkj9XPYxRBmAjRJfnUvHPNShDEnl1bodeh8lnPqnIsRF9JD3mh2M_f5NkWlXM-UuCahVlfiFgBDLwTVEC2hoshe5dRUKQ9GFw3DpDyKHvVFI4iMtPMnkzSrEHq49E2N8aA0gN_00BkQ6EZ36Hz4YgZzX-U4k_XPX-TJHdSOorbacp9AZ8ftbaVw3yxPSqS8UNlWEHiQKP0RSyxQ",
        estado: "activo",
        asistentes: 280,
        destacado: false
    },
    {
        id: 4,
        nombre: "Maratón de la Sierra Gorda",
        descripcion: "Corre por los paisajes más hermosos de la región",
        categoria: "deportivo",
        fecha: "2025-12-05",
        hora: "07:00",
        ubicacion: "Arroyo Seco, Querétaro",
        precio: 350,
        imagen: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
        estado: "activo",
        asistentes: 520,
        destacado: false
    },
    {
        id: 5,
        nombre: "Concierto de Rock en Vivo",
        descripcion: "Las mejores bandas de rock nacional en un solo escenario",
        categoria: "conciertos",
        fecha: "2025-12-10",
        hora: "19:00",
        ubicacion: "Plaza de la Constitución",
        precio: 0,
        imagen: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        estado: "activo",
        asistentes: 890,
        destacado: true
    },
    {
        id: 6,
        nombre: "Taller de Cocina Tradicional",
        descripcion: "Aprende los secretos de la cocina queretana con chefs locales",
        categoria: "gastronomia",
        fecha: "2025-12-15",
        hora: "10:00",
        ubicacion: "Casa de la Cultura",
        precio: 250,
        imagen: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
        estado: "activo",
        asistentes: 45,
        destacado: false
    },
    {
        id: 7,
        nombre: "Festival de Danza Folklórica",
        descripcion: "Celebra la riqueza cultural con danzas tradicionales",
        categoria: "cultural",
        fecha: "2025-12-18",
        hora: "17:00",
        ubicacion: "Teatro Municipal",
        precio: 150,
        imagen: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
        estado: "activo",
        asistentes: 210,
        destacado: false
    },
    {
        id: 8,
        nombre: "Torneo de Fútbol Rápido",
        descripcion: "Competencia deportiva para todas las edades",
        categoria: "deportivo",
        fecha: "2025-12-20",
        hora: "09:00",
        ubicacion: "Unidad Deportiva Municipal",
        precio: 0,
        imagen: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
        estado: "activo",
        asistentes: 160,
        destacado: false
    },
    {
        id: 9,
        nombre: "Noche de Jazz bajo las Estrellas",
        descripcion: "Una velada mágica con los mejores exponentes del jazz",
        categoria: "conciertos",
        fecha: "2025-12-22",
        hora: "20:30",
        ubicacion: "Jardín Zenea",
        precio: 400,
        imagen: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800",
        estado: "activo",
        asistentes: 180,
        destacado: true
    },
    {
        id: 10,
        nombre: "Feria de Artesanías",
        descripcion: "Conoce el trabajo de artesanos locales y lleva un recuerdo único",
        categoria: "cultural",
        fecha: "2025-12-28",
        hora: "12:00",
        ubicacion: "Plaza Principal",
        precio: 0,
        imagen: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800",
        estado: "activo",
        asistentes: 650,
        destacado: false
    }
];

const ListaEventos = () => {
    // Estados
    const [eventos, setEventos] = useState([]);
    const [eventosFiltrados, setEventosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [categorias, setCategorias] = useState({
        conciertos: false,
        gastronomia: false,
        cultural: false,
        deportivo: false
    });
    const [filtroPrecio, setFiltroPrecio] = useState('todos');
    const [ordenamiento, setOrdenamiento] = useState('fecha');
    const [vistaActual, setVistaActual] = useState('lista');
    const [favoritos, setFavoritos] = useState([]);

    // 🎭 Simulación de carga de datos
    useEffect(() => {
        cargarEventos();
    }, []);

    // Aplicar filtros cuando cambien
    useEffect(() => {
        aplicarFiltros();
    }, [searchTerm, fechaDesde, fechaHasta, categorias, filtroPrecio, ordenamiento, eventos]);

    const cargarEventos = async () => {
        try {
            setLoading(true);

            // Simulamos un delay de red para que se vea más realista
            await new Promise(resolve => setTimeout(resolve, 800));

            // Usamos los datos mock
            const eventosActivos = EVENTOS_MOCK.filter(evento =>
                evento.estado === 'activo' || evento.estado === 'activa'
            );

            setEventos(eventosActivos);
            setEventosFiltrados(eventosActivos);
        } catch (err) {
            console.error('Error al cargar eventos:', err);
            setError('No se pudieron cargar los eventos');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...eventos];

        // Filtro por búsqueda
        if (searchTerm) {
            resultado = resultado.filter(evento =>
                evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por fechas
        if (fechaDesde) {
            resultado = resultado.filter(evento =>
                new Date(evento.fecha) >= new Date(fechaDesde)
            );
        }
        if (fechaHasta) {
            resultado = resultado.filter(evento =>
                new Date(evento.fecha) <= new Date(fechaHasta)
            );
        }

        // Filtro por categorías
        const categoriasSeleccionadas = Object.keys(categorias).filter(key => categorias[key]);
        if (categoriasSeleccionadas.length > 0) {
            resultado = resultado.filter(evento =>
                categoriasSeleccionadas.includes(evento.categoria?.toLowerCase())
            );
        }

        // Filtro por precio
        if (filtroPrecio === 'gratuitos') {
            resultado = resultado.filter(evento =>
                !evento.precio || evento.precio === 0 || evento.precio === '0'
            );
        } else if (filtroPrecio === 'pago') {
            resultado = resultado.filter(evento =>
                evento.precio && evento.precio !== 0 && evento.precio !== '0'
            );
        }

        // Ordenamiento
        switch (ordenamiento) {
            case 'fecha':
                resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                break;
            case 'popularidad':
                resultado.sort((a, b) => (b.asistentes || 0) - (a.asistentes || 0));
                break;
            case 'precio-menor':
                resultado.sort((a, b) => (a.precio || 0) - (b.precio || 0));
                break;
            case 'precio-mayor':
                resultado.sort((a, b) => (b.precio || 0) - (a.precio || 0));
                break;
            default:
                break;
        }

        setEventosFiltrados(resultado);
    };

    const handleCategoriaChange = (categoria) => {
        setCategorias(prev => ({
            ...prev,
            [categoria]: !prev[categoria]
        }));
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFechaDesde('');
        setFechaHasta('');
        setCategorias({
            conciertos: false,
            gastronomia: false,
            cultural: false,
            deportivo: false
        });
        setFiltroPrecio('todos');
    };

    const toggleFavorito = (eventoId) => {
        setFavoritos(prev => {
            if (prev.includes(eventoId)) {
                return prev.filter(id => id !== eventoId);
            } else {
                return [...prev, eventoId];
            }
        });
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const opciones = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-MX', opciones);
    };

    const formatearPrecio = (precio) => {
        if (!precio || precio === 0 || precio === '0') {
            return 'Gratis';
        }
        return `$${parseFloat(precio).toLocaleString('es-MX')} MXN`;
    };

    if (loading) {
        return (
            <div className="eventos-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando eventos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="eventos-container">
                <div className="error-container">
                    <p>{error}</p>
                    <Button type="primary" onClick={cargarEventos}>
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="eventos-container">
            {/* Sidebar de Filtros */}
            <aside className="eventos-sidebar">
                <div className="sidebar-header">
                    <CalendarOutlined className="sidebar-icon" />
                    <h1 className="sidebar-title">Eventia</h1>
                </div>

                <div className="filtros-container">
                    {/* Búsqueda */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Buscar por nombre</h2>
                        <Input
                            size="large"
                            placeholder="Buscar por palabra clave..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Fechas</h2>
                        <div className="date-inputs">
                            <div className="date-input-wrapper">
                                <label>Desde</label>
                                <Input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                            <div className="date-input-wrapper">
                                <label>Hasta</label>
                                <Input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categorías */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Categorías</h2>
                        <div className="checkbox-group">
                            <Checkbox
                                checked={categorias.conciertos}
                                onChange={() => handleCategoriaChange('conciertos')}
                            >
                                Conciertos
                            </Checkbox>
                            <Checkbox
                                checked={categorias.gastronomia}
                                onChange={() => handleCategoriaChange('gastronomia')}
                            >
                                Gastronomía
                            </Checkbox>
                            <Checkbox
                                checked={categorias.cultural}
                                onChange={() => handleCategoriaChange('cultural')}
                            >
                                Cultural
                            </Checkbox>
                            <Checkbox
                                checked={categorias.deportivo}
                                onChange={() => handleCategoriaChange('deportivo')}
                            >
                                Deportivo
                            </Checkbox>
                        </div>
                    </div>

                    {/* Precio */}
                    <div className="filtro-section">
                        <h2 className="filtro-label">Precio</h2>
                        <Radio.Group
                            value={filtroPrecio}
                            onChange={(e) => setFiltroPrecio(e.target.value)}
                            className="radio-group"
                        >
                            <Radio value="todos">Todos</Radio>
                            <Radio value="gratuitos">Gratuitos</Radio>
                            <Radio value="pago">De Pago</Radio>
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
            <main className="eventos-main">
                <div className="eventos-content">
                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Próximos Eventos</h1>
                            <p className="page-subtitle">Encuentra tu próxima aventura</p>
                        </div>
                    </div>

                    {/* Controles de vista y ordenamiento */}
                    <div className="controles-wrapper">
                        <div className="view-switcher">
                            <Button
                                type={vistaActual === 'lista' ? 'primary' : 'default'}
                                icon={<UnorderedListOutlined />}
                                onClick={() => setVistaActual('lista')}
                            >
                                Lista
                            </Button>
                            <Button
                                type={vistaActual === 'calendario' ? 'primary' : 'default'}
                                icon={<CalendarOutlined />}
                                onClick={() => setVistaActual('calendario')}
                            >
                                Calendario
                            </Button>
                            <Button
                                type={vistaActual === 'mapa' ? 'primary' : 'default'}
                                icon={<EnvironmentFilled />}
                                onClick={() => setVistaActual('mapa')}
                            >
                                Mapa
                            </Button>
                        </div>

                        <Select
                            value={ordenamiento}
                            onChange={setOrdenamiento}
                            style={{ width: 250 }}
                            size="large"
                        >
                            <Option value="fecha">Ordenar por: Fecha</Option>
                            <Option value="popularidad">Ordenar por: Popularidad</Option>
                            <Option value="precio-menor">Ordenar por: Precio (menor)</Option>
                            <Option value="precio-mayor">Ordenar por: Precio (mayor)</Option>
                        </Select>
                    </div>

                    {/* Grid de eventos */}
                    {eventosFiltrados.length === 0 ? (
                        <div className="empty-state">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <h3>No se encontraron eventos</h3>
                                        <p>No hay eventos que coincidan con tu búsqueda.<br/>
                                            ¡Intenta ajustar tus filtros para descubrir más aventuras!</p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="eventos-grid">
                            {eventosFiltrados.map((evento) => (
                                <Card
                                    key={evento.id}
                                    hoverable
                                    className="evento-card"
                                    cover={
                                        <div className="evento-image-container">
                                            <img
                                                alt={evento.nombre}
                                                src={evento.imagen}
                                                className="evento-image"
                                            />
                                            <Button
                                                type="text"
                                                icon={
                                                    favoritos.includes(evento.id)
                                                        ? <HeartFilled style={{ color: '#ff4d4f' }} />
                                                        : <HeartOutlined />
                                                }
                                                className="favorito-btn"
                                                onClick={() => toggleFavorito(evento.id)}
                                            />
                                            {evento.destacado && (
                                                <Tag color="red" className="destacado-tag">
                                                    ¡Últimos lugares!
                                                </Tag>
                                            )}
                                        </div>
                                    }
                                >
                                    <h3 className="evento-nombre">{evento.nombre}</h3>

                                    <div className="evento-info">
                                        <CalendarOutlined />
                                        <span>{formatearFecha(evento.fecha)} - {evento.hora}h</span>
                                    </div>

                                    <div className="evento-info">
                                        <EnvironmentOutlined />
                                        <span>{evento.ubicacion}</span>
                                    </div>

                                    <div className="evento-footer">
                                        <span className={`evento-precio ${!evento.precio || evento.precio === 0 ? 'gratis' : ''}`}>
                                            {formatearPrecio(evento.precio)}
                                        </span>
                                        <Button type="primary" ghost>
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

export default ListaEventos;