import React, { useState, useEffect } from 'react';
import {
  Card, Input, Select, Button, Upload, message, Divider, Space, Typography, Row, Col, Table, Modal, Popconfirm, Tag, Spin, TimePicker
} from 'antd';
import {
  EnvironmentOutlined, PictureOutlined, VideoCameraOutlined, AudioOutlined, ClockCircleOutlined,
  DollarOutlined, WarningOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined
} from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import dayjs from 'dayjs';

import {
  crearAtraccion, obtenerAtracciones, actualizarAtraccion,
  eliminarAtraccion, cambiarEstadoAtraccion
} from '../../service/atraccionService';

import { comprimirYConvertirImagen, convertirAudioABase64, validarTamañoArchivo } from '../../utils/imageUtils';

import './GestionDeAtracciones.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const GOOGLE_MAPS_APIKEY = 'AIzaSyD6vEAeGtBjMT1zQUlFnuvJV9YORgXSFGk';

const mapContainerStyle = { width: '100%', height: '400px' };

const defaultCenter = {
  lat: 21.1877,
  lng: -99.6783
};

const GestionDeAtracciones = () => {
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '',
    videoUrl: '', informacionCultural: '', horarios: '', costoEntrada: '',
    restricciones: '', nivelDificultad: '', servicios: '',
    diaInicio: '', diaFin: '', horaInicio: null, horaFin: null
  });

  const [fileList, setFileList] = useState([]);
  const [audioFile, setAudioFile] = useState([]);
  const [atracciones, setAtracciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [atraccionEditando, setAtraccionEditando] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_APIKEY
  });

  useEffect(() => {
    cargarAtracciones();
  }, []);

  const cargarAtracciones = async () => {
    setLoading(true);
    try {
      const response = await obtenerAtracciones();
      setAtracciones(response || []);
    } catch (error) {
      message.error(error.message || 'Error al cargar las atracciones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target ?? {};
    // For Select changes we send a synthetic event { target: { name, value } } from the onChange handler
    if (!name) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e) => {
    setSelectedPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '', descripcion: '',
      videoUrl: '', informacionCultural: '', horarios: '', costoEntrada: '',
      restricciones: '', nivelDificultad: '', servicios: '',
      diaInicio: '', diaFin: '', horaInicio: null, horaFin: null
    });
    setFileList([]);
    setAudioFile([]);
    setModoEdicion(false);
    setAtraccionEditando(null);
    setSelectedPosition(null);
  };

  const validarFormulario = () => {
    console.log('=== INICIANDO VALIDACIÓN ===');

    // Validar campos requeridos
    console.log('1. Validando campos requeridos...');
    const camposRequeridos = ['nombre', 'descripcion'];
    const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]?.trim());
    console.log('Campos faltantes:', camposFaltantes);
    if (camposFaltantes.length > 0) {
      message.error(`Por favor completa los campos: ${camposFaltantes.join(', ')}`);
      console.log('FALLÓ: campos requeridos');
      return false;
    }

    // Validar longitud de nombre
    console.log('2. Validando longitud de nombre:', formData.nombre.trim().length);
    if (formData.nombre.trim().length < 3) {
      message.error('El nombre debe tener al menos 3 caracteres');
      console.log('FALLÓ: nombre muy corto');
      return false;
    }
    if (formData.nombre.trim().length > 100) {
      message.error('El nombre no puede exceder 100 caracteres');
      console.log('FALLÓ: nombre muy largo');
      return false;
    }

    // Validar longitud de descripción
    console.log('3. Validando longitud de descripción:', formData.descripcion.trim().length);
    if (formData.descripcion.trim().length < 10) {
      message.error('La descripción debe tener al menos 10 caracteres');
      console.log('FALLÓ: descripción muy corta');
      return false;
    }
    if (formData.descripcion.trim().length > 1000) {
      message.error('La descripción no puede exceder 1000 caracteres');
      console.log('FALLÓ: descripción muy larga');
      return false;
    }

    // Validar ubicación en el mapa
    console.log('4. Validando ubicación en el mapa:', selectedPosition);
    if (!selectedPosition) {
      message.error('Por favor selecciona una ubicación en el mapa');
      console.log('FALLÓ: sin ubicación');
      return false;
    }

    // Validar costo de entrada si se proporciona
    console.log('5. Validando costo de entrada:', formData.costoEntrada);
    if (formData.costoEntrada && formData.costoEntrada !== 'Gratuito') {
      const costo = parseFloat(formData.costoEntrada);
      console.log('Costo parseado:', costo);
      if (isNaN(costo) || costo < 0) {
        message.error('El costo de entrada debe ser un número válido mayor o igual a 0');
        console.log('FALLÓ: costo inválido');
        return false;
      }
      if (costo > 10000) {
        message.error('El costo de entrada no puede exceder $10,000 MXN');
        console.log('FALLÓ: costo muy alto');
        return false;
      }
    }

    // Validar URL del video si se proporciona
    console.log('6. Validando URL de video:', formData.videoUrl);
    if (formData.videoUrl && formData.videoUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/i;
      if (!urlPattern.test(formData.videoUrl)) {
        message.error('Por favor ingresa una URL válida de YouTube o Vimeo');
        console.log('FALLÓ: URL de video inválida');
        return false;
      }
    }

    // Validar que haya al menos una imagen
    console.log('7. Validando imágenes, fileList.length:', fileList.length);
    if (fileList.length === 0) {
      message.error('Por favor agrega al menos una imagen de la atracción');
      console.log('FALLÓ: sin imágenes');
      return false;
    }

    // Validar horarios (si se proporciona alguno, deben estar todos completos)
    console.log('8. Validando horarios...');
    console.log('diaInicio:', formData.diaInicio);
    console.log('diaFin:', formData.diaFin);
    console.log('horaInicio:', formData.horaInicio);
    console.log('horaFin:', formData.horaFin);
    const tieneAlgunHorario = formData.diaInicio || formData.diaFin || formData.horaInicio || formData.horaFin;
    console.log('tieneAlgunHorario:', tieneAlgunHorario);
    if (tieneAlgunHorario) {
      if (!formData.diaInicio) {
        message.error('Por favor selecciona el día de inicio');
        console.log('FALLÓ: sin día de inicio');
        return false;
      }
      if (!formData.diaFin) {
        message.error('Por favor selecciona el día de fin');
        console.log('FALLÓ: sin día de fin');
        return false;
      }
      if (!formData.horaInicio) {
        message.error('Por favor selecciona la hora de apertura');
        console.log('FALLÓ: sin hora de apertura');
        return false;
      }
      if (!formData.horaFin) {
        message.error('Por favor selecciona la hora de cierre');
        console.log('FALLÓ: sin hora de cierre');
        return false;
      }
    }

    console.log('=== VALIDACIÓN COMPLETA - PASÓ ===');
    return true;
  };

  const handleSubmit = async (estado) => {
    console.log('handleSubmit llamado con estado:', estado);
    console.log('formData:', formData);
    console.log('fileList:', fileList);
    console.log('selectedPosition:', selectedPosition);

    if (!validarFormulario()) {
      console.log('Validación falló');
      return;
    }

    console.log('Validación pasó, procediendo a guardar...');
    setLoading(true);
    try {
      // Procesar imágenes -> mantener las ya existentes (tienen url) y convertir nuevas (SOLO 1 IMAGEN)
      const fotosBase64 = [];
      for (const file of fileList) {
        if (file.url) {
          fotosBase64.push(file.url);
        } else if (file.originFileObj) {
          if (!validarTamañoArchivo(file.originFileObj, 5)) {
            throw new Error(`La imagen ${file.name} supera el tamaño máximo de 5MB`);
          }
          const base64 = await comprimirYConvertirImagen(file.originFileObj, 800, 600, 0.8);
          fotosBase64.push(base64);
        }
      }

      // Procesar audio
      let audioBase64 = '';
      if (audioFile.length > 0) {
        const af = audioFile[0];
        if (af.url) audioBase64 = af.url;
        else if (af.originFileObj) {
          if (!validarTamañoArchivo(af.originFileObj, 10)) {
            throw new Error('El archivo de audio supera el tamaño máximo de 10MB');
          }
          audioBase64 = await convertirAudioABase64(af.originFileObj);
        }
      }

      const dataToSubmit = {
        ...formData,
        estado,
        fotos: fotosBase64,
        audioUrl: audioBase64,
        latitud: selectedPosition.lat,
        longitud: selectedPosition.lng,
        horaInicio: formData.horaInicio && formData.horaInicio.format ? formData.horaInicio.format('hh:mm A') : formData.horaInicio,
        horaFin: formData.horaFin && formData.horaFin.format ? formData.horaFin.format('hh:mm A') : formData.horaFin
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
      nombre: atraccion.nombre || '', categoria: atraccion.categoria || '',
      descripcion: atraccion.descripcion || '', videoUrl: atraccion.videoUrl || '',
      informacionCultural: atraccion.informacionCultural || '', horarios: atraccion.horarios || '',
      costoEntrada: atraccion.costoEntrada || '', restricciones: atraccion.restricciones || '',
      nivelDificultad: atraccion.nivelDificultad || '', servicios: atraccion.servicios || '',
      diaInicio: atraccion.diaInicio || '', diaFin: atraccion.diaFin || '',
      horaInicio: atraccion.horaInicio ? dayjs(atraccion.horaInicio, 'hh:mm A') : null,
      horaFin: atraccion.horaFin ? dayjs(atraccion.horaFin, 'hh:mm A') : null
    });

    // Cargar posición en el mapa
    if (atraccion.latitud && atraccion.longitud) {
      setSelectedPosition({
        lat: parseFloat(atraccion.latitud),
        lng: parseFloat(atraccion.longitud)
      });
    }

    // Cargar solo la primera imagen (limitado a 1)
    if (atraccion.fotos && Array.isArray(atraccion.fotos) && atraccion.fotos.length > 0) {
      const existingFiles = atraccion.fotos
        .slice(0, 1) // Solo tomar la primera imagen
        .filter(f => f)
        .map((foto, index) => ({
          uid: `existing-${index}-${Date.now()}`,
          name: `imagen-${index + 1}.jpg`,
          status: 'done',
          url: foto,
          thumbUrl: foto
        }));
      setFileList(existingFiles);
    } else setFileList([]);

    if (atraccion.audioUrl && atraccion.audioUrl !== '') {
      setAudioFile([{
        uid: `existing-audio-${Date.now()}`,
        name: 'audio.mp3',
        status: 'done',
        url: atraccion.audioUrl
      }]);
    } else setAudioFile([]);

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
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Solo puedes subir archivos de imagen!');
        return false;
      }
      if (!validarTamañoArchivo(file, 5)) {
        message.error('La imagen no debe superar los 5MB!');
        return false;
      }
      const newFile = {
        uid: `new-${Date.now()}-${Math.random()}`,
        name: file.name,
        status: 'done',
        originFileObj: file
      };
      setFileList([newFile]); // Solo una imagen
      return false; // prevent auto upload
    },
    fileList,
    listType: "picture-card",
    multiple: false,
    maxCount: 1,
  };

  const audioUploadProps = {
    onRemove: () => setAudioFile([]),
    beforeUpload: (file) => {
      const isAudio = file.type.startsWith('audio/');
      if (!isAudio) {
        message.error('Solo puedes subir archivos de audio!');
        return false;
      }
      if (!validarTamañoArchivo(file, 10)) {
        message.error('El audio no debe superar los 10MB!');
        return false;
      }
      setAudioFile([{
        uid: `new-audio-${Date.now()}`,
        name: file.name,
        status: 'done',
        originFileObj: file
      }]);
      return false;
    },
    fileList: audioFile,
    maxCount: 1,
  };

  const columns = [
    {
      title: 'Imagen',
      dataIndex: 'fotos',
      key: 'imagen',
      width: 100,
      render: (fotos) => {
        const primeraFoto = fotos && fotos.length > 0 ? fotos[0] : null;
        return primeraFoto ? (
          <img
            src={primeraFoto}
            alt="Atracción"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '60px',
            height: '60px',
            background: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PictureOutlined style={{ fontSize: '24px', color: '#bbb' }} />
          </div>
        );
      }
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (descripcion) => (
        <span style={{ color: '#666' }}>
          {descripcion && descripcion.length > 60 ? descripcion.substring(0, 60) + '...' : descripcion}
        </span>
      )
    },
    {
      title: 'Dificultad', dataIndex: 'nivelDificultad', key: 'nivelDificultad', render: (nivel) => {
        const config = { 'facil': { color: 'green', text: 'Fácil' }, 'moderado': { color: 'orange', text: 'Moderado' }, 'dificil': { color: 'red', text: 'Difícil' } };
        return <Tag color={config[nivel]?.color}>{config[nivel]?.text || nivel}</Tag>;
      }
    },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado', render: (estado, record) => (
        <Tag className="clickable-tag" color={estado === 'activa' ? 'green' : 'default'} onClick={() => handleCambiarEstado(record.id, estado === 'activa' ? 'inactiva' : 'activa')}>
          {estado === 'activa' ? 'Activa' : 'Inactiva'}
        </Tag>
      )
    },
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space size="small" className="actions-col">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEditar(record)} className="btn-edit" />
          <Popconfirm title="¿Estás seguro de eliminar esta atracción?" onConfirm={() => handleEliminar(record.id)} okText="Sí" cancelText="No" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="gestion-container">
      <Spin spinning={loading}>
        <Card className="gestion-card">
          <div className="card-header">
            <div className="card-title">
              <Title level={3} className="title-main"><EnvironmentOutlined /> Gestión de Atracciones Turísticas</Title>
              <Text className="subtitle">Total: {atracciones.length} atracciones registradas</Text>
            </div>
            <div className="card-actions">
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={cargarAtracciones}>Actualizar</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { resetForm(); setModalVisible(true); }} className="btn-primary">
                  Nueva Atracción
                </Button>
              </Space>
            </div>
          </div>

          <Table
            className="gestion-table"
            columns={columns}
            dataSource={atracciones}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} atracciones` }}
            scroll={{ x: 900 }}
          />
        </Card>

        <Modal
          title={<div className="modal-title"><EnvironmentOutlined /> {modoEdicion ? 'Editar Atracción' : 'Nueva Atracción'}</div>}
          open={modalVisible}
          onCancel={() => { setModalVisible(false); resetForm(); }}
          footer={null}
          width={900}
          className="gestion-modal"
          style={{ top: 20 }}
          styles={{ padding: 24, body: { maxHeight: '70vh', overflowY: 'auto' } }}
        >
          {/* Información Básica */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> Información Básica</Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong className="field-label">Nombre de la Atracción *</Text>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Cascada El Salto"
                size="large"
                status={formData.nombre && (formData.nombre.trim().length < 3 || formData.nombre.trim().length > 100) ? 'error' : ''}
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                {formData.nombre.trim().length}/100 caracteres • Mínimo 3 caracteres
                {formData.nombre && formData.nombre.trim().length < 3 && (
                  <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>
                    ⚠️ Demasiado corto
                  </span>
                )}
              </Text>
            </Space>
          </section>

          <section className="form-section">
            <Text strong className="field-label">Descripción Detallada *</Text>
            <TextArea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe la atracción..."
              rows={5}
              status={formData.descripcion && (formData.descripcion.trim().length < 10 || formData.descripcion.trim().length > 1000) ? 'error' : ''}
            />
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              {formData.descripcion.trim().length}/1000 caracteres • Mínimo 10 caracteres
              {formData.descripcion && formData.descripcion.trim().length < 10 && (
                <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>
                  ⚠️ Necesitas al menos {10 - formData.descripcion.trim().length} caracteres más
                </span>
              )}
            </Text>
          </section>

          <Divider />

          {/* Ubicación */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> Ubicación</Title>

            {isLoaded ? (
              <>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16 }}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={selectedPosition || defaultCenter}
                    zoom={15}
                    onClick={handleMapClick}
                  >
                    {selectedPosition && (
                      <Marker
                        position={selectedPosition}
                        draggable={true}
                        onDragEnd={(e) => {
                          setSelectedPosition({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng()
                          });
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>

                {selectedPosition ? (
                  <div style={{
                    padding: '12px 16px',
                    background: '#f0f9ff',
                    borderRadius: 8,
                    marginBottom: 16,
                    border: '1px solid #bae6fd'
                  }}>
                    <strong style={{ color: '#1e40af' }}>✓ Ubicación seleccionada:</strong>
                    <div style={{ color: '#475569', marginTop: 4 }}>
                      Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px 16px',
                    background: '#fff7ed',
                    borderRadius: 8,
                    marginBottom: 16,
                    border: '1px solid #fed7aa'
                  }}>
                    <strong style={{ color: '#ea580c' }}>⚠️ Ubicación requerida</strong>
                    <div style={{ color: '#7c2d12', marginTop: 4, fontSize: '12px' }}>
                      Haz clic en el mapa para seleccionar la ubicación de la atracción
                    </div>
                  </div>
                )}

                <Text type="secondary" style={{ fontSize: '13px' }}>
                  <EnvironmentOutlined /> Haz clic en el mapa o arrastra el marcador
                </Text>
              </>
            ) : (
              <Spin tip="Cargando mapa..." />
            )}
          </section>

          <Divider />

          {/* Multimedia */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> Multimedia</Title>

            <Space direction="vertical" size="16" style={{ width: '100%' }}>
              <div className="upload-panel">
                <div className="upload-header">
                  <div className="upload-icon"><PictureOutlined /></div>
                  <div>
                    <Text strong className="upload-title">Imagen de la Atracción *</Text>
                    <Text className="upload-sub">1 imagen máxima • Formatos: JPG, PNG, WebP • Máx. 5MB</Text>
                  </div>
                </div>

                <Upload {...uploadProps} className="upload-gallery">
                  <div className="upload-btn">
                    <PlusOutlined />
                    <div>Subir</div>
                  </div>
                </Upload>

                {fileList.length === 0 && (
                  <div style={{
                    padding: '8px 12px',
                    background: '#fff7ed',
                    borderRadius: 6,
                    marginTop: 12,
                    border: '1px solid #fed7aa'
                  }}>
                    <Text style={{ color: '#ea580c', fontSize: '12px' }}>
                      ⚠️ Debes agregar al menos una imagen
                    </Text>
                  </div>
                )}
              </div>
            </Space>
          </section>

          <Divider />

          {/* Información Cultural */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> 📚 Información Cultural e Histórica</Title>
            <TextArea name="informacionCultural" value={formData.informacionCultural} onChange={handleInputChange} placeholder="Añade información relevante..." rows={6} />
          </section>

          <Divider />

          {/* Configuración */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> ⚙️ Configuración y Detalles</Title>

            {/* Horario de Atención */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>
                <ClockCircleOutlined /> Horario de Atención
              </Title>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <div className="small-label"><Text strong>Día de inicio</Text></div>
                  <Select
                    value={formData.diaInicio || undefined}
                    onChange={(value) => handleInputChange({ target: { name: 'diaInicio', value } })}
                    placeholder="Selecciona día"
                    style={{ width: '100%' }}
                  >
                    <Option value="Lunes">Lunes</Option>
                    <Option value="Martes">Martes</Option>
                    <Option value="Miércoles">Miércoles</Option>
                    <Option value="Jueves">Jueves</Option>
                    <Option value="Viernes">Viernes</Option>
                    <Option value="Sábado">Sábado</Option>
                    <Option value="Domingo">Domingo</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="small-label"><Text strong>Día de fin</Text></div>
                  <Select
                    value={formData.diaFin || undefined}
                    onChange={(value) => handleInputChange({ target: { name: 'diaFin', value } })}
                    placeholder="Selecciona día"
                    style={{ width: '100%' }}
                  >
                    <Option value="Lunes">Lunes</Option>
                    <Option value="Martes">Martes</Option>
                    <Option value="Miércoles">Miércoles</Option>
                    <Option value="Jueves">Jueves</Option>
                    <Option value="Viernes">Viernes</Option>
                    <Option value="Sábado">Sábado</Option>
                    <Option value="Domingo">Domingo</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="small-label"><Text strong>Hora de apertura</Text></div>
                  <TimePicker
                    value={formData.horaInicio}
                    onChange={(time) => setFormData(prev => ({ ...prev, horaInicio: time }))}
                    format="hh:mm A"
                    use12Hours
                    placeholder="Selecciona hora"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="small-label"><Text strong>Hora de cierre</Text></div>
                  <TimePicker
                    value={formData.horaFin}
                    onChange={(time) => setFormData(prev => ({ ...prev, horaFin: time }))}
                    format="hh:mm A"
                    use12Hours
                    placeholder="Selecciona hora"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Col>
              </Row>
            </div>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div className="small-label"><DollarOutlined /> <Text strong>Costo de Entrada</Text></div>
                <Input
                  name="costoEntrada"
                  value={formData.costoEntrada}
                  onChange={handleInputChange}
                  placeholder="0"
                  prefix="$"
                  suffix="MXN"
                  type="number"
                  status={formData.costoEntrada && formData.costoEntrada !== 'Gratuito' && (isNaN(parseFloat(formData.costoEntrada)) || parseFloat(formData.costoEntrada) < 0 || parseFloat(formData.costoEntrada) > 10000) ? 'error' : ''}
                />
                {formData.costoEntrada && formData.costoEntrada !== 'Gratuito' && parseFloat(formData.costoEntrada) > 10000 && (
                  <Text style={{ color: '#ff4d4f', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    ⚠️ El costo no puede exceder $10,000 MXN
                  </Text>
                )}
              </Col>
              <Col xs={24} md={12}>
                <div className="small-label"><WarningOutlined /> <Text strong>Restricciones</Text></div>
                <Input name="restricciones" value={formData.restricciones} onChange={handleInputChange} placeholder="Ej. No se permiten mascotas" />
              </Col>
              <Col xs={24} md={12}>
                <div className="small-label"><ThunderboltOutlined /> <Text strong>Nivel de Dificultad</Text></div>
                <Select name="nivelDificultad" value={formData.nivelDificultad || undefined} onChange={(value) => handleInputChange({ target: { name: 'nivelDificultad', value } })} placeholder="Selecciona el nivel">
                  <Option value="facil">✅ Fácil</Option>
                  <Option value="moderado">⚠️ Moderado</Option>
                  <Option value="dificil">🔥 Difícil</Option>
                </Select>
              </Col>
            </Row>

            <div className="mt-16">
              <Text strong className="field-label">🛠️ Servicios y Amenidades</Text>
              <TextArea name="servicios" value={formData.servicios} onChange={handleInputChange} placeholder="Ej. Estacionamiento gratuito..." rows={4} />
            </div>
          </section>

          <Divider />

          <Row gutter={[16, 12]} justify="end" className="modal-actions">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button type="default" size="large" icon={<CloseCircleOutlined />} onClick={() => handleSubmit('inactiva')} loading={loading} block className="btn-outline">
                Guardar como Inactiva
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => handleSubmit('activa')} loading={loading} block className="btn-save">
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