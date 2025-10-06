import React from "react";
import FormRegistro from "./FormRegistro";
import { Layout, Typography } from 'antd';
import './Registro.css';

const { Content } = Layout;
const { Title } = Typography;

function Registro() {
  return (
    <Layout className="registro-layout">
      <Content className="registro-content">
        <div className="registro-page-header">
          <Title level={1} className="page-title">
            Experiencias Arroyo
          </Title>
          <p className="page-subtitle">Únete a Descubrir Arroyo Seco</p>
        </div>
        <FormRegistro />
      </Content>
    </Layout>
  );
}

export default Registro;