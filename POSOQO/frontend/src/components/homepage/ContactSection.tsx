// components/homepage/ContactSection.tsx
import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, Sparkles, Crown } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario de contacto enviado:', formData);
    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-700 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
          >
            <Crown className="w-5 h-5" />
            <span>CONTACTO PREMIUM</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
          
          <h2 className="text-7xl md:text-8xl font-black text-black mb-6 leading-tight">
            Contáctanos
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
            ¿Tienes alguna pregunta o comentario? Nuestro equipo está listo para brindarte una atención personalizada
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-12">
              <h3 className="text-4xl font-bold text-black mb-6">Información de Contacto</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Estamos aquí para ayudarte con cualquier consulta sobre nuestros productos, servicios o membresía VIP.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {[
                { 
                  icon: Phone, 
                  title: "Teléfono Premium", 
                  content: "+51 999 999 999", 
                  description: "Línea directa para miembros VIP",
                  color: "from-yellow-400 to-amber-500"
                },
                { 
                  icon: Mail, 
                  title: "Email Exclusivo", 
                  content: "info@posoqo.com", 
                  description: "Respuesta en menos de 24 horas",
                  color: "from-amber-500 to-yellow-600"
                },
                { 
                  icon: MapPin, 
                  title: "Ubicación Premium", 
                  content: "Ayacucho, Perú", 
                  description: "Cervecería artesanal de clase mundial",
                  color: "from-yellow-600 to-amber-700"
                },
                { 
                  icon: Clock, 
                  title: "Horarios de Atención", 
                  content: "Lun - Dom: 9:00 - 22:00", 
                  description: "Atención personalizada todos los días",
                  color: "from-amber-400 to-yellow-500"
                }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-400/20"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${contact.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <contact.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                      {contact.title}
                    </h4>
                    <p className="text-2xl font-semibold text-gray-800 mb-2">{contact.content}</p>
                    <p className="text-gray-600 text-sm">{contact.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200/50"
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-black mb-4">Envíanos un Mensaje</h3>
              <p className="text-gray-600 leading-relaxed">
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="+51 999 999 999"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  required
                ></textarea>
              </div>

              <motion.button
                type="submit"
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-black font-bold py-5 px-8 rounded-xl text-lg shadow-xl hover:shadow-yellow-400/30 transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 hover:translate-x-full transition-transform duration-1000"></div>
                <Send className="w-6 h-6 relative z-10" />
                <span className="relative z-10">ENVIAR MENSAJE</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};