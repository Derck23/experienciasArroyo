import { useState } from 'react';
import { Card, Input, Select, Button, Upload, message, Divider, Space, Typography, Row, Col } from 'antd';
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
    PlusOutlined
} from '@ant-design/icons';

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (estado) => {
        const dataToSubmit = {
            ...formData,
            estado, // 'activa' o 'inactiva'
            fotos: fileList,
            audio: audioFile
        };
        console.log('Datos a enviar:', dataToSubmit);
        message.success(`Atracción guardada como ${estado}!`);
        // Aquí puedes agregar la lógica para enviar los datos al backend
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

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Card
                style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(102, 187, 106, 0.2)',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: '32px' }}
            >
                {/* Header con gradiente */}
                <div style={{
                    background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                    margin: '-32px -32px 32px -32px',
                    padding: '32px',
                    borderRadius: '16px 16px 0 0'
                }}>
                    <Space direction="vertical" size={4}>
                        <Title level={2} style={{ 
                            color: 'white', 
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: '700',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <EnvironmentOutlined style={{ marginRight: '12px' }} />
                            Añadir Nueva Atracción
                        </Title>
                        <Text style={{ 
                            color: 'rgba(255,255,255,0.95)', 
                            fontSize: '15px',
                            display: 'block',
                            marginLeft: '44px'
                        }}>
                            Completa el formulario para registrar un nuevo lugar turístico
                        </Text>
                    </Space>
                </div>

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

                {/* Botones de acción */}
                <Divider style={{ margin: '32px 0', borderColor: '#e0e0e0' }} />
                
                <Row gutter={[16, 16]} justify="end">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Button
                            type="default"
                            size="large"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleSubmit('inactiva')}
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
                            Guardar como Activa
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default GestionDeAtracciones;
