import React, { useState, useEffect } from 'react';
import {
  Card, Input, Select, Button, Upload, message, Divider, Space, Typography, Row, Col, Table, Modal, Popconfirm, Tag, Spin
} from 'antd';
import {
  EnvironmentOutlined, PictureOutlined, VideoCameraOutlined, AudioOutlined, ClockCircleOutlined,
  DollarOutlined, WarningOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined
} from '@ant-design/icons';

import {
  crearAtraccion, obtenerAtracciones, actualizarAtraccion,
  eliminarAtraccion, cambiarEstadoAtraccion
} from '../../service/atraccionService';

import { comprimirYConvertirImagen, convertirAudioABase64, validarTamañoArchivo } from '../../utils/imageUtils';

import './GestionDeAtracciones.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const GestionDeAtracciones = () => {
  const [formData, setFormData] = useState({
    nombre: '', categoria: '', descripcion: '', latitud: '', longitud: '',
    videoUrl: '', informacionCultural: '', horarios: '', costoEntrada: '',
    restricciones: '', nivelDificultad: '', servicios: ''
  });

  const [fileList, setFileList] = useState([]);
  const [audioFile, setAudioFile] = useState([]);
  const [atracciones, setAtracciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [atraccionEditando, setAtraccionEditando] = useState(null);

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

  const resetForm = () => {
    setFormData({
      nombre: '', categoria: '', descripcion: '', latitud: '', longitud: '',
      videoUrl: '', informacionCultural: '', horarios: '', costoEntrada: '',
      restricciones: '', nivelDificultad: '', servicios: ''
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
      // Procesar imágenes -> mantener las ya existentes (tienen url) y convertir nuevas
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

      const dataToSubmit = { ...formData, estado, fotos: fotosBase64, audioUrl: audioBase64 };

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
      descripcion: atraccion.descripcion || '', latitud: atraccion.latitud || '',
      longitud: atraccion.longitud || '', videoUrl: atraccion.videoUrl || '',
      informacionCultural: atraccion.informacionCultural || '', horarios: atraccion.horarios || '',
      costoEntrada: atraccion.costoEntrada || '', restricciones: atraccion.restricciones || '',
      nivelDificultad: atraccion.nivelDificultad || '', servicios: atraccion.servicios || ''
    });

    if (atraccion.fotos && Array.isArray(atraccion.fotos) && atraccion.fotos.length > 0) {
      const existingFiles = atraccion.fotos
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
      setFileList(prev => [...prev, newFile]);
      return false; // prevent auto upload
    },
    fileList,
    listType: "picture-card",
    multiple: true,
    maxCount: 10,
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
      title: 'Nombre', dataIndex: 'nombre', key: 'nombre', ellipsis: true, responsive: ['xs', 'sm', 'md', 'lg']
    },
    {
      title: 'Categoría', dataIndex: 'categoria', key: 'categoria', render: (categoria) => {
        const emoji = { 'cascada': '🌊', 'mirador': '🏔️', 'cueva': '🕳️', 'observatorio': '🔭', 'sitio-historico': '🏛️' };
        return `${emoji[categoria] || ''} ${categoria}`;
      }
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
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong className="field-label">Nombre de la Atracción *</Text>
                  <Input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Cascada El Salto" size="large" />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong className="field-label">Categoría *</Text>
                  <Select name="categoria" value={formData.categoria || undefined} onChange={(value) => handleInputChange({ target: { name: 'categoria', value } })} placeholder="Selecciona una categoría" size="large">
                    <Option value="cascada">🌊 Cascada</Option>
                    <Option value="mirador">🏔️ Mirador</Option>
                    <Option value="cueva">🕳️ Cueva</Option>
                    <Option value="observatorio">🔭 Observatorio</Option>
                    <Option value="sitio-historico">🏛️ Sitio Histórico</Option>
                  </Select>
                </Space>
              </Col>
            </Row>
          </section>

          <section className="form-section">
            <Text strong className="field-label">Descripción Detallada *</Text>
            <TextArea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describe la atracción..." rows={5} />
          </section>

          <Divider />

          {/* Ubicación */}
          <section className="form-section">
            <Title level={4} className="section-title"><span className="accent" /> Ubicación</Title>

            <div className="map-preview">
              <div
                className="map-image"
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmn2mN4V2KEsKZtoQ09LWXn-ZgIJeWxkTLrR4G1kZuGADDFHFM1wxDc9-iD6XeOI-Z9Li3B5zAWSoSE_6EN8fHhxpIYgCMWFxJFXtR9MdO3P-9J-Sir3B3w-GYm7BOoBaPCQO7MxYJHtF8KCebLv-BMvUAORwSIm4GXDELC7u95WbD-yqah11EvCsul0l5_nFL0PY6iStWK18rcnYHRLtyZTwexsdPCpGTnjm22w1VbV_yqhaz-QVIHiW4Bcs3Hf2AcclFOZh44A7H")'
                }}
              />
              <div className="map-badge"><EnvironmentOutlined /> <Text strong>Vista previa del mapa</Text></div>
            </div>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Text strong className="field-label">📍 Latitud</Text>
                <Input name="latitud" value={formData.latitud} onChange={handleInputChange} placeholder="Ej. 20.8833" size="large" />
              </Col>
              <Col xs={24} md={12}>
                <Text strong className="field-label">📍 Longitud</Text>
                <Input name="longitud" value={formData.longitud} onChange={handleInputChange} placeholder="Ej. -99.6667" size="large" />
              </Col>
            </Row>
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
                    <Text strong className="upload-title">Galería de Fotos</Text>
                    <Text className="upload-sub">Máximo 10 fotos • Formatos: JPG, PNG, WebP</Text>
                  </div>
                </div>

                <Upload {...uploadProps} className="upload-gallery">
                  <div className="upload-btn">
                    <PlusOutlined />
                    <div>Subir</div>
                  </div>
                </Upload>
              </div>

              <div>
                <div className="small-label"><VideoCameraOutlined /> <Text strong>Enlace de Video (Opcional)</Text></div>
                <Input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." prefix={<VideoCameraOutlined />} />
              </div>

              <div className="upload-panel">
                <div className="upload-header">
                  <div className="upload-icon"><AudioOutlined /></div>
                  <div>
                    <Text strong className="upload-title">Audioguía</Text>
                    <Text className="upload-sub">Archivo de audio MP3</Text>
                  </div>
                </div>

                <Upload {...audioUploadProps}>
                  <Button className="upload-audio-btn" icon={<AudioOutlined />}>Seleccionar Archivo de Audio</Button>
                </Upload>
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

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div className="small-label"><ClockCircleOutlined /> <Text strong>Horarios</Text></div>
                <Input name="horarios" value={formData.horarios} onChange={handleInputChange} placeholder="Ej. Lunes a Domingo 9:00 - 18:00" />
              </Col>
              <Col xs={24} md={12}>
                <div className="small-label"><DollarOutlined /> <Text strong>Costo de Entrada</Text></div>
                <Input name="costoEntrada" value={formData.costoEntrada} onChange={handleInputChange} placeholder="Ej. $50 MXN" />
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