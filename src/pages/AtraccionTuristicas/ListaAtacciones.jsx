import React, { useState } from 'react';
import { Input, Dropdown, Menu } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import {
    MountainSnow,
    Map,
    BarChart2,
    MapPin
} from 'lucide-react';
import './ListaAtacciones.css';

const ListaAtacciones = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');

    const atracciones = [
        {
            id: 1,
            nombre: 'Cascada Escondida',
            categoria: 'Cascadas',
            dificultad: 'Fácil',
            distancia: '5 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3OXpsEjM5es8lAba_byV6G_YNGfYm9Q0fy9quxVMWGp_aexk4ifCLxMJ1nxuVb1tqDwgjDpc8Ra1Xc6w6FegKCxUQHvDUQXNAwtoqTIx6PAG8Ee6pMlAyGi4IM7uKqwXlYy6NAUHKb3BiLdU_y1rydHElS2jajsPZdv3dv5v8fExFCpwrM8ot9-5mDogWg-hQS8j_Y0yPzNz0kbLYScYc_Nf-TtwRD4HZV-h01UetSVJEjRp130zVhO7OxW_141bG9J3DTdXAkpZv'
        },
        {
            id: 2,
            nombre: 'Mirador del Valle',
            categoria: 'Miradores',
            dificultad: 'Moderado',
            distancia: '12 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrilxdtGHTbFVasF4g9DTDgqA7bFQ_2woirXR5d5rFzQrdjxBgNyVUxPRUscKkvzUwk4TBPGuHWFWnMdKeKYW2Uhw9RryZWpmn_GvBSbUpdMtRad0BcD9BD-dCUOjBek-T-rGtymXGBcEr2mBFt9kXxCtk6lCKaIAiQy3xrK-NOOPULz0gftTJT45XCKz7KNvyjvTedzoEtvDKSAKjiIgTa-aqBoMJ3XljIZmySq-Sg1QpeDFH6bBRGICBVnW_IbSNb9dXL1m4cWVe'
        },
        {
            id: 3,
            nombre: 'Ruta de Senderismo El Robledal',
            categoria: 'Senderismo',
            dificultad: 'Difícil',
            distancia: '20 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnMrW0b0LI-IUp2rF8CgZUnpsFAhPOx7E-0lNLAhpNulY5gykn78x0kylOP2qRG-C7HUEAVnPVXgVd4kct_K_IjhDjLov75v77XYagK3xIYCoCPGQtyozCI1gXEw31gMCB42tGWNczYsYXOthcXftUZI4f7qKEobNxX90dsWuAhQVzQJJFDK9AOmbj0elJcjopleC-3x3TOG4ARKrgM_Oinebsl12scK1I5NLmxXIA73RBPonpph0qGI58Vh6oSW5Pj_cik5WtIMVU'
        },
        {
            id: 4,
            nombre: 'Pueblo Mágico San Rafael',
            categoria: 'Pueblos',
            dificultad: 'Fácil',
            distancia: '8 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgeWsnfFQYtvfcB0QNuuqB70c9m74Kp8tGmvB9bATn3PQkCtXUcydxmUNLN7phDEgNlPgvnAglOTDl5U66H-emb7igyxeh1wm_dQhpx_P_nRuZTtpgec77G2RQIMHax5r4aRP6e-cXxJBV9UhfBc1xM3yuW86gPevUvMgGZLtRIBcZGL9gcEogleR7WpnEpVkVb-WsaV5MLBmqNGZvrZa_fNalsMjAgIcg-dxRNqDF0xe3pFa7FpUZCk7I9QpJcf336vYBBKsTkC1j'
        },
        {
            id: 5,
            nombre: 'Viñedos La Casona',
            categoria: 'Gastronomía',
            dificultad: 'Fácil',
            distancia: '15 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm0bHdXjQYjqLksE7F4hLULyrvkVXV5jSuOXOnwyp_wqeJwjgp5ZtblKAmLK7hpAkCeq-DnqujEDuvRRM9Los6CWB4BxwD_pEO8nojIeeLpNNeJYwLJ6n5yR6kZ_fFqK8nhKd8bovj92WUrdQOcNBjJATH2mepqt09DVzOAQ8shFGAUdofg4UDE4OQ_Ic0j5aehVGSw_qQpWD27pNT7bbDA4wKv5gj0NJo0ytqmlXntdI3RaJpqu0Mgck0TnvKEmh6vnkZlWXO17yj'
        },
        {
            id: 6,
            nombre: 'Río Cristalino',
            categoria: 'Ríos y Balnearios',
            dificultad: 'Moderado',
            distancia: '10 km',
            imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHgFEK5wJ7jxk1m2YpJokURu-Ynecha498ldX9hPzeG8Of4zlBdYM8yGCnt2ptQaCOMuRhLxtF48VsJ_nvGu4PWlLNM1JbyHqlFfVBg7uW5sskjFIzowGdTsYJXjEsMF2sj_bGlEHJsrynYb97BC5dDX5q620L2q7oqrM9jAo6kiysClP17ZMbrggcTjvdlOEzPsc0ORpQQ_PN1plH-aMN158src0T9n7EGEyuMXOX1jJsyLt4-UzY4VLurdlaD8S8KYw-M2mO8D95'
        }
    ];

    const categorias = ['Todas', 'Cascadas', 'Miradores', 'Senderismo', 'Pueblos', 'Gastronomía', 'Ríos y Balnearios'];
    const dificultades = ['Todas', 'Fácil', 'Moderado', 'Difícil'];

    const menuCategoria = (
        <Menu onClick={({ key }) => setSelectedCategory(key)}>
            {categorias.map(cat => (
                <Menu.Item key={cat}>{cat}</Menu.Item>
            ))}
        </Menu>
    );

    const menuDificultad = (
        <Menu onClick={({ key }) => setSelectedDifficulty(key)}>
            {dificultades.map(dif => (
                <Menu.Item key={dif}>{dif}</Menu.Item>
            ))}
        </Menu>
    );

    const atraccionesFiltradas = atracciones.filter(atraccion => {
        const matchSearch = atraccion.nombre.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = selectedCategory === 'Todas' || atraccion.categoria === selectedCategory;
        const matchDifficulty = selectedDifficulty === 'Todas' || atraccion.dificultad === selectedDifficulty;
        return matchSearch && matchCategory && matchDifficulty;
    });

    return (
        <div className="page-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <MountainSnow className="header-icon" size={24} />
                    <h1 className="header-title">Explora Arroyo Seco</h1>
                </div>
                <div className="header-actions">
                    <button className="map-button">
                        <Map size={24} />
                        <span className="sr-only">Ver mapa</span>
                    </button>
                    <div
                        className="user-avatar"
                        style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCXppNsFMK3G0goDXKyvsGXVeF1btEAm1lakAnVnx5O0CKQ7EqsOhPbvQblfSP3nrMC_BsDI-G7mi2imS1jzkQ6LO-iFRIRrY0OHT2BOc_b9s6xtdcKFMQ-cCg_nhTkhG32HBcQ4NlouOTmSSxIMAzzBcE4Z0GmGi8fVYPH1-XTDf9MzYTyvtxOefVmFo71dbZEguugsirlfRau898-fQBSdR9Pn6Av4WZ2X5fe67oWDoPrYIBNCLo82Yi79bc1czt8wVeLQ8bo6q2o")'
                        }}
                    />
                </div>
            </header>

            {/* Main Content */}
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

                        <Dropdown overlay={menuCategoria} trigger={['click']}>
                            <button className="filter-button">
                                {selectedCategory}
                                <DownOutlined style={{ fontSize: '12px' }} />
                            </button>
                        </Dropdown>

                        <Dropdown overlay={menuDificultad} trigger={['click']}>
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
                                            {atraccion.distancia}
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