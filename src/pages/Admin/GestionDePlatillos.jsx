import React, { useEffect, useState } from 'react';
import {
  Card, Button, Modal, message, Form, Input, Select, Upload, Row, Col, Spin, Empty, Popconfirm, Carousel
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import * as dishService from '../../service/dishService';
import restaurantService from '../../service/restaurantService';

import './GestionDePlatillos.css';

const { TextArea } = Input;
const { Meta } = Card;

function GestionDePlatillos() {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [form] = Form.useForm();

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const resp = await dishService.listDishes();
      setDishes((resp && resp.data) || []);
    } catch (error) {
      console.error(error);
      message.error('Error cargando platillos');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const resp = await restaurantService.listRestaurants();
      setRestaurants((resp && resp.data) || []);
    } catch (error) {
      console.error(error);
      message.error('Error cargando restaurantes');
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchRestaurants();
  }, []);

  const handleCreate = () => {
    setEditingDish(null);
    setImageFiles([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingDish(record);

    const existingImages = (record.images || []).map((url, index) => ({
      uid: `-${index}`,
      name: `imagen-${index}.jpg`,
      status: 'done',
      url,
    }));

    setImageFiles(existingImages);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      restaurantId: record.restaurantId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await dishService.deleteDish(record.id);
      message.success('Platillo eliminado');
      fetchDishes();
    } catch (err) {
      console.error(err);
      message.error('Error eliminando platillo');
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

  const handleSubmit = async (values) => {
    try {
      const restaurant = restaurants.find(r => r.id === values.restaurantId);

      const data = {
        ...values,
        restaurantName: restaurant?.name || '',
      };

      const images = [];
      for (const file of imageFiles) {
        if (file.originFileObj) {
          const compressedBase64 = await compressAndConvertImage(file.originFileObj);
          images.push(compressedBase64);
        } else if (file.url) {
          images.push(file.url);
        }
      }

      data.images = images;

      if (editingDish) {
        await dishService.updateDish(editingDish.id, data);
        message.success('Platillo actualizado');
      } else {
        await dishService.createDish(data);
        message.success('Platillo creado');
      }

      setModalVisible(false);
      setImageFiles([]);
      form.resetFields();
      fetchDishes();
    } catch (err) {
      console.error(err);
      message.error('Error al guardar platillo');
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
    return false; // Prevent auto upload
  };

  return (
    <div className="platillos-container">
      <div className="platillos-card">
        <div className="platillos-header">
          <div className="platillos-title">
            <h2 className="h2">Platillos Tradicionales</h2>
            <div className="subtitle">Total: {dishes.length} platillos registrados</div>
          </div>

          <div className="platillos-actions">
            <Button icon={<PlusOutlined />} onClick={handleCreate} className="btn-new">
              Nuevo Platillo
            </Button>
          </div>
        </div>

        <div className="platillos-body">
          {loading ? (
            <div className="empty-state">
              <Spin size="large" />
            </div>
          ) : dishes.length === 0 ? (
            <Empty description="No hay platillos registrados" className="empty-state" />
          ) : (
            <Row gutter={[24, 24]}>
              {dishes.map((dish) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={dish.id}>
                  <Card
                    hoverable
                    className="platillo-card"
                    cover={
                      <div className="platillo-cover">
                        {dish.images && dish.images.length > 0 ? (
                          dish.images.length === 1 ? (
                            <img alt={dish.name} src={dish.images[0]} className="platillo-image" />
                          ) : (
                            <Carousel
                              autoplay
                              autoplaySpeed={3000}
                              arrows
                              prevArrow={<LeftOutlined />}
                              nextArrow={<RightOutlined />}
                              className="platillo-carousel"
                            >
                              {dish.images.map((img, idx) => (
                                <div key={idx} className="carousel-slide">
                                  <img alt={`${dish.name} ${idx + 1}`} src={img} className="platillo-image" />
                                </div>
                              ))}
                            </Carousel>
                          )
                        ) : (
                          <div className="platillo-placeholder">
                            <PlusOutlined className="placeholder-icon" />
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <EditOutlined key="edit" onClick={() => handleEdit(dish)} className="action-edit" />,
                      <Popconfirm
                        key="delete"
                        title="Eliminar platillo"
                        description={`¿Estás seguro de eliminar ${dish.name}?`}
                        onConfirm={() => handleDelete(dish)}
                        okText="Sí"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <DeleteOutlined className="action-delete" />
                      </Popconfirm>
                    ]}
                  >
                    <Meta
                      title={<div className="platillo-title-text">{dish.name}</div>}
                      description={
                        <div className="platillo-desc">
                          <p className="desc-text">{dish.description}</p>
                          <div className="platillo-meta">
                            <EnvironmentOutlined className="meta-icon" />
                            <span className="meta-text">{dish.restaurantName}</span>
                            {dish.images && dish.images.length > 1 && (
                              <span className="meta-photos">📸 {dish.images.length}</span>
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
        title={<div className="modal-title">{editingDish ? 'Editar Platillo' : 'Nuevo Platillo'}</div>}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setImageFiles([]); form.resetFields(); }}
        footer={null}
        width={720}
        className="platillos-modal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nombre del platillo"
            name="name"
            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
          >
            <Input placeholder="Ej: Enchiladas queretanas" size="large" />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
          >
            <TextArea rows={4} placeholder="Describe el platillo..." size="large" />
          </Form.Item>

          <Form.Item
            label="Restaurante"
            name="restaurantId"
            rules={[{ required: true, message: 'Por favor selecciona un restaurante' }]}
          >
            <Select placeholder="Selecciona el restaurante donde se sirve" size="large">
              {restaurants.map(r => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Imágenes del platillo" extra="Hasta 3 imágenes PNG/JPG (máx. 5MB cada una)">
            <Upload
              listType="picture-card"
              fileList={imageFiles}
              maxCount={3}
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              beforeUpload={uploadBefore}
              onChange={handleImageChange}
            >
              {imageFiles.length < 3 && (
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
              {editingDish ? 'Actualizar' : 'Crear'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GestionDePlatillos;