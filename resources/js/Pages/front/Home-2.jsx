import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from '@/Pages/front/layouts/Header';
import Footer from '@/Pages/front/layouts/Footer';

// === Composant Fade-in générique ===
const FadeInSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
  >
    {children}
  </motion.div>
);

// === Compteur animé ===
const Counter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const end = to;
    if (start === end) return;

    let incrementTime = (duration * 1000) / (end - start);
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return <span>{count}</span>;
};

// === Données ===
const services = [
  { title: "Web Studio", desc: "Sites modernes, performants & optimisés.", icon: "🌐" },
  { title: "Dev Studio", desc: "Applications web & mobiles sur mesure.", icon: "💻" },
  { title: "Creative Lab", desc: "Designs créatifs, affiches & branding.", icon: "🎨" },
];

const stats = [
  { label: "Projets réalisés", value: 120 },
  { label: "Clients satisfaits", value: 80 },
  { label: "Années d’expérience", value: 5 },
];

const portfolio = [
  { title: "Projet 1", img: "https://via.placeholder.com/400x250", cat: "Web" },
  { title: "Projet 2", img: "https://via.placeholder.com/400x250", cat: "App" },
  { title: "Projet 3", img: "https://via.placeholder.com/400x250", cat: "Design" },
];

const testimonials = [
  { name: "Awa K.", feedback: "Une équipe professionnelle qui nous a aidés à lancer notre e-commerce avec succès." },
  { name: "Jean M.", feedback: "Leur application de gestion a transformé notre organisation interne." },
  { name: "Fatou B.", feedback: "Un design moderne et un accompagnement impeccable. Bravo à Enma Labs !" },
];

// === Page Home ===
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      {/* Hero */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600 to-purple-700 text-white px-6">
        <FadeInSection>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Bienvenue chez <span className="text-yellow-300">Enma Labs</span>
          </h1>
        </FadeInSection>
        <FadeInSection delay={0.2}>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Web Studio, Dev Studio & Creative Lab — Nous transformons vos idées en solutions numériques innovantes.
          </p>
        </FadeInSection>
        <FadeInSection delay={0.4}>
          <a
            href="#services"
            className="px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold hover:bg-yellow-300 transition"
          >
            Découvrir nos services
          </a>
        </FadeInSection>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-center mb-12">Nos Services</h2>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <FadeInSection key={i} delay={i * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl text-center"
                >
                  <div className="text-5xl mb-4">{s.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p>{s.desc}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-20 bg-gray-100 relative">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-center mb-12">Quelques Réalisations</h2>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolio.map((p, i) => (
              <FadeInSection key={i} delay={i * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl"
                >
                  <img src={p.img} alt={p.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-sm text-gray-500">{p.cat}</p>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <FadeInSection key={i} delay={i * 0.2}>
              <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">
                  <Counter from={0} to={s.value} duration={2} />+
                </div>
                <p className="text-gray-600">{s.label}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-100 relative">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-center mb-12">Témoignages</h2>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeInSection key={i} delay={i * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl"
                >
                  <p className="italic mb-4">“{t.feedback}”</p>
                  <h4 className="font-bold text-blue-600">— {t.name}</h4>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-blue-600 text-white text-center">
        <FadeInSection>
          <h2 className="text-4xl font-bold mb-6">Prêt à démarrer votre projet ?</h2>
          <p className="mb-8">Contactez Enma Labs et transformons vos idées en réalité.</p>
          <a
            href="#contact"
            className="px-8 py-3 bg-yellow-400 text-black rounded-full font-semibold hover:bg-yellow-300 transition"
          >
            Contactez-nous
          </a>
        </FadeInSection>
      </section>

      <Footer />
    </div>
  );
}