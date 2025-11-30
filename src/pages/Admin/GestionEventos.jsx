import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Card, DatePicker, Empty, Form, Grid, Input, InputNumber,
  Modal, Popconfirm, Select, Space, Switch, Table, Tag, TimePicker, Upload, message
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CheckCircleTwoTone, CloseCircleTwoTone, SearchOutlined,
  CalendarOutlined, EnvironmentOutlined, CameraOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  crearEvento, obtenerEventos, actualizarEvento, eliminarEvento, cambiarEstadoEvento
} from '../../service/eventoService';
import { Typography } from 'antd';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
const { Title, Text } = Typography;

const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { Option } = Select;

const categoriasOpts = [
  { label: 'Conciertos', value: 'conciertos' },
  { label: 'Gastronomía', value: 'gastronomia' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Deportivo', value: 'deportivo' },
];

const GOOGLE_MAPS_KEY = 'AIzaSyD6vEAeGtBjMT1zQUlFnuvJV9YORgXSFGk';
const DEFAULT_CENTER = { lat: 21.1619, lng: -99.3728 }; // Arroyo Seco

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

const formatearPrecio = (precio) => (!precio || precio === 0 || precio === '0'
  ? 'Gratis'
  : `$${parseFloat(precio).toLocaleString('es-MX')} MXN`);

const GestionEventos = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [imagenesEvento, setImagenesEvento] = useState([]);
  const [posicionMapa, setPosicionMapa] = useState(null);
  const [centerMapa, setCenterMapa] = useState(DEFAULT_CENTER);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await obtenerEventos();
      const ordenados = [...data].sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0));
      setEventos(ordenados);
    } catch (err) {
      message.error(err?.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    if (!busqueda) return eventos;
    const q = busqueda.toLowerCase();
    return eventos.filter((e) =>
      e.nombre?.toLowerCase().includes(q) ||
      e.descripcion?.toLowerCase().includes(q) ||
      e.categoria?.toLowerCase().includes(q) ||
      e.ubicacion?.toLowerCase().includes(q)
    );
  }, [busqueda, eventos]);

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    setImagenesEvento([]);
    setPosicionMapa(null);
    setCenterMapa(DEFAULT_CENTER);
    setModalOpen(true);
  };

  const abrirEditar = (ev) => {
    setEditando(ev);

    // Cargar imágenes existentes
    const imgs = ev.fotos || (ev.imagen ? [ev.imagen] : []);
    setImagenesEvento(imgs.map((url, idx) => ({
      uid: `-${idx}`,
      name: `imagen-${idx}.jpg`,
      status: 'done',
      url: url
    })));

    // Cargar posición del mapa si existe (ubicacion puede ser JSON)
    try {
      const ubicacionParsed = JSON.parse(ev.ubicacion || '{}');
      if (ubicacionParsed.lat && ubicacionParsed.lng) {
        const pos = { lat: parseFloat(ubicacionParsed.lat), lng: parseFloat(ubicacionParsed.lng) };
        setPosicionMapa(pos);
        setCenterMapa(pos);
      } else {
        setPosicionMapa(null);
        setCenterMapa(DEFAULT_CENTER);
      }
    } catch {
      // Si no es JSON, es texto plano
      setPosicionMapa(null);
      setCenterMapa(DEFAULT_CENTER);
    }

    form.setFieldsValue({
      nombre: ev.nombre,
      descripcion: ev.descripcion,
      fecha: ev.fecha ? dayjs(ev.fecha) : null,
      hora: ev.hora ? dayjs(ev.hora, 'HH:mm') : null,
      categoria: ev.categoria,
      precio: typeof ev.precio === 'string' ? Number(ev.precio) : ev.precio,
      cantidadBoletos: ev.cantidadBoletos,
      destacado: !!ev.destacado,
      estado: ev.estado || 'activo',
    });
    setModalOpen(true);
  };

  const onCerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    form.resetFields();
    setImagenesEvento([]);
    setPosicionMapa(null);
    setCenterMapa(DEFAULT_CENTER);
  };

  const normalizar = (vals) => {
    const fotos = imagenesEvento
      .filter(img => img.status === 'done')
      .map(img => img.url || img.response?.url)
      .filter(Boolean);

    // Guardar coordenadas en el campo ubicacion como JSON
    let ubicacionFinal = '';
    if (posicionMapa) {
      ubicacionFinal = JSON.stringify({
        nombre: '',
        lat: posicionMapa.lat,
        lng: posicionMapa.lng
      });
    }

    return {
      nombre: vals.nombre?.trim(),
      descripcion: vals.descripcion?.trim() || '',
      fecha: vals.fecha ? dayjs(vals.fecha).format('YYYY-MM-DD') : '',
      hora: vals.hora ? dayjs(vals.hora).format('HH:mm') : '',
      ubicacion: ubicacionFinal,
      categoria: vals.categoria || '',
      precio: typeof vals.precio === 'number' ? vals.precio : Number(vals.precio || 0),
      cantidadBoletos: typeof vals.cantidadBoletos === 'number' ? vals.cantidadBoletos : Number(vals.cantidadBoletos || 0),
      fotos: fotos,
      imagen: fotos[0] || '',
      destacado: !!vals.destacado,
      estado: vals.estado || 'activo',
    };
  };

  const onSubmit = async () => {
    try {
      const vals = await form.validateFields();
      
      // Validar que haya al menos una imagen
      if (imagenesEvento.length === 0) {
        message.error('Por favor agrega al menos una imagen del evento');
        return;
      }

      // Validar que se haya seleccionado una ubicación
      if (!posicionMapa) {
        message.error('Por favor selecciona la ubicación del evento en el mapa');
        return;
      }

      const payload = normalizar(vals);
      setSubmitLoading(true);
      if (editando?.id) {
        await actualizarEvento(editando.id, payload);
        message.success('Evento actualizado');
      } else {
        await crearEvento(payload);
        message.success('Evento creado');
      }
      onCerrarModal();
      cargar();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Error al guardar el evento');
    } finally {
      setSubmitLoading(false);
    }
  };

  const onEliminar = async (id) => {
    try {
      await eliminarEvento(id);
      message.success('Evento eliminado');
      cargar();
    } catch (err) {
      message.error(err?.message || 'Error al eliminar evento');
    }
  };

  const onCambiarEstado = async (ev, nuevo) => {
    try {
      await cambiarEstadoEvento(ev.id, nuevo ? 'activo' : 'inactivo');
      message.success(`Estado cambiado a ${nuevo ? 'activo' : 'inactivo'}`);
      cargar();
    } catch (err) {
      message.error(err?.message || 'Error al cambiar estado');
    }
  };

  const columnas = [
    {
      title: 'Imagen',
      dataIndex: 'imagen',
      key: 'imagen',
      width: 80,
      render: (_, record) => {
        const img = record.imagen || record.fotos?.[0];
        return img ? (
          <img
            src={img}
            alt={record.nombre}
            style={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 8
            }}
          />
        ) : (
          <div style={{
            width: 60,
            height: 60,
            background: '#f0f0f0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24
          }}>
            🎉
          </div>
        );
      }
    },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', ellipsis: true },
    {
      title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (v, r) => (
        <Space size={4}><CalendarOutlined /><span>{v || '-'}</span><span>{r.hora ? `· ${r.hora}h` : ''}</span></Space>
      ), responsive: ['sm'],
    },
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria', render: (c) => c || '-', responsive: ['md'] },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (p) => formatearPrecio(p), responsive: ['lg'] },
    {
      title: 'Boletos',
      dataIndex: 'cantidadBoletos',
      key: 'cantidadBoletos',
      width: 120,
      render: (cantidad) => (
        <span style={{ 
          fontWeight: '600',
          color: cantidad < 20 ? '#ff4d4f' : cantidad ? '#52c41a' : '#999'
        }}>
          {cantidad ? `🎫 ${cantidad}` : '-'}
        </span>
      ),
      responsive: ['lg']
    },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (e) => (e === 'activo' || e === 'activa' ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>)
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, record) => {
        const activo = record.estado === 'activo' || record.estado === 'activa';
        return (
          <Space wrap>
            <Button size="small" icon={<EditOutlined />} onClick={() => abrirEditar(record)}>Editar</Button>
            <Popconfirm title="¿Eliminar evento?" okText="Sí" cancelText="No" onConfirm={() => onEliminar(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>Eliminar</Button>
            </Popconfirm>
            <Switch checked={activo} checkedChildren="Activo" unCheckedChildren="Inactivo"
              onChange={(checked) => onCambiarEstado(record, checked)} />
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(102, 187, 106, 0.2)',
          marginBottom: '24px'
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#2e7d32' }}>
              <CalendarOutlined /> Gestión de Eventos
            </Title>
            <Text style={{ color: '#666' }}>
              Total: {eventos.length} eventos
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={cargar} loading={loading}>
              Actualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={abrirNuevo}
              style={{
                background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                border: 'none',
                height: '40px',
                fontWeight: '600'
              }}
            >
              Nuevo Evento
            </Button>
          </Space>
        </div>

        <Space
          direction="horizontal"
          style={{ width: '100%', marginBottom: 16 }}
          size="middle"
          wrap
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, descripción, categoría o ubicación"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ minWidth: 260 }}
          />
        </Space>

        {isMobile ? (
          filtrados.length === 0 ? (
            <Empty description="Sin eventos" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {filtrados.map((ev) => {
                const activo = ev.estado === 'activo' || ev.estado === 'activa';
                return (
                  <Card key={ev.id} size="small" hoverable
                    cover={(ev.imagen || ev.fotos?.[0]) ? (
                      <img alt={ev.nombre} src={ev.imagen || ev.fotos?.[0]} style={{ height: 160, objectFit: 'cover' }} />
                    ) : null}
                    actions={[
                      <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => abrirEditar(ev)}>Editar</Button>,
                      <Popconfirm key="del" title="¿Eliminar evento?" okText="Sí" cancelText="No" onConfirm={() => onEliminar(ev.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>Eliminar</Button>
                      </Popconfirm>,
                      <Switch key="state" checked={activo} onChange={(c) => onCambiarEstado(ev, c)}
                        checkedChildren="Activo" unCheckedChildren="Inactivo" />,
                    ]}
                  >
                    <Card.Meta
                      title={<Space>{activo ? <CheckCircleTwoTone twoToneColor="#52c41a" /> :
                        <CloseCircleTwoTone twoToneColor="#bfbfbf" />}<span>{ev.nombre}</span></Space>}
                      description={
                        <div>
                          <div style={{ marginBottom: 6 }}><CalendarOutlined /> {ev.fecha || '-'} {ev.hora ? `· ${ev.hora}h` : ''}</div>
                          <div style={{ marginBottom: 6 }}><EnvironmentOutlined /> {ev.ubicacion || 'Ubicación no definida'}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Tag>{ev.categoria || 'Sin categoría'}</Tag>
                            <Tag color={(!ev.precio || ev.precio === 0 || ev.precio === '0') ? 'green' : 'blue'}>
                              {formatearPrecio(ev.precio)}
                            </Tag>
                            {ev.destacado ? <Tag color="red">Destacado</Tag> : null}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                );
              })}
            </Space>
          )
        ) : (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filtrados}
            columns={columnas}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{
            background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
            margin: '-20px -24px 20px -24px',
            padding: '20px 24px',
            color: 'white'
          }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              <CalendarOutlined style={{ marginRight: 12 }} />
              {editando ? 'Editar Evento' : 'Nuevo Evento'}
            </Title>
          </div>
        }
        open={modalOpen}
        onCancel={onCerrarModal}
        onOk={onSubmit}
        okText={editando ? 'Actualizar' : 'Crear'}
        confirmLoading={submitLoading}
        destroyOnHidden
        width={800}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" initialValues={{ estado: 'activo', destacado: false, precio: 0 }}>
          <Form.Item 
            name="nombre" 
            label="Nombre" 
            rules={[
              { required: true, message: 'El nombre es obligatorio' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 100, message: 'El nombre no puede exceder 100 caracteres' },
              { whitespace: true, message: 'El nombre no puede estar vacío' }
            ]}
          >
            <Input placeholder="Nombre del evento" maxLength={100} showCount />
          </Form.Item>
          <Form.Item 
            name="descripcion" 
            label="Descripción"
            rules={[
              { required: true, message: 'La descripción es obligatoria' },
              { min: 10, message: 'La descripción debe tener al menos 10 caracteres' },
              { max: 1000, message: 'La descripción no puede exceder 1000 caracteres' }
            ]}
          >
            <TextArea rows={3} placeholder="Descripción del evento" maxLength={1000} showCount />
          </Form.Item>

          <Form.Item
            name="cantidadBoletos"
            label="Cantidad de Boletos Disponibles"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const num = parseInt(value);
                  if (isNaN(num) || num < 0) {
                    return Promise.reject('La cantidad debe ser un número mayor o igual a 0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              placeholder="Ej. 150"
              prefix="🎫"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'} size="middle">
            <Form.Item 
              name="fecha" 
              label="Fecha" 
              style={{ flex: 1, minWidth: 180 }}
              rules={[
                { required: true, message: 'La fecha es obligatoria' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const hoy = dayjs().startOf('day');
                    if (value.isBefore(hoy)) {
                      return Promise.reject('La fecha no puede ser anterior a hoy');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
            </Form.Item>
            <Form.Item 
              name="hora" 
              label="Hora" 
              style={{ flex: 1, minWidth: 160 }}
              rules={[{ required: true, message: 'La hora es obligatoria' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item label={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#2D5016' }} />
              Ubicación en el Mapa <span style={{ color: '#ff4d4f' }}>*</span>
            </span>
          }>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
              Haz clic en el mapa para seleccionar la ubicación del evento (obligatorio)
            </div>
            {posicionMapa && (
              <div style={{
                padding: 12,
                background: '#f0f9f0',
                borderRadius: 8,
                marginBottom: 12,
                border: '1px solid #c8e6c9'
              }}>
                <strong style={{ color: '#2D5016', display: 'block', marginBottom: 6 }}>
                  📍 Ubicación seleccionada
                </strong>
                <div style={{ fontSize: 13, color: '#666' }}>
                  Latitud: {posicionMapa.lat.toFixed(6)} | Longitud: {posicionMapa.lng.toFixed(6)}
                </div>
              </div>
            )}
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={centerMapa}
                zoom={14}
                onClick={(e) => {
                  const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                  setPosicionMapa(pos);
                  message.success('Ubicación seleccionada');
                }}
              >
                {posicionMapa && <Marker position={posicionMapa} />}
              </GoogleMap>
            </LoadScript>
          </Form.Item>

          <Space style={{ width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'} size="middle">
            <Form.Item 
              name="categoria" 
              label="Categoría" 
              style={{ flex: 1, minWidth: 200 }}
              rules={[{ required: true, message: 'Selecciona una categoría' }]}
            >
              <Select placeholder="Selecciona una categoría" allowClear>
                {categoriasOpts.map((c) => <Option key={c.value} value={c.value}>{c.label}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item 
              name="precio" 
              label="Precio (MXN)" 
              style={{ flex: 1, minWidth: 150 }}
              rules={[
                { required: true, message: 'El precio es obligatorio' },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (value < 0) return Promise.reject('El precio no puede ser negativo');
                    if (value > 50000) return Promise.reject('El precio no puede exceder $50,000 MXN');
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={50000} step={10} placeholder="0 para eventos gratuitos" />
            </Form.Item>
          </Space>

          <Form.Item label={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CameraOutlined style={{ color: '#2D5016' }} />
              Imágenes del Evento <span style={{ color: '#ff4d4f' }}>*</span>
            </span>
          }>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>
              Agrega al menos una imagen del evento (máximo 5MB por imagen)
            </div>
            <Upload
              listType="picture-card"
              fileList={imagenesEvento}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Solo se permiten imágenes');
                  return Upload.LIST_IGNORE;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('La imagen debe ser menor a 5MB');
                  return Upload.LIST_IGNORE;
                }

                // Convertir a base64
                const reader = new FileReader();
                reader.onload = (e) => {
                  const newFile = {
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    url: e.target.result
                  };
                  setImagenesEvento(prev => [...prev, newFile]);
                };
                reader.readAsDataURL(file);
                return false;
              }}
              onRemove={(file) => {
                setImagenesEvento(prev => prev.filter(f => f.uid !== file.uid));
              }}
              maxCount={5}
            >
              {imagenesEvento.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Subir</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item name="destacado" label="Destacado" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="estado" label="Estado">
              <Select style={{ minWidth: 140 }}>
                <Option value="activo">Activo</Option>
                <Option value="inactivo">Inactivo</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionEventos;
