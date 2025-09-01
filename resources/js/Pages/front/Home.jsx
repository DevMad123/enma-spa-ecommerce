import React from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

export default function Home() {
  return (
    <div>
      <FrontHeader />
      <main className="pt-16 flex-grow">
        {/* Hero Section */}
        <section
          className="relative flex items-center justify-center text-center px-6"
          style={{
            background: 'linear-gradient(135deg, #2c4656 0%, #23ad94 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#2c4656] to-[#23ad94] blur-xl" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-white text-5xl sm:text-6xl font-bold drop-shadow-lg">
              Bienvenue chez EnmalaBS
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-100">
              WebStudio • CreativeLabs • DevStudio — Nous transformons vos idées en expériences digitales.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#services"
                className="px-6 py-3 bg-white text-[#2c4656] font-semibold rounded-lg shadow hover:bg-gray-100 transition"
              >
                Nos services
              </a>
              <a
                href="#contact"
                className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#2c4656] transition"
              >
                Contactez-nous
              </a>
            </div>
          </div>
          {/* Optional: layer graphique ou illustration */}
        </section>

        {/* Section “Nos activités” */}
        <section id="services" className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'WebStudio', desc: 'Sites vitrines élégants & efficaces.', icon: '🌐' },
              { title: 'CreativeLabs', desc: 'Identité visuelle & branding innovant.', icon: '🎨' },
              { title: 'DevStudio', desc: 'Développement sur mesure & performant.', icon: '💻' },
            ].map((service) => (
              <div key={service.title} className="space-y-4 p-6 bg-white rounded-xl shadow">
                <div className="text-4xl">{service.icon}</div>
                <h3 className="text-2xl font-semibold">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <FrontFooter />
    </div>
  );
}
