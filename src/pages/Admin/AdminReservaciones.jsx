import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Card, Input, Select } from 'antd';
import { FilePdfOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { obtenerTodasReservaciones, actualizarEstadoReservacion } from '../../service/reservacionService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminReservaciones.css'; // <--- 1. IMPORTAR EL CSS

const { Option } = Select;

const AdminReservaciones = () => {
    const [reservaciones, setReservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const data = await obtenerTodasReservaciones();
            const dataOrdenada = data.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
            setReservaciones(dataOrdenada);
        } catch (error) {
            message.error('Error al cargar reservaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await actualizarEstadoReservacion(id, nuevoEstado);
            message.success(`Reservación ${nuevoEstado} exitosamente`);
            cargarDatos();
        } catch (error) {
            message.error('No se pudo actualizar el estado');
        }
    };

    const generarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte de Reservaciones - Sierra Explora', 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Cliente", "Servicio", "Fecha", "Hora", "Personas", "Estado", "Comentarios"];
        const tableRows = [];

        datosFiltrados.forEach(ticket => {
            const rowData = [
                ticket.nombreCliente || 'Anónimo',
                ticket.nombreServicio,
                ticket.fechaReserva,
                ticket.horaReserva,
                ticket.numeroPersonas,
                ticket.estado.toUpperCase(),
                ticket.comentarios || '-'
            ];
            tableRows.push(rowData);
        });

        // CORRECCIÓN PDF: Usar la función importada directamente
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [0, 115, 92] }
        });

        doc.save('reporte_reservaciones.pdf');
    };

    const datosFiltrados = reservaciones.filter(item => {
        const textoBusqueda = searchText.toLowerCase();
        const matchNombre = 
            item.nombreServicio.toLowerCase().includes(textoBusqueda) ||
            (item.nombreCliente && item.nombreCliente.toLowerCase().includes(textoBusqueda));
        const matchEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
        return matchNombre && matchEstado;
    });

    const columns = [
        {
            title: 'Cliente',
            dataIndex: 'nombreCliente',
            key: 'nombreCliente',
            sorter: (a, b) => (a.nombreCliente || '').localeCompare(b.nombreCliente || ''),
            width: 150,
        },
        {
            title: 'Servicio',
            dataIndex: 'nombreServicio',
            key: 'nombreServicio',
            sorter: (a, b) => a.nombreServicio.localeCompare(b.nombreServicio),
            width: 200, // <--- DAR ANCHOS A LAS COLUMNAS
        },
        {
            title: 'Fecha',
            dataIndex: 'fechaReserva',
            key: 'fechaReserva',
            width: 120,
            sorter: (a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva),
        },
        {
            title: 'Hora',
            dataIndex: 'horaReserva',
            key: 'horaReserva',
            width: 100,
        },
        {
            title: 'Pax',
            dataIndex: 'numeroPersonas',
            key: 'numeroPersonas',
            align: 'center',
            width: 80,
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            width: 120,
            render: (estado) => {
                let color = 'orange';
                if (estado === 'confirmada') color = 'green';
                if (estado === 'cancelada') color = 'red';
                return <Tag color={color}>{estado.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    {record.estado === 'pendiente' && (
                        <>
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<CheckCircleOutlined />} 
                                onClick={() => handleCambiarEstado(record.id, 'confirmada')}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Confirmar
                            </Button>
                            <Button 
                                type="primary" 
                                danger 
                                size="small"
                                icon={<CloseCircleOutlined />} 
                                onClick={() => handleCambiarEstado(record.id, 'cancelada')}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-container"> {/* <--- CLASE CSS */}
            <Card 
                title="Gestión de Reservaciones" 
                extra={
                    <Button type="primary" icon={<FilePdfOutlined />} onClick={generarPDF}>
                        PDF
                    </Button>
                }
            >
                {/* Barra de Filtros Responsiva */}
                <div className="admin-filtros"> {/* <--- CLASE CSS */}
                    <Input 
                        placeholder="Buscar cliente o servicio..." 
                        prefix={<SearchOutlined />} 
                        className="filtro-item" // <--- CLASE CSS
                        onChange={e => setSearchText(e.target.value)} 
                    />
                    
                    <Select 
                        defaultValue="todos" 
                        className="filtro-select" // <--- CLASE CSS
                        onChange={value => setFiltroEstado(value)}
                    >
                        <Option value="todos">Todos los estados</Option>
                        <Option value="pendiente">Pendientes</Option>
                        <Option value="confirmada">Confirmadas</Option>
                        <Option value="cancelada">Canceladas</Option>
                    </Select>
                </div>

                {/* Tabla Responsiva */}
                <Table 
                    columns={columns} 
                    dataSource={datosFiltrados} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }} // <--- LA CLAVE: Scroll horizontal si es menor a 1000px
                    expandable={{
                        expandedRowRender: (record) => <p style={{ margin: 0 }}><strong>Comentarios:</strong> {record.comentarios || 'Ninguno'}</p>,
                    }}
                />
            </Card>
        </div>
    );
};

export default AdminReservaciones;