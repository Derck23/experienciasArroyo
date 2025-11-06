import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Space, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import restaurantService from '../../service/restaurantService';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import './GestionDeRestaurantes.css';

const GOOGLE_MAPS_APIKEY = 'AIzaSyD6vEAeGtBjMT1zQUlFnuvJV9YORgXSFGk';

const mapContainerStyle = { width: '100%' }; // height controlled by CSS via mapContainerClassName

const defaultCenter = {
  lat: 21.1877,
  lng: -99.6783
};

function GestionDeRestaurantes() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [form] = Form.useForm();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_APIKEY
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const resp = await restaurantService.listRestaurants();
      setRestaurants(resp.data || []);
    } catch (error) {
      console.error(error);
      message.error('Error cargando restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleCreate = () => {
    setEditingRestaurant(null);
    setSelectedPosition(defaultCenter);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRestaurant(record);
    setSelectedPosition({
      lat: record.latitude,
      lng: record.longitude
    });
    form.setFieldsValue({
      name: record.name,
      schedule: record.schedule,
    });
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Eliminar restaurante',
      content: `¿Estás seguro de eliminar ${record.name}?`,
      onOk: async () => {
        try {
          await restaurantService.deleteRestaurant(record.id);
          message.success('Restaurante eliminado');
          fetchRestaurants();
        } catch (err) {
          console.error(err);
          message.error('Error eliminando restaurante');
        }
      }
    });
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
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng
      };

      if (editingRestaurant) {
        await restaurantService.updateRestaurant(editingRestaurant.id, data);
        message.success('Restaurante actualizado');
      } else {
        await restaurantService.createRestaurant(data);
        message.success('Restaurante creado');
      }
      setModalVisible(false);
      form.resetFields();
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      message.error('Error guardando restaurante');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      responsive: ['xs', 'sm', 'md']
    },
    {
      title: 'Horarios',
      dataIndex: 'schedule',
      key: 'schedule',
      responsive: ['sm', 'md', 'lg']
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (_, record) => (
        <a
          className="link-map"
          href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${record.name} en Google Maps`}
        >
          <EnvironmentOutlined /> Ver en mapa
        </a>
      ),
      responsive: ['xs', 'sm', 'md']
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} className="btn-action">Editar</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} className="btn-action">Eliminar</Button>
        </Space>
      ),
      responsive: ['xs', 'sm']
    }
  ];

  return (
    <div className="restaurantes-container">
      <div className="restaurantes-header">
        <div className="restaurantes-title">
          <h1 className="restaurantes-h1">Gestión de Restaurantes</h1>
          <p className="restaurantes-sub">Administra los restaurantes y lugares de comida</p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          className="btn-new-restaurant"
          aria-label="Crear nuevo restaurante"
        >
          Nuevo restaurante
        </Button>
      </div>

      <div className="restaurantes-table-wrap">
        <Table
          className="restaurantes-table"
          dataSource={restaurants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} restaurantes`
          }}
          // allow horizontal scroll on very small screens
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Modal
        title={<div className="modal-title">{editingRestaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}</div>}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
        destroyOnClose
        className="restaurantes-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nombre del Restaurante"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input size="large" placeholder="Ej: Gorditas Doña Mary" />
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Horarios de Atención"
            rules={[{ required: true, message: 'Los horarios son requeridos' }]}
          >
            <Input size="large" placeholder="Ej: Lun-Dom 8:00 AM - 8:00 PM" />
          </Form.Item>

          <Form.Item label="Ubicación en el Mapa">
            <p className="map-instructions">
              Haz click en el mapa o arrastra el pin para seleccionar la ubicación del restaurante
            </p>

            {isLoaded ? (
              <div className="map-wrapper" aria-hidden={false}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  mapContainerClassName="restaurantes-map"
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
              <div className="map-loading">Cargando mapa...</div>
            )}
          </Form.Item>

          {selectedPosition && (
            <div className="selected-position">
              <strong className="selected-title">Ubicación seleccionada:</strong>
              <div className="selected-coords">
                Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
              </div>
            </div>
          )}

          <Form.Item>
            <Space wrap className="modal-actions">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="btn-submit"
              >
                {editingRestaurant ? 'Actualizar' : 'Crear'}
              </Button>
              <Button size="large" onClick={() => { setModalVisible(false); form.resetFields(); }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GestionDeRestaurantes;