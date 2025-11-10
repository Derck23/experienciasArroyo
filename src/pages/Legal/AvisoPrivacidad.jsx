import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Legal.css';

const AvisoPrivacidad = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <button 
          className="legal-back-button"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
        
        <h1>Aviso de Privacidad</h1>
        <p className="legal-date">Última actualización: 6 de noviembre de 2025</p>
        
        <section className="legal-section">
          <h2>1. Identidad y Domicilio del Responsable</h2>
          <p>
            Experiencias Arroyo es responsable del tratamiento de sus datos personales. 
            Nos comprometemos a proteger su privacidad y garantizar el uso adecuado de su información.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Datos Personales que Recabamos</h2>
          <p>Para las finalidades señaladas en el presente aviso de privacidad, podemos recabar sus datos personales de distintas formas:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Información de perfil y preferencias</li>
            <li>Datos de navegación y uso de la aplicación</li>
            <li>Ubicación geográfica (con su consentimiento)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Finalidades del Tratamiento de Datos</h2>
          <p>Los datos personales que recabamos serán utilizados para las siguientes finalidades:</p>
          <ul>
            <li>Crear y gestionar su cuenta de usuario</li>
            <li>Proveer los servicios y funcionalidades de la aplicación</li>
            <li>Personalizar su experiencia en Experiencias Arroyo</li>
            <li>Enviar notificaciones sobre eventos, restaurantes y atracciones</li>
            <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
            <li>Realizar análisis estadísticos y de tendencias</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Compartir Información</h2>
          <p>
            Nos comprometemos a no transferir sus datos personales a terceros sin su consentimiento, 
            salvo las excepciones previstas en la Ley Federal de Protección de Datos Personales en 
            Posesión de los Particulares.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Medidas de Seguridad</h2>
          <p>
            Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger 
            sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o 
            tratamiento no autorizado.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (derechos ARCO) al 
            tratamiento de sus datos personales. Para ejercer estos derechos, puede contactarnos 
            a través de la sección de contacto en la aplicación.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Uso de Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el 
            uso de nuestra aplicación y personalizar el contenido. Puede configurar su navegador 
            para rechazar las cookies, aunque esto puede afectar algunas funcionalidades.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Cambios al Aviso de Privacidad</h2>
          <p>
            Nos reservamos el derecho de actualizar este aviso de privacidad en cualquier momento. 
            Las modificaciones estarán disponibles en esta sección de la aplicación.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Consentimiento</h2>
          <p>
            Al utilizar nuestra aplicación y proporcionar sus datos personales, usted consiente 
            el tratamiento de los mismos conforme a los términos establecidos en este aviso de privacidad.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contacto</h2>
          <p>
            Si tiene preguntas o inquietudes sobre este aviso de privacidad o el tratamiento de 
            sus datos personales, puede contactarnos a través de los medios disponibles en la aplicación.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Eliminación de Cuenta</h2>
          <p>
            Si desea eliminar su cuenta y todos los datos asociados, puede hacerlo a través de 
            nuestra página de{' '}
            <a href="/eliminacion-cuenta" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              Eliminación de Cuenta
            </a>
            . Este proceso es permanente y cumple con su derecho al olvido según la legislación 
            de protección de datos.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AvisoPrivacidad;
