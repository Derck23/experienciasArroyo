import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Legal.css';

const TerminosCondiciones = () => {
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
        
        <h1>Términos y Condiciones</h1>
        <p className="legal-date">Última actualización: 6 de noviembre de 2025</p>
        
        <section className="legal-section">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar la aplicación Experiencias Arroyo, usted acepta estar sujeto a 
            estos términos y condiciones, todas las leyes y regulaciones aplicables, y acepta que 
            es responsable del cumplimiento de todas las leyes locales aplicables. Si no está de 
            acuerdo con alguno de estos términos, tiene prohibido usar o acceder a esta aplicación.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Descripción del Servicio</h2>
          <p>
            Experiencias Arroyo es una plataforma digital que ofrece información sobre restaurantes, 
            atracciones turísticas, eventos y servicios en la región. La aplicación permite a los 
            usuarios explorar, descubrir y obtener información detallada sobre diversos establecimientos 
            y actividades.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Registro y Cuenta de Usuario</h2>
          <h3>3.1 Creación de Cuenta</h3>
          <p>
            Para acceder a ciertas funcionalidades, deberá crear una cuenta proporcionando información 
            precisa, completa y actualizada.
          </p>
          <h3>3.2 Seguridad de la Cuenta</h3>
          <p>
            Usted es responsable de mantener la confidencialidad de su contraseña y cuenta. Es 
            responsable de todas las actividades que ocurran bajo su cuenta.
          </p>
          <h3>3.3 Suspensión de Cuenta</h3>
          <p>
            Nos reservamos el derecho de suspender o cancelar su cuenta si detectamos actividades 
            fraudulentas, violaciones a estos términos o uso indebido de la plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Uso Aceptable</h2>
          <p>Al utilizar Experiencias Arroyo, usted se compromete a:</p>
          <ul>
            <li>No utilizar la aplicación para propósitos ilegales o no autorizados</li>
            <li>No intentar obtener acceso no autorizado a sistemas o redes</li>
            <li>No transmitir virus, malware o código malicioso</li>
            <li>No interferir con el funcionamiento normal de la aplicación</li>
            <li>No recopilar información de otros usuarios sin su consentimiento</li>
            <li>No publicar contenido ofensivo, difamatorio o que viole derechos de terceros</li>
            <li>Respetar los derechos de propiedad intelectual</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Contenido de la Aplicación</h2>
          <h3>5.1 Propiedad Intelectual</h3>
          <p>
            Todo el contenido disponible en Experiencias Arroyo, incluyendo textos, gráficos, 
            logotipos, imágenes, clips de audio, descargas digitales y compilaciones de datos, 
            es propiedad de Experiencias Arroyo o sus proveedores de contenido y está protegido 
            por leyes de propiedad intelectual.
          </p>
          <h3>5.2 Licencia de Uso</h3>
          <p>
            Se le otorga una licencia limitada, no exclusiva y no transferible para acceder y 
            usar la aplicación únicamente para fines personales y no comerciales.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Información de Terceros</h2>
          <p>
            La información sobre restaurantes, atracciones y eventos es proporcionada con fines 
            informativos. No garantizamos la exactitud, completitud o actualidad de toda la 
            información. Los usuarios deben verificar la información directamente con los 
            establecimientos correspondientes.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Enlaces a Sitios de Terceros</h2>
          <p>
            Nuestra aplicación puede contener enlaces a sitios web o servicios de terceros que no 
            son propiedad ni están controlados por Experiencias Arroyo. No tenemos control sobre, 
            y no asumimos ninguna responsabilidad por el contenido, políticas de privacidad o 
            prácticas de sitios web o servicios de terceros.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Limitación de Responsabilidad</h2>
          <p>
            Experiencias Arroyo y sus directores, empleados, socios, agentes, proveedores o afiliados 
            no serán responsables de ningún daño indirecto, incidental, especial, consecuente o 
            punitivo, incluyendo sin limitación, pérdida de beneficios, datos, uso, fondo de comercio 
            u otras pérdidas intangibles, resultantes de:
          </p>
          <ul>
            <li>Su acceso o uso o incapacidad para acceder o usar la aplicación</li>
            <li>Cualquier conducta o contenido de terceros en la aplicación</li>
            <li>Cualquier contenido obtenido de la aplicación</li>
            <li>Acceso, uso o alteración no autorizada de sus transmisiones o contenido</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Exención de Garantías</h2>
          <p>
            La aplicación se proporciona "tal cual" y "según disponibilidad" sin garantías de 
            ningún tipo, ya sean expresas o implícitas. No garantizamos que la aplicación será 
            ininterrumpida, segura o libre de errores.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Modificaciones al Servicio</h2>
          <p>
            Nos reservamos el derecho de modificar o descontinuar, temporal o permanentemente, 
            el servicio (o cualquier parte del mismo) con o sin previo aviso. No seremos 
            responsables ante usted o terceros por cualquier modificación, suspensión o 
            descontinuación del servicio.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Modificaciones a los Términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Le 
            notificaremos sobre cambios materiales publicando los nuevos términos en esta página. 
            Su uso continuado de la aplicación después de dichos cambios constituye su aceptación 
            de los nuevos términos.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se regirán e interpretarán de acuerdo con las leyes de México, sin 
            consideración a sus disposiciones sobre conflictos de leyes. Cualquier disputa que 
            surja de o esté relacionada con estos términos estará sujeta a la jurisdicción 
            exclusiva de los tribunales competentes en México.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Terminación</h2>
          <p>
            Podemos terminar o suspender su acceso inmediatamente, sin previo aviso o responsabilidad, 
            por cualquier motivo, incluyendo sin limitación si incumple estos términos. Todas las 
            disposiciones de estos términos que por su naturaleza deban sobrevivir a la terminación 
            lo harán, incluyendo sin limitación, disposiciones de propiedad, exenciones de garantía, 
            indemnización y limitaciones de responsabilidad.
          </p>
        </section>

        <section className="legal-section">
          <h2>14. Indemnización</h2>
          <p>
            Usted acepta defender, indemnizar y mantener indemne a Experiencias Arroyo y sus 
            licenciantes y licenciatarios, y sus empleados, contratistas, agentes, funcionarios 
            y directores, de y contra todas y cada una de las reclamaciones, daños, obligaciones, 
            pérdidas, responsabilidades, costos o deudas, y gastos (incluidos, entre otros, los 
            honorarios de abogados) que surjan de su uso de la aplicación o su violación de estos términos.
          </p>
        </section>

        <section className="legal-section">
          <h2>15. Divisibilidad</h2>
          <p>
            Si alguna disposición de estos términos se considera inválida o inaplicable por un 
            tribunal, las disposiciones restantes de estos términos continuarán en pleno vigor y efecto.
          </p>
        </section>

        <section className="legal-section">
          <h2>16. Contacto</h2>
          <p>
            Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través 
            de los medios disponibles en la aplicación.
          </p>
        </section>

        <section className="legal-section">
          <h2>17. Eliminación de Cuenta</h2>
          <p>
            Respetamos su derecho a eliminar su cuenta en cualquier momento. Para solicitar la 
            eliminación de su cuenta y todos los datos asociados, visite nuestra página de{' '}
            <a href="/eliminacion-cuenta" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              Eliminación de Cuenta
            </a>
            , donde encontrará información detallada sobre el proceso y los datos que serán eliminados.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
