import React, { useEffect, useState } from 'react';
import {
  Card, Button, Modal, message, Form, Input, Select, Upload, Row, Col, Spin, Empty, Popconfirm, Carousel
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import * as servicioService from '../../service/servicioService';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import './GestionDeServicios.css';

const { TextArea } = Input;
const { Meta } = Card;

const GOOGLE_MAPS_APIKEY = 'AIzaSyD6vEAeGtBjMT1zQUlFnuvJV9YORgXSFGk';

const mapContainerStyle = { width: '100%', height: '400px' };

const defaultCenter = {
  lat: 21.1877,
  lng: -99.6783
};

function GestionDeServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [form] = Form.useForm();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_APIKEY
  });

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const data = await servicioService.obtenerServicios();
      setServicios(data || []);
    } catch (error) {
      console.error(error);
      message.error('Error cargando servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleCreate = () => {
    setEditingServicio(null);
    setImageFiles([]);
    setSelectedPosition(defaultCenter);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingServicio(record);

    const existingImages = (record.fotos || []).map((url, index) => ({
      uid: `-${index}`,
      name: `imagen-${index}.jpg`,
      status: 'done',
      url,
    }));

    setImageFiles(existingImages);
    setSelectedPosition({
      lat: record.latitud,
      lng: record.longitud
    });
    form.setFieldsValue({
      nombre: record.nombre,
      descripcion: record.descripcion,
      categoria: record.categoria,
      rangoPrecios: record.rangoPrecios,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await servicioService.eliminarServicio(record.id);
      message.success('Servicio eliminado');
      fetchServicios();
    } catch (err) {
      console.error(err);
      message.error('Error eliminando servicio');
    }
  };

  const compressAndConvertImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = ({ fileList }) => {
    setImageFiles(fileList);
  };

  const handleMapClick = (e) => {
    setSelectedPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  const handleSubmit = async (values) => {
    if (!selectedPosition) {
      message.error('Por favor selecciona una ubicación en el mapa');
      return;
    }

    try {
      const data = {
        ...values,
        ubicacion: `${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)}`,
        latitud: selectedPosition.lat,
        longitud: selectedPosition.lng
      };

      const fotos = [];
      for (const file of imageFiles) {
        if (file.originFileObj) {
          const compressedBase64 = await compressAndConvertImage(file.originFileObj);
          fotos.push(compressedBase64);
        } else if (file.url) {
          fotos.push(file.url);
        }
      }

      data.fotos = fotos;

      if (editingServicio) {
        await servicioService.actualizarServicio(editingServicio.id, data);
        message.success('Servicio actualizado');
      } else {
        await servicioService.crearServicio(data);
        message.success('Servicio creado');
      }

      setModalVisible(false);
      setImageFiles([]);
      form.resetFields();
      fetchServicios();
    } catch (err) {
      console.error(err);
      message.error('Error al guardar servicio');
    }
  };

  const uploadBefore = (file) => {
    const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
    if (!isValidType) {
      message.error('Solo puedes subir archivos PNG o JPG');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const getCategoriaLabel = (categoria) => {
    const labels = {
      tour: 'Tour',
      alojamiento: 'Alojamiento',
      gastronomia: 'Gastronomía'
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      tour: '🚶‍♂️',
      alojamiento: '🏨',
      gastronomia: '🍽️'
    };
    return icons[categoria] || '📍';
  };

  return (
    <div className="servicios-container">
      <div className="servicios-card">
        <div className="servicios-header">
          <div className="servicios-title">
            <h2 className="h2">Servicios</h2>
            <div className="subtitle">Total: {servicios.length} servicios registrados</div>
          </div>

          <div className="servicios-actions">
            <Button icon={<PlusOutlined />} onClick={handleCreate} className="btn-new">
              Nuevo Servicio
            </Button>
          </div>
        </div>

        <div className="servicios-body">
          {loading ? (
            <div className="empty-state">
              <Spin size="large" />
            </div>
          ) : servicios.length === 0 ? (
            <Empty description="No hay servicios registrados" className="empty-state" />
          ) : (
            <Row gutter={[24, 24]}>
              {servicios.map((servicio) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={servicio.id}>
                  <Card
                    hoverable
                    className="servicio-card"
                    cover={
                      <div className="servicio-cover">
                        {servicio.fotos && servicio.fotos.length > 0 ? (
                          servicio.fotos.length === 1 ? (
                            <img alt={servicio.nombre} src={servicio.fotos[0]} className="servicio-image" />
                          ) : (
                            <Carousel
                              autoplay
                              autoplaySpeed={3000}
                              arrows
                              prevArrow={<LeftOutlined />}
                              nextArrow={<RightOutlined />}
                              className="servicio-carousel"
                            >
                              {servicio.fotos.map((img, idx) => (
                                <div key={idx} className="carousel-slide">
                                  <img alt={`${servicio.nombre} ${idx + 1}`} src={img} className="servicio-image" />
                                </div>
                              ))}
                            </Carousel>
                          )
                        ) : (
                          <div className="servicio-placeholder">
                            <PlusOutlined className="placeholder-icon" />
                          </div>
                        )}
                        <div className="servicio-categoria-badge">
                          {getCategoriaIcon(servicio.categoria)} {getCategoriaLabel(servicio.categoria)}
                        </div>
                      </div>
                    }
                    actions={[
                      <EditOutlined key="edit" onClick={() => handleEdit(servicio)} className="action-edit" />,
                      <a
                        key="map"
                        href={`https://www.google.com/maps?q=${servicio.latitud},${servicio.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2D5016' }}
                      >
                        <EnvironmentOutlined />
                      </a>,
                      <Popconfirm
                        key="delete"
                        title="Eliminar servicio"
                        description={`¿Estás seguro de eliminar ${servicio.nombre}?`}
                        onConfirm={() => handleDelete(servicio)}
                        okText="Sí"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <DeleteOutlined className="action-delete" />
                      </Popconfirm>
                    ]}
                  >
                    <Meta
                      title={<div className="servicio-title-text">{servicio.nombre}</div>}
                      description={
                        <div className="servicio-desc">
                          <p className="desc-text">{servicio.descripcion}</p>
                          <div className="servicio-meta">
                            <span className="meta-precio">{servicio.rangoPrecios || '$$'}</span>
                            {servicio.fotos && servicio.fotos.length > 1 && (
                              <span className="meta-photos">📸 {servicio.fotos.length}</span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      <Modal
        title={<div className="modal-title">{editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</div>}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setImageFiles([]); form.resetFields(); }}
        footer={null}
        width={720}
        className="servicios-modal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nombre del servicio"
            name="nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
          >
            <Input placeholder="Ej: Tour a la Cascada El Chuvejé" size="large" />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
          >
            <TextArea rows={4} placeholder="Describe el servicio..." size="large" />
          </Form.Item>

          <Form.Item
            label="Categoría"
            name="categoria"
            rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
          >
            <Select placeholder="Selecciona la categoría del servicio" size="large">
              <Select.Option value="tour">🚶‍♂️ Tour</Select.Option>
              <Select.Option value="alojamiento">🏨 Alojamiento</Select.Option>
              <Select.Option value="gastronomia">🍽️ Gastronomía</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Rango de precios"
            name="rangoPrecios"
            rules={[{ required: true, message: 'Por favor ingresa el rango de precios' }]}
          >
            <Select placeholder="Selecciona el rango de precios" size="large">
              <Select.Option value="$">$ - Económico</Select.Option>
              <Select.Option value="$$">$$ - Moderado</Select.Option>
              <Select.Option value="$$$">$$$ - Costoso</Select.Option>
              <Select.Option value="$$$$">$$$$ - Muy Costoso</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ubicación en el Mapa">
            <p style={{ marginBottom: 12, color: '#666', fontSize: 14 }}>
              Haz click en el mapa o arrastra el pin para seleccionar la ubicación del servicio
            </p>

            {isLoaded ? (
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
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
            ) : (
              <div style={{ padding: 60, textAlign: 'center', background: '#f5f5f5', borderRadius: 12 }}>
                Cargando mapa...
              </div>
            )}
          </Form.Item>

          {selectedPosition && (
            <div style={{
              padding: '12px 16px',
              background: '#f0f9ff',
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid #bfdbfe'
            }}>
              <strong style={{ color: '#1e40af' }}>Ubicación seleccionada:</strong>
              <div style={{ color: '#475569', marginTop: 4 }}>
                Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
              </div>
            </div>
          )}

          <Form.Item label="Imágenes del servicio" extra="Hasta 5 imágenes PNG/JPG (máx. 5MB cada una)">
            <Upload
              listType="picture-card"
              fileList={imageFiles}
              maxCount={5}
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              beforeUpload={uploadBefore}
              onChange={handleImageChange}
            >
              {imageFiles.length < 5 && (
                <div className="upload-box">
                  <PlusOutlined />
                  <div className="upload-text">Subir imagen</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => { setModalVisible(false); setImageFiles([]); form.resetFields(); }} size="large" style={{ marginRight: 12 }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" size="large" className="btn-submit">
              {editingServicio ? 'Actualizar' : 'Crear'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GestionDeServicios;
