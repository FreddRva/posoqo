// components/homepage/ContactSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import { ContactSectionProps } from '@/types/homepage';

export const ContactSection: React.FC<ContactSectionProps> = ({ onContact }) => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Ubicación",
      details: ["Av. Principal 123", "Lima, Perú"],
      color: "text-red-500"
    },
    {
      icon: Phone,
      title: "Teléfono",
      details: ["+51 987 654 321", "+51 1 234 5678"],
      color: "text-green-500"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@posoqo.com", "ventas@posoqo.com"],
      color: "text-blue-500"
    },
    {
      icon: Clock,
      title: "Horarios",
      details: ["Lun - Vie: 9:00 - 18:00", "Sáb: 10:00 - 16:00"],
      color: "text-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-amber-400/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-400/10 via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-amber-400 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Contáctanos
          </motion.h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full mb-6"></div>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            ¿Tienes alguna pregunta? ¿Quieres hacer un pedido especial? 
            Estamos aquí para ayudarte.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Información de contacto */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <div className="space-y-1">
                    {item.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-300">{detail}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Formulario de contacto */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Envíanos un mensaje</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Asunto</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Cuéntanos más detalles..."
                ></textarea>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContact}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Enviar Mensaje</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
