export default function TerminosPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Términos y Condiciones Generales</h1>
            <p className="text-lg text-amber-900 font-medium">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Estos Términos y Condiciones regulan el uso del sitio web y servicios de POSOQO. Al acceder o utilizar nuestra plataforma,
              usted acepta estar legalmente vinculado por estos términos. Si no está de acuerdo con alguna parte, absténgase de usar nuestros servicios.
            </p>

            {/* Section 1 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">Definiciones y Alcance</h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Para efectos de estos Términos y Condiciones, se entenderá por:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>"Plataforma"</strong>: Sitio web, aplicaciones móviles y servicios digitales de POSOQO</li>
                  <li><strong>"Usuario"</strong>: Cualquier persona que acceda o utilice nuestros servicios</li>
                  <li><strong>"Contenido"</strong>: Textos, imágenes, logos, diseños y demás elementos disponibles</li>
                </ul>
                <p className="text-gray-300">
                  Estos términos aplican a todas las transacciones, interacciones y relaciones comerciales establecidas a través de nuestra plataforma.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Uso Adecuado de la Plataforma</h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  El usuario se compromete a utilizar la plataforma de conformidad con:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li>La legislación peruana vigente</li>
                  <li>Las buenas costumbres y el orden público</li>
                  <li>Los presentes términos y condiciones</li>
                </ul>
                <div className="bg-gray-700/50 p-5 rounded-lg border-l-4 border-amber-500 mb-6">
                  <p className="font-semibold text-amber-400 mb-2">Prohibiciones expresas:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Uso con fines ilegales o fraudulentos</li>
                    <li>Acceso no autorizado a sistemas o áreas restringidas</li>
                    <li>Alteración o modificación del contenido sin autorización</li>
                    <li>Prácticas que puedan dañar la imagen comercial de POSOQO</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Transacciones Comerciales</h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-amber-300 mb-3">3.1 Proceso de Compra</h3>
                <p className="mb-4 text-gray-300">
                  Todas las transacciones están sujetas a disponibilidad y confirmación de precios. El proceso de compra incluye:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-gray-300 mb-6">
                  <li>Selección de productos</li>
                  <li>Verificación de datos y método de pago</li>
                  <li>Confirmación de la orden</li>
                  <li>Envío de comprobante electrónico</li>
                </ol>

                <h3 className="text-xl font-semibold text-amber-300 mb-3">3.2 Precios y Pagos</h3>
                <p className="mb-4 text-gray-300">
                  Los precios están expresados en soles peruanos (S/) e incluyen IGV cuando corresponda. POSOQO se reserva el derecho de:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li>Modificar precios sin previo aviso</li>
                  <li>Corregir errores en precios publicados</li>
                  <li>Rechazar órdenes por causas justificadas</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Propiedad Intelectual</h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Todo el contenido de la plataforma, incluyendo pero no limitado a:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li>Logotipos y marcas comerciales</li>
                  <li>Diseños gráficos e interfaces</li>
                  <li>Contenido textual y multimedia</li>
                  <li>Base de datos y código fuente</li>
                </ul>
                <p className="text-gray-300">
                  están protegidos por las leyes de propiedad intelectual y son de exclusiva propiedad de POSOQO o de sus licenciantes.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Limitación de Responsabilidad</h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  POSOQO no será responsable por:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li>Daños indirectos, incidentales o consecuentes</li>
                  <li>Interrupciones del servicio por causas ajenas a nuestro control</li>
                  <li>Uso indebido de la plataforma por terceros</li>
                  <li>Contenido publicado por usuarios en secciones de comentarios</li>
                </ul>
                <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                  <p className="text-amber-300 font-medium">
                    En ningún caso la responsabilidad total de POSOQO excederá el monto total pagado por el usuario en la transacción que generó el reclamo.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">6</div>
                <h2 className="text-2xl font-bold text-amber-400">Disposiciones Finales</h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-amber-300 mb-3">6.1 Legislación Aplicable</h3>
                <p className="mb-4 text-gray-300">
                  Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa estará sujeta a la jurisdicción exclusiva de los tribunales de Ayacucho.
                </p>

                <h3 className="text-xl font-semibold text-amber-300 mb-3">6.2 Modificaciones</h3>
                <p className="mb-4 text-gray-300">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las versiones actualizadas serán publicadas en esta sección con la fecha de última modificación.
                </p>

                <h3 className="text-xl font-semibold text-amber-300 mb-3">6.3 Contacto</h3>
                <p className="text-gray-300">
                  Para consultas sobre estos términos: <span className="text-amber-400">legal@posoqo.com</span>
                </p>
              </div>
            </section>

            {/* Acceptance Box */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                Declaración de Aceptación
              </p>
              <p className="text-gray-300">
                Al utilizar nuestros servicios, usted reconoce haber leído, entendido y aceptado integralmente estos Términos y Condiciones, 
                así como nuestra Política de Privacidad, comprometiéndose a cumplirlos en su totalidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}