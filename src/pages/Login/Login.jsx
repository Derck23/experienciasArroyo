import React from "react";
import FormLogin from "./FormLogin";
import { Layout, Typography } from 'antd';
import './Login.css';

const { Content } = Layout;
const { Title } = Typography;

function Login() {
  return (
    <Layout className="login-layout">
      <Content className="login-content">
        <div className="login-page-header">
          <Title level={1} className="page-title">
            Experiencias Arroyo
          </Title>
          <p className="page-subtitle">Bienvenido a Descubrir Arroyo Seco </p>
        </div>
        <FormLogin />
      </Content>
    </Layout>
  );
}

export default Login;
