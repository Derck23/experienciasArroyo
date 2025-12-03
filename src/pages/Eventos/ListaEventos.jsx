import React, { useState, useEffect } from 'react';
import { Input, Checkbox, Radio, Button, Select, Card, Tag, Empty, Spin, Drawer, Modal } from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    AppstoreOutlined,
    UnorderedListOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { obtenerEventos } from '../../service/eventoService';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../../service/favoritosService';
import { useNavigate } from 'react-router-dom';
import useBackButton from '../../hooks/useBackButton.jsx';
import './ListaEventos.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD6vEAeGtBjMT1zQUlFnuvJV9YORgXSFGk';

const { Option } = Select;

const ListaEventos = () => {
    const navigate = useNavigate();

    // Hook para manejar botón atrás del teléfono
    useBackButton('/experiencia');

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
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [mesActual, setMesActual] = useState(new Date().getMonth());
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const calendarioScrollRef = React.useRef(null);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [modalEventoVisible, setModalEventoVisible] = useState(false);
    const mapRef = React.useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    // Cargar eventos al montar
    useEffect(() => {
        cargarEventos();
    }, []);

    // Aplicar filtros cuando cambien
    useEffect(() => {
        aplicarFiltros();
    }, [searchTerm, fechaDesde, fechaHasta, categorias, filtroPrecio, ordenamiento, eventos]);

    // Scroll al mes actual cuando se abre la vista de calendario
    useEffect(() => {
        if (vistaActual === 'calendario' && calendarioScrollRef.current) {
            // Esperar un tick para que se renderice
            setTimeout(() => {
                const container = calendarioScrollRef.current;
                if (container && container.children.length > 2) {
                    // El mes actual está en el índice 2 (porque empezamos desde -2)
                    const mesActualElement = container.children[2];
                    if (mesActualElement) {
                        mesActualElement.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
                    }
                }
            }, 100);
        }
    }, [vistaActual]);

    // Inicializar Google Maps cuando se abre la vista de mapa
    useEffect(() => {
        if (vistaActual === 'mapa' && mapRef.current && !map) {
            const loadGoogleMaps = () => {
                const googleMap = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 21.5523, lng: -99.6739 },
                    zoom: 13,
                });
                setMap(googleMap);
            };

            if (window.google && window.google.maps) {
                loadGoogleMaps();
            } else {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
                script.async = true;
                script.defer = true;
                script.onload = loadGoogleMaps;
                document.head.appendChild(script);
            }
        }
    }, [vistaActual, map]);

    // Agregar marcadores al mapa cuando cambian los eventos filtrados
    useEffect(() => {
        if (map && vistaActual === 'mapa') {
            // Limpiar marcadores anteriores
            markers.forEach(marker => marker.setMap(null));

            const newMarkers = [];

            eventosFiltrados.forEach(evento => {
                try {
                    const ubicacion = JSON.parse(evento.ubicacion || '{}');
                    if (ubicacion.lat && ubicacion.lng) {
                        const marker = new window.google.maps.Marker({
                            position: { lat: ubicacion.lat, lng: ubicacion.lng },
                            map: map,
                            title: evento.nombre,
                            icon: {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                                        <path fill="#ef4444" stroke="#fff" stroke-width="2" d="M20,2 C11,2 4,9 4,18 C4,27 20,48 20,48 S36,27 36,18 C36,9 29,2 20,2 Z"/>
                                        <text x="20" y="22" font-size="20" text-anchor="middle" fill="#fff">🎉</text>
                                    </svg>
                                `),
                                scaledSize: new window.google.maps.Size(40, 50),
                                anchor: new window.google.maps.Point(20, 50)
                            }
                        });

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `
                                <div style="padding: 8px; max-width: 280px;">
                                    ${(evento.imagen || evento.fotos?.[0]) ? `
                                        <img src="${evento.imagen || evento.fotos[0]}"
                                            alt="${evento.nombre}"
                                            style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                                    ` : ''}
                                    <h3 style="color: #2e7d32; font-size: 16px; font-weight: 700; margin-bottom: 8px;">
                                        ${evento.nombre}
                                    </h3>
                                    ${evento.cantidadBoletos === 0
                                        ? '<span style="background: #ff4d4f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">AGOTADO</span>'
                                        : (evento.cantidadBoletos > 0 && evento.cantidadBoletos <= 10)
                                            ? '<span style="background: #ff4d4f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">¡Últimos lugares!</span>'
                                            : ''
                                    }
                                    ${evento.descripcion ? `<p style="color: #666; margin-bottom: 8px; line-height: 1.4; font-size: 13px;">${evento.descripcion.substring(0, 100)}...</p>` : ''}
                                    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
                                        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
                                            <span>📅</span>
                                            <span>${formatearFecha(evento.fecha)} - ${evento.hora || '00:00'}h</span>
                                        </div>
                                        ${evento.categoria ? `<span style="background: #17cf17; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; width: fit-content;">${evento.categoria}</span>` : ''}
                                        <div style="font-size: 14px; font-weight: 700; color: #2e7d32;">
                                            ${formatearPrecio(evento.precio)}
                                        </div>
                                    </div>
                                    <button
                                        onclick="window.open('https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}', '_blank')"
                                        style="width: 100%; background: #17cf17; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
                                        📍 Cómo Llegar
                                    </button>
                                </div>
                            `
                        });

                        marker.addListener('click', () => {
                            infoWindow.open(map, marker);
                        });

                        newMarkers.push(marker);
                    }
                } catch (err) {
                    console.error('Error parsing ubicacion:', err);
                }
            });

            setMarkers(newMarkers);
        }
    }, [map, eventosFiltrados, vistaActual]);

    const cargarEventos = async () => {
        try {
            setLoading(true);
            const data = await obtenerEventos();

            // Filtrar solo eventos activos
            const eventosActivos = data.filter(evento =>
                evento.estado === 'activo' || evento.estado === 'activa'
            );

            setEventos(eventosActivos);
            setEventosFiltrados(eventosActivos);
            
            // Cargar favoritos
            try {
                const favs = await obtenerFavoritos();
                const favEventos = favs.filter(f => f.tipo === 'evento').map(f => f.itemId);
                setFavoritos(favEventos);
            } catch (favErr) {
                console.log('No se pudieron cargar favoritos:', favErr);
            }
        } catch (err) {
            console.error('Error al cargar eventos:', err);
            setError('No se pudieron cargar los eventos');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...eventos];

        // Filtrar eventos con fecha pasada (no mostrar eventos que ya pasaron)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Resetear a medianoche
        resultado = resultado.filter(evento => {
            if (!evento.fecha) return true; // Mantener eventos sin fecha
            const fechaEvento = new Date(evento.fecha);
            fechaEvento.setHours(0, 0, 0, 0);
            return fechaEvento >= hoy; // Solo mostrar eventos de hoy en adelante
        });

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

    const toggleFavorito = async (eventoId, e) => {
        if (e) e.stopPropagation();
        
        try {
            if (favoritos.includes(eventoId)) {
                const allFavs = await obtenerFavoritos();
                const fav = allFavs.find(f => f.tipo === 'evento' && f.itemId === eventoId);
                if (fav) {
                    await eliminarFavorito(fav.id);
                    setFavoritos(prev => prev.filter(id => id !== eventoId));
                }
            } else {
                await agregarFavorito('evento', eventoId);
                setFavoritos(prev => [...prev, eventoId]);
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
        }
    };

    const formatearFecha = (fecha) => {
        // Parsear la fecha como local en vez de UTC para evitar problemas de zona horaria
        const [year, month, day] = fecha.split('T')[0].split('-');
        const date = new Date(year, month - 1, day);
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

    const generarMes = (mes, anio) => {
        const hoy = new Date();

        // Obtener eventos por fecha
        const eventosPorFecha = {};
        eventosFiltrados.forEach(evento => {
            if (evento.fecha) {
                // Normalizar fecha - solo tomar YYYY-MM-DD
                let fechaNormalizada = evento.fecha;
                if (fechaNormalizada.includes('T')) {
                    fechaNormalizada = fechaNormalizada.split('T')[0];
                }
                if (!eventosPorFecha[fechaNormalizada]) {
                    eventosPorFecha[fechaNormalizada] = [];
                }
                eventosPorFecha[fechaNormalizada].push(evento);
            }
        });

        // Generar días del mes
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const primerDiaSemana = primerDia.getDay();

        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const dias = [];
        // Días vacíos al inicio
        for (let i = 0; i < primerDiaSemana; i++) {
            dias.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Días del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const eventosDelDia = eventosPorFecha[fechaStr] || [];
            const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

            dias.push(
                <div key={dia} className={`calendar-day ${esHoy ? 'today' : ''} ${eventosDelDia.length > 0 ? 'has-events' : ''}`}>
                    <div className="day-number">{dia}</div>
                    <div className="day-events">
                        {eventosDelDia.slice(0, 3).map((evento, idx) => (
                            <div
                                key={idx}
                                className="calendar-event-thumb"
                                title={evento.nombre}
                                onClick={() => {
                                    setEventoSeleccionado(evento);
                                    setModalEventoVisible(true);
                                }}
                            >
                                <img
                                    src={evento.imagen || evento.fotos?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%2342a5f5' width='40' height='40'/%3E%3Ctext fill='white' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🎉%3C/text%3E%3C/svg%3E"}
                                    alt={evento.nombre}
                                />
                            </div>
                        ))}
                        {eventosDelDia.length > 3 && (
                            <div className="more-events">+{eventosDelDia.length - 3}</div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="calendario-mes-wrapper" key={`${mes}-${anio}`}>
                <div className="calendario-mes-header">
                    <h3>{meses[mes]} {anio}</h3>
                </div>
                <div className="calendar-weekdays">
                    <div>Dom</div>
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mié</div>
                    <div>Jue</div>
                    <div>Vie</div>
                    <div>Sáb</div>
                </div>
                <div className="calendar-grid">
                    {dias}
                </div>
            </div>
        );
    };

    const renderCalendario = () => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        // Generar 12 meses (mes actual - 2 hasta mes actual + 9)
        const mesesAMostrar = [];
        for (let i = -2; i <= 9; i++) {
            let mes = mesActual + i;
            let anio = anioActual;

            while (mes < 0) {
                mes += 12;
                anio -= 1;
            }
            while (mes > 11) {
                mes -= 12;
                anio += 1;
            }

            mesesAMostrar.push({ mes, anio });
        }

        return (
            <div className="calendario-container">
                {/* Header con botones - Solo desktop */}
                <div className="calendario-header">
                    <Button
                        className="calendario-nav-btn"
                        icon={<CalendarOutlined />}
                        onClick={() => {
                            if (mesActual === 0) {
                                setMesActual(11);
                                setAnioActual(anioActual - 1);
                            } else {
                                setMesActual(mesActual - 1);
                            }
                        }}
                    >
                        Anterior
                    </Button>
                    <h2>{meses[mesActual]} {anioActual}</h2>
                    <Button
                        className="calendario-nav-btn"
                        icon={<CalendarOutlined />}
                        onClick={() => {
                            if (mesActual === 11) {
                                setMesActual(0);
                                setAnioActual(anioActual + 1);
                            } else {
                                setMesActual(mesActual + 1);
                            }
                        }}
                    >
                        Siguiente
                    </Button>
                </div>

                {/* Scroll horizontal de meses - Solo móvil */}
                <div className="calendario-scroll-container" ref={calendarioScrollRef}>
                    {mesesAMostrar.map(({ mes, anio }) => generarMes(mes, anio))}
                </div>

                {/* Mes único - Solo desktop */}
                <div className="calendario-mes-unico">
                    {generarMes(mesActual, anioActual)}
                </div>
            </div>
        );
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

    // Contar filtros activos
    const contarFiltrosActivos = () => {
        let count = 0;
        if (searchTerm) count++;
        if (fechaDesde) count++;
        if (fechaHasta) count++;
        if (Object.values(categorias).some(v => v)) count++;
        if (filtroPrecio !== 'todos') count++;
        return count;
    };

    return (
        <div className="eventos-container">
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
            </Drawer>

            {/* Sidebar de Filtros - Solo Desktop */}
            <aside className="eventos-sidebar eventos-sidebar-desktop">
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
                            <Option value="fecha">Fecha</Option>
                            <Option value="popularidad">Popularidad</Option>
                            <Option value="precio-menor">$ Menor</Option>
                            <Option value="precio-mayor">$ Mayor</Option>
                        </Select>
                        <div className="mobile-view-switcher">
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
                        </div>
                    </div>

                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1 className="page-title" style={{ color: '#2D5016', fontWeight: 'normal' }}>Próximos Eventos</h1>
                            <p className="page-subtitle">Encuentra tu próxima aventura</p>
                        </div>
                    </div>

                    {/* Controles de vista y ordenamiento - Desktop */}
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

                    {/* Grid de eventos o Calendario */}
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
                    ) : vistaActual === 'calendario' ? (
                        <div className="calendario-view">
                            {renderCalendario()}
                        </div>
                    ) : vistaActual === 'mapa' ? (
                        <div
                            ref={mapRef}
                            className="mapa-view"
                            style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
                        />
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
                                                src={
                                                    evento.imagen ||
                                                    evento.fotos?.[0] ||
                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🎉 Evento%3C/text%3E%3C/svg%3E"
                                                }
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
                                                onClick={(e) => toggleFavorito(evento.id, e)}
                                            />
                                            {evento.cantidadBoletos === 0 ? (
                                                <Tag color="red" className="destacado-tag">
                                                    AGOTADO
                                                </Tag>
                                            ) : (evento.cantidadBoletos > 0 && evento.cantidadBoletos <= 10) ? (
                                                <Tag color="red" className="destacado-tag">
                                                    ¡Últimos lugares!
                                                </Tag>
                                            ) : null}
                                        </div>
                                    }
                                >
                                    <h3 className="evento-nombre">{evento.nombre}</h3>

                                    <div className="evento-info">
                                        <CalendarOutlined />
                                        <span>{formatearFecha(evento.fecha)} - {evento.hora || '00:00'}h</span>
                                    </div>

                                    <div className="evento-info">
                                        <EnvironmentOutlined />
                                        <span>{(() => {
                                            try {
                                                const ubicacionParsed = JSON.parse(evento.ubicacion || '{}');
                                                if (ubicacionParsed.lat && ubicacionParsed.lng) {
                                                    return `${ubicacionParsed.lat.toFixed(4)}, ${ubicacionParsed.lng.toFixed(4)}`;
                                                }
                                                return evento.ubicacion || 'Ubicación por confirmar';
                                            } catch {
                                                return evento.ubicacion || 'Ubicación por confirmar';
                                            }
                                        })()}</span>
                                    </div>

                                    {evento.cantidadBoletos && (
                                        <div className="evento-info" style={{ color: evento.cantidadBoletos < 20 ? '#ff4d4f' : '#52c41a', fontWeight: '500' }}>
                                            🎫 <span>{evento.cantidadBoletos} boletos disponibles</span>
                                        </div>
                                    )}

                                    <div className="evento-footer">
                                        <span className={`evento-precio ${!evento.precio || evento.precio === 0 ? 'gratis' : ''}`}>
                                            {formatearPrecio(evento.precio)}
                                        </span>
                                        <Button 
                                            type="primary" 

                                            onClick={() => navigate(`/experiencia/eventos/${evento.id}`)}
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

            {/* Modal de detalle de evento */}
            <Modal
                open={modalEventoVisible}
                onCancel={() => setModalEventoVisible(false)}
                footer={null}
                width={600}
                style={{ top: 20 }}
                styles={{
                    body: {
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '0'
                    },
                    content: {
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }
                }}
            >
                {eventoSeleccionado && (
                    <div style={{ padding: '16px' }}>
                        {/* Imagen del evento */}
                        {(eventoSeleccionado.imagen || eventoSeleccionado.fotos?.[0]) && (
                            <img
                                src={eventoSeleccionado.imagen || eventoSeleccionado.fotos?.[0]}
                                alt={eventoSeleccionado.nombre}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}
                            />
                        )}

                        {/* Título */}
                        <h2 style={{ color: '#2e7d32', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
                            {eventoSeleccionado.nombre}
                        </h2>

                        {/* Etiqueta de disponibilidad */}
                        {eventoSeleccionado.cantidadBoletos === 0 ? (
                            <Tag color="red" style={{ marginBottom: '16px' }}>AGOTADO</Tag>
                        ) : (eventoSeleccionado.cantidadBoletos > 0 && eventoSeleccionado.cantidadBoletos <= 10) ? (
                            <Tag color="red" style={{ marginBottom: '16px' }}>¡Últimos lugares!</Tag>
                        ) : null}

                        {/* Descripción */}
                        {eventoSeleccionado.descripcion && (
                            <p style={{ color: '#666', marginBottom: '16px', lineHeight: '1.5', fontSize: '14px' }}>
                                {eventoSeleccionado.descripcion}
                            </p>
                        )}

                        {/* Información del evento */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarOutlined style={{ color: '#2e7d32', fontSize: '16px' }} />
                                <span style={{ color: '#333', fontSize: '14px' }}>
                                    {formatearFecha(eventoSeleccionado.fecha)} - {eventoSeleccionado.hora || '00:00'}h
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EnvironmentOutlined style={{ color: '#2e7d32', fontSize: '16px' }} />
                                <span style={{ color: '#333', fontSize: '14px' }}>
                                    {(() => {
                                        try {
                                            const ubicacionParsed = JSON.parse(eventoSeleccionado.ubicacion || '{}');
                                            if (ubicacionParsed.lat && ubicacionParsed.lng) {
                                                return 'Arroyo Seco, Querétaro';
                                            }
                                            return eventoSeleccionado.ubicacion || 'Arroyo Seco, Querétaro';
                                        } catch {
                                            return eventoSeleccionado.ubicacion || 'Arroyo Seco, Querétaro';
                                        }
                                    })()}
                                </span>
                            </div>

                            {eventoSeleccionado.categoria && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AppstoreOutlined style={{ color: '#2e7d32', fontSize: '16px' }} />
                                    <Tag color="green">{eventoSeleccionado.categoria}</Tag>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px', fontWeight: 700, color: '#2e7d32' }}>
                                    {formatearPrecio(eventoSeleccionado.precio)}
                                </span>
                            </div>
                        </div>

                        {/* Botón de acción */}
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<EnvironmentOutlined />}
                            onClick={() => {
                                try {
                                    const ubicacionParsed = JSON.parse(eventoSeleccionado.ubicacion || '{}');
                                    if (ubicacionParsed.lat && ubicacionParsed.lng) {
                                        window.open(
                                            `https://www.google.com/maps?q=${ubicacionParsed.lat},${ubicacionParsed.lng}`,
                                            '_blank'
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error al abrir mapa:', error);
                                }
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #17cf17 0%, #15b515 100%)',
                                border: 'none',
                                height: '44px',
                                fontSize: '15px',
                                fontWeight: 600,
                                borderRadius: '8px'
                            }}
                        >
                            Cómo Llegar
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ListaEventos;