"use client";
import { useState } from "react";
import { Beer, Gift, Users, Calendar, Star, CheckCircle, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export default function ChelaGratisPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    edad: "",
    aceptaTerminos: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        edad: "",
        aceptaTerminos: false
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900">


      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-sm font-medium mb-6">
              Sorteo Mensual
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            🍺 CHELA GRATIS 🍺
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Participa en nuestro sorteo mensual de cervezas artesanales POSOQO. 
            La participación es completamente gratuita.
          </p>
          
          <a
            href="#participar"
            className="inline-flex items-center px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors"
          >
            <Beer className="w-6 h-6 mr-3" />
            PARTICIPAR AHORA
            <ArrowRight className="w-5 h-5 ml-3" />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8" id="participar">
            {/* Subscription Form */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="bg-amber-500 p-6 text-center">
                <CheckCircle className="w-10 h-10 text-white mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white">Suscripción al Sorteo</h2>
                <p className="text-amber-100">Completa tus datos y participa</p>
              </div>
              
              <div className="p-6">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="+51 966 123 456"
                      />
                    </div>

                    <div>
                      <label htmlFor="edad" className="block text-sm font-medium text-gray-300 mb-2">
                        Edad *
                      </label>
                      <input
                        type="number"
                        id="edad"
                        name="edad"
                        required
                        min="18"
                        max="100"
                        value={formData.edad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Tu edad"
                      />
                      <p className="text-xs text-gray-500 mt-1">Debes ser mayor de 18 años</p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="aceptaTerminos"
                        name="aceptaTerminos"
                        required
                        checked={formData.aceptaTerminos}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                      />
                      <label htmlFor="aceptaTerminos" className="text-sm text-gray-400">
                        Acepto los{" "}
                        <a href="/terminos" className="text-amber-400 hover:text-amber-300 underline">
                          términos y condiciones
                        </a>{" "}
                        y la{" "}
                        <a href="/privacidad" className="text-amber-400 hover:text-amber-300 underline">
                          política de privacidad
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.aceptaTerminos}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Suscribiendo...
                        </>
                      ) : (
                        <>
                          <Beer className="w-5 h-5 mr-3" />
                          ¡SUSCRIBIRME AL SORTEO!
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-400 mb-2">
                      ¡Suscripción Exitosa!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Ya estás participando en el sorteo de este mes. Te notificaremos por email si eres ganador.
                    </p>
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                      <p className="text-green-300 font-medium">
                        🎯 Tu número de participación: #{Math.floor(Math.random() * 1000) + 100}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400 mr-3" />
                ¿Cómo Funciona?
              </h2>
              
              <div className="space-y-4">
                {[
                  { step: 1, title: "Suscripción", desc: "Completa el formulario con tus datos" },
                  { step: 2, title: "Confirmación", desc: "Recibe tu número de participación" },
                  { step: 3, title: "Sorteo", desc: "El último día del mes se realiza el sorteo" },
                  { step: 4, title: "Notificación", desc: "Los ganadores son contactados" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-8">
            {/* Prize Details */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-400 mr-3" />
                Premios del Mes
              </h2>
              
              <div className="space-y-4">
                {[
                  { place: "🥇", title: "Primer Lugar", prize: "Caja de 12 Cervezas" },
                  { place: "🥈", title: "Segundo Lugar", prize: "Pack de 6 Cervezas" },
                  { place: "🥉", title: "Tercer Lugar", prize: "Pack de 3 Cervezas" },
                  { place: "🎁", title: "Premios Consuelo", prize: "1 Cerveza + Descuento" }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{item.place}</span>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                      </div>
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {item.prize}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Draw Info */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-400 mr-3" />
                Próximo Sorteo
              </h2>
              
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 mb-4">
                <p className="text-2xl font-bold text-amber-300 mb-1">
                  🗓️ {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-amber-200">
                  Último día del mes a las 8:00 PM
                </p>
              </div>
            </div>

            {/* Contact & Pickup */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-400 mr-3" />
                Retiro de Premios
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-amber-300 font-medium">Ubicación</p>
                    <p className="text-gray-300 text-sm">Plaza de Armas, Portal Independencia Nº65, Ayacucho</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-amber-300 font-medium">Horarios</p>
                    <p className="text-gray-300 text-sm">Lunes a Domingo: 10:00 AM - 10:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-amber-300 font-medium">Contacto</p>
                    <p className="text-gray-300 text-sm">+51 966 123 456</p>
                  </div>
                </div>
                
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/30 text-center">
                  <p className="text-red-300 font-medium mb-1">⚠️ Importante</p>
                  <p className="text-gray-300 text-sm">
                    Los premios deben ser retirados dentro de los 7 días hábiles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🍺 ¿Qué Esperas para Participar?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a nuestro sorteo mensual y participa por cervezas artesanales POSOQO
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#participar"
              className="inline-flex items-center px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors"
            >
              <Beer className="w-5 h-5 mr-3" />
              PARTICIPAR AHORA
            </a>
            <a
              href="/tienda"
              className="inline-flex items-center px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-xl transition-colors"
            >
              <Gift className="w-5 h-5 mr-3" />
              Ver Nuestras Cervezas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
