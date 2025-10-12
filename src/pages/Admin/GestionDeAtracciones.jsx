import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Upload, message, Divider, Space, Typography, Row, Col, Table, Modal, Popconfirm, Tag, Spin } from 'antd';
import {
    EnvironmentOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    WarningOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { crearAtraccion, obtenerAtracciones, actualizarAtraccion, eliminarAtraccion, cambiarEstadoAtraccion } from '../../service/atraccionService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const GestionDeAtracciones = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: '',
        descripcion: '',
        latitud: '',
        longitud: '',
        videoUrl: '',
        informacionCultural: '',
        horarios: '',
        costoEntrada: '',
        restricciones: '',
        nivelDificultad: '',
        servicios: ''
    });
    
    const [fileList, setFileList] = useState([]);
    const [audioFile, setAudioFile] = useState([]);
    const [atracciones, setAtracciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [atraccionEditando, setAtraccionEditando] = useState(null);

    // Cargar atracciones al montar el componente
    useEffect(() => {
        cargarAtracciones();
    }, []);

    const cargarAtracciones = async () => {
        setLoading(true);
        try {
            const response = await obtenerAtracciones();
            setAtracciones(response.data || []);
        } catch (error) {
            message.error(error.message || 'Error al cargar las atracciones');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            categoria: '',
            descripcion: '',
            latitud: '',
            longitud: '',
            videoUrl: '',
            informacionCultural: '',
            horarios: '',
            costoEntrada: '',
            restricciones: '',
            nivelDificultad: '',
            servicios: ''
        });
        setFileList([]);
        setAudioFile([]);
        setModoEdicion(false);
        setAtraccionEditando(null);
    };

    const validarFormulario = () => {
        const camposRequeridos = ['nombre', 'categoria', 'descripcion', 'latitud', 'longitud'];
        const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);

        if (camposFaltantes.length > 0) {
            message.error(`Por favor completa los campos: ${camposFaltantes.join(', ')}`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (estado) => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                estado,
                fotos: fileList.map(f => f.thumbUrl || f.url || ''),
                audioUrl: audioFile.length > 0 ? audioFile[0].thumbUrl || '' : ''
            };

            if (modoEdicion && atraccionEditando) {
                await actualizarAtraccion(atraccionEditando, dataToSubmit);
                message.success('Atracción actualizada exitosamente!');
            } else {
                await crearAtraccion(dataToSubmit);
                message.success(`Atracción creada como ${estado}!`);
            }

            resetForm();
            setModalVisible(false);
            cargarAtracciones();
        } catch (error) {
            message.error(error.message || 'Error al guardar la atracción');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (atraccion) => {
        setFormData({
            nombre: atraccion.nombre || '',
            categoria: atraccion.categoria || '',
            descripcion: atraccion.descripcion || '',
            latitud: atraccion.latitud || '',
            longitud: atraccion.longitud || '',
            videoUrl: atraccion.videoUrl || '',
            informacionCultural: atraccion.informacionCultural || '',
            horarios: atraccion.horarios || '',
            costoEntrada: atraccion.costoEntrada || '',
            restricciones: atraccion.restricciones || '',
            nivelDificultad: atraccion.nivelDificultad || '',
            servicios: atraccion.servicios || ''
        });
        setModoEdicion(true);
        setAtraccionEditando(atraccion.id);
        setModalVisible(true);
    };

    const handleEliminar = async (id) => {
        setLoading(true);
        try {
            await eliminarAtraccion(id);
            message.success('Atracción eliminada exitosamente');
            cargarAtracciones();
        } catch (error) {
            message.error(error.message || 'Error al eliminar la atracción');
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        setLoading(true);
        try {
            await cambiarEstadoAtraccion(id, nuevoEstado);
            message.success(`Atracción marcada como ${nuevoEstado}`);
            cargarAtracciones();
        } catch (error) {
            message.error(error.message || 'Error al cambiar el estado');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
        listType: "picture-card",
        multiple: true,
        maxCount: 10,
    };

    const audioUploadProps = {
        onRemove: () => {
            setAudioFile([]);
        },
        beforeUpload: (file) => {
            const isAudio = file.type.startsWith('audio/');
            if (!isAudio) {
                message.error('Solo puedes subir archivos de audio!');
                return false;
            }
            setAudioFile([file]);
            return false;
        },
        fileList: audioFile,
        maxCount: 1,
    };

    // Columnas de la tabla
    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Categoría',
            dataIndex: 'categoria',
            key: 'categoria',
            width: 120,
            render: (categoria) => {
                const emoji = {
                    'cascada': '🌊',
                    'mirador': '🏔️',
                    'cueva': '🕳️',
                    'observatorio': '🔭',
                    'sitio-historico': '🏛️'
                };
                return `${emoji[categoria] || ''} ${categoria}`;
            }
        },
        {
            title: 'Dificultad',
            dataIndex: 'nivelDificultad',
            key: 'nivelDificultad',
            width: 120,
            render: (nivel) => {
                const config = {
                    'facil': { color: 'green', text: 'Fácil' },
                    'moderado': { color: 'orange', text: 'Moderado' },
                    'dificil': { color: 'red', text: 'Difícil' }
                };
                return <Tag color={config[nivel]?.color}>{config[nivel]?.text || nivel}</Tag>;
            }
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            width: 100,
            render: (estado, record) => (
                <Tag 
                    color={estado === 'activa' ? 'green' : 'default'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCambiarEstado(record.id, estado === 'activa' ? 'inactiva' : 'activa')}
                >
                    {estado === 'activa' ? 'Activa' : 'Inactiva'}
                </Tag>
            )
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditar(record)}
                        style={{ background: '#66bb6a', borderColor: '#66bb6a' }}
                    />
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta atracción?"
                        onConfirm={() => handleEliminar(record.id)}
                        okText="Sí"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Spin spinning={loading}>
                {/* Card principal con lista de atracciones */}
                <Card
                    style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(102, 187, 106, 0.2)',
                        marginBottom: '24px'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#2e7d32' }}>
                                <EnvironmentOutlined /> Gestión de Atracciones Turísticas
                            </Title>
                            <Text style={{ color: '#666' }}>
                                Total: {atracciones.length} atracciones registradas
                            </Text>
                        </div>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={cargarAtracciones}
                            >
                                Actualizar
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    resetForm();
                                    setModalVisible(true);
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                                    border: 'none',
                                    height: '40px',
                                    fontWeight: '600'
                                }}
                            >
                                Nueva Atracción
                            </Button>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={atracciones}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} atracciones`
                        }}
                        scroll={{ x: 800 }}
                    />
                </Card>

                {/* Modal para crear/editar atracción */}
                <Modal
                    title={
                        <div style={{
                            background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                            margin: '-20px -24px 20px -24px',
                            padding: '20px 24px',
                            color: 'white'
                        }}>
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                <EnvironmentOutlined style={{ marginRight: '12px' }} />
                                {modoEdicion ? 'Editar Atracción' : 'Nueva Atracción'}
                            </Title>
                        </div>
                    }
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                    footer={null}
                    width={900}
                    style={{ top: 20 }}
                    bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                >

                {/* Información Básica */}
                <div style={{ marginBottom: '32px' }}>
                    <Title level={4} style={{ 
                        color: '#2e7d32', 
                        marginBottom: '24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '20px',
                            background: 'linear-gradient(180deg, #66bb6a, #43a047)',
                            borderRadius: '2px'
                        }} />
                        Información Básica
                    </Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                    Nombre de la Atracción *
                                </Text>
                                <Input
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Cascada El Salto"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                    Categoría *
                                </Text>
                                <Select
                                    name="categoria"
                                    value={formData.categoria || undefined}
                                    onChange={(value) => handleInputChange({ target: { name: 'categoria', value } })}
                                    placeholder="Selecciona una categoría"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <Option value="cascada">🌊 Cascada</Option>
                                    <Option value="mirador">🏔️ Mirador</Option>
                                    <Option value="cueva">🕳️ Cueva</Option>
                                    <Option value="observatorio">🔭 Observatorio</Option>
                                    <Option value="sitio-historico">🏛️ Sitio Histórico</Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: '32px' }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                            Descripción Detallada *
                        </Text>
                        <TextArea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            placeholder="Describe la atracción, su belleza, importancia histórica y cultural..."
                            rows={5}
                            style={{ 
                                borderRadius: '8px',
                                border: '2px solid #e0e0e0',
                                fontSize: '14px',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </Space>
                </div>

                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />

                {/* Ubicación */}
                <div style={{ marginBottom: '32px' }}>
                    <Title level={4} style={{ 
                        color: '#2e7d32', 
                        marginBottom: '24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '20px',
                            background: 'linear-gradient(180deg, #66bb6a, #43a047)',
                            borderRadius: '2px'
                        }} />
                        <EnvironmentOutlined /> Ubicación
                    </Title>
                    
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '350px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '24px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        border: '3px solid #e8f5e9'
                    }}>
                        <div
                            style={{ 
                                width: '100%',
                                height: '100%',
                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmn2mN4V2KEsKZtoQ09LWXn-ZgIJeWxkTLrR4G1kZuGADDFHFM1wxDc9-iD6XeOI-Z9Li3B5zAWSoSE_6EN8fHhxpIYgCMWFxJFXtR9MdO3P-9J-Sir3B3w-GYm7BOoBaPCQO7MxYJHtF8KCebLv-BMvUAORwSIm4GXDELC7u95WbD-yqah11EvCsul0l5_nFL0PY6iStWK18rcnYHRLtyZTwexsdPCpGTnjm22w1VbV_yqhaz-QVIHiW4Bcs3Hf2AcclFOZh44A7H")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'rgba(255,255,255,0.95)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <EnvironmentOutlined style={{ color: '#43a047', fontSize: '18px' }} />
                            <Text strong style={{ color: '#2e7d32' }}>Vista previa del mapa</Text>
                        </div>
                    </div>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                    📍 Latitud
                                </Text>
                                <Input
                                    name="latitud"
                                    value={formData.latitud}
                                    onChange={handleInputChange}
                                    placeholder="Ej. 20.8833"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                    📍 Longitud
                                </Text>
                                <Input
                                    name="longitud"
                                    value={formData.longitud}
                                    onChange={handleInputChange}
                                    placeholder="Ej. -99.6667"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                    </Row>
                </div>

                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />

                {/* Multimedia */}
                <div style={{ marginBottom: '32px' }}>
                    <Title level={4} style={{ 
                        color: '#2e7d32', 
                        marginBottom: '24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '20px',
                            background: 'linear-gradient(180deg, #66bb6a, #43a047)',
                            borderRadius: '2px'
                        }} />
                        <PictureOutlined /> Multimedia
                    </Title>
                    
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        {/* Fotos */}
                        <div style={{
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '2px dashed #66bb6a'
                        }}>
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #66bb6a, #43a047)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(102, 187, 106, 0.3)'
                                    }}>
                                        <PictureOutlined style={{ fontSize: '24px', color: 'white' }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: '16px', color: '#2e7d32', display: 'block' }}>
                                            Galería de Fotos
                                        </Text>
                                        <Text style={{ fontSize: '13px', color: '#666' }}>
                                            Máximo 10 fotos • Formatos: JPG, PNG, WebP
                                        </Text>
                                    </div>
                                </div>
                                <Upload {...uploadProps}>
                                    <Button 
                                        icon={<PlusOutlined />} 
                                        size="large"
                                        style={{
                                            borderRadius: '8px',
                                            height: '120px',
                                            width: '120px',
                                            border: '2px dashed #66bb6a',
                                            background: 'white'
                                        }}
                                    >
                                        <div style={{ marginTop: '8px' }}>Subir</div>
                                    </Button>
                                </Upload>
                            </Space>
                        </div>

                        {/* Video */}
                        <div>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <VideoCameraOutlined style={{ fontSize: '18px', color: '#43a047' }} />
                                    <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                        Enlace de Video (Opcional)
                                    </Text>
                                </div>
                                <Input
                                    name="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                                    size="large"
                                    prefix={<VideoCameraOutlined style={{ color: '#66bb6a' }} />}
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </div>

                        {/* Audio */}
                        <div style={{
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '2px dashed #66bb6a'
                        }}>
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #66bb6a, #43a047)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(102, 187, 106, 0.3)'
                                    }}>
                                        <AudioOutlined style={{ fontSize: '24px', color: 'white' }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: '16px', color: '#2e7d32', display: 'block' }}>
                                            Audioguía
                                        </Text>
                                        <Text style={{ fontSize: '13px', color: '#666' }}>
                                            Archivo de audio MP3 para la guía turística
                                        </Text>
                                    </div>
                                </div>
                                <Upload {...audioUploadProps}>
                                    <Button 
                                        icon={<AudioOutlined />} 
                                        size="large"
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #66bb6a',
                                            background: 'white',
                                            fontWeight: '600',
                                            color: '#43a047'
                                        }}
                                    >
                                        Seleccionar Archivo de Audio
                                    </Button>
                                </Upload>
                            </Space>
                        </div>
                    </Space>
                </div>

                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />

                {/* Información Cultural */}
                <div style={{ marginBottom: '32px' }}>
                    <Title level={4} style={{ 
                        color: '#2e7d32', 
                        marginBottom: '24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '20px',
                            background: 'linear-gradient(180deg, #66bb6a, #43a047)',
                            borderRadius: '2px'
                        }} />
                        📚 Información Cultural e Histórica
                    </Title>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                            Contexto Cultural e Histórico
                        </Text>
                        <TextArea
                            name="informacionCultural"
                            value={formData.informacionCultural}
                            onChange={handleInputChange}
                            placeholder="Añade información relevante sobre la historia, cultura, tradiciones y significado del lugar..."
                            rows={6}
                            style={{ 
                                borderRadius: '8px',
                                border: '2px solid #e0e0e0',
                                fontSize: '14px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </Space>
                </div>

                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />

                {/* Configuración */}
                <div style={{ marginBottom: '32px' }}>
                    <Title level={4} style={{ 
                        color: '#2e7d32', 
                        marginBottom: '24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '20px',
                            background: 'linear-gradient(180deg, #66bb6a, #43a047)',
                            borderRadius: '2px'
                        }} />
                        ⚙️ Configuración y Detalles
                    </Title>
                    
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ClockCircleOutlined style={{ fontSize: '16px', color: '#43a047' }} />
                                    <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                        Horarios
                                    </Text>
                                </div>
                                <Input
                                    name="horarios"
                                    value={formData.horarios}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Lunes a Domingo 9:00 AM - 6:00 PM"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <DollarOutlined style={{ fontSize: '16px', color: '#43a047' }} />
                                    <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                        Costo de Entrada
                                    </Text>
                                </div>
                                <Input
                                    name="costoEntrada"
                                    value={formData.costoEntrada}
                                    onChange={handleInputChange}
                                    placeholder="Ej. $50 MXN o Entrada gratuita"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <WarningOutlined style={{ fontSize: '16px', color: '#43a047' }} />
                                    <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                        Restricciones
                                    </Text>
                                </div>
                                <Input
                                    name="restricciones"
                                    value={formData.restricciones}
                                    onChange={handleInputChange}
                                    placeholder="Ej. No se permiten mascotas"
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '2px solid #e0e0e0'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ThunderboltOutlined style={{ fontSize: '16px', color: '#43a047' }} />
                                    <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                        Nivel de Dificultad
                                    </Text>
                                </div>
                                <Select
                                    name="nivelDificultad"
                                    value={formData.nivelDificultad || undefined}
                                    onChange={(value) => handleInputChange({ target: { name: 'nivelDificultad', value } })}
                                    placeholder="Selecciona el nivel"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    <Option value="facil">✅ Fácil - Accesible para todos</Option>
                                    <Option value="moderado">⚠️ Moderado - Requiere condición física</Option>
                                    <Option value="dificil">🔥 Difícil - Solo expertos</Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '24px' }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Text strong style={{ color: '#424242', fontSize: '14px' }}>
                                🛠️ Servicios y Amenidades Disponibles
                            </Text>
                            <TextArea
                                name="servicios"
                                value={formData.servicios}
                                onChange={handleInputChange}
                                placeholder="Ej. Estacionamiento gratuito, sanitarios, área de picnic, tienda de souvenirs, guías turísticos..."
                                rows={4}
                                style={{ 
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '14px'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </Space>
                    </div>
                </div>

                {/* Botones de acción del modal */}
                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />
                
                <Row gutter={[16, 16]} justify="end">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Button
                            type="default"
                            size="large"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleSubmit('inactiva')}
                            loading={loading}
                            block
                            style={{
                                height: '48px',
                                borderRadius: '10px',
                                border: '2px solid #66bb6a',
                                color: '#43a047',
                                fontWeight: '600',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                boxShadow: '0 2px 8px rgba(102, 187, 106, 0.2)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e8f5e9';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 187, 106, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 187, 106, 0.2)';
                            }}
                        >
                            Guardar como Inactiva
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleSubmit('activa')}
                            loading={loading}
                            block
                            style={{
                                height: '48px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '15px',
                                boxShadow: '0 4px 16px rgba(102, 187, 106, 0.4)',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 187, 106, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 187, 106, 0.4)';
                            }}
                        >
                            {modoEdicion ? 'Actualizar' : 'Guardar como Activa'}
                        </Button>
                    </Col>
                </Row>
                </Modal>
            </Spin>
        </div>
    );
};

export default GestionDeAtracciones;
