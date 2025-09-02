import React, { useEffect, useRef, useState } from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

// --- Données de contenu --- //
const values = [
  { title: "Innovation", icon: "💡", description: "Toujours à la recherche de solutions créatives et modernes." },
  { title: "Qualité", icon: "⭐", description: "Un haut niveau d'exigence pour garantir des résultats durables." },
  { title: "Collaboration", icon: "🤝", description: "Nous avançons main dans la main avec nos partenaires et clients." },
  { title: "Impact", icon: "🌍", description: "Créer de la valeur réelle et durable pour la société." },
];

const team = [
  { name: "N’Golo Ouattara", role: "Fondateur & CEO", quote: "Transformer les idées en réalités digitales.", img: "https://via.placeholder.com/200" },
  { name: "Awa Traoré", role: "Directrice artistique", quote: "L’esthétique au service de l’expérience.", img: "https://via.placeholder.com/200" },
  { name: "Kouadio K.", role: "Lead Développeur", quote: "Du code propre, des solutions robustes.", img: "https://via.placeholder.com/200" },
  { name: "Fatou Bamba", role: "Responsable Marketing", quote: "Mettre en lumière chaque projet.", img: "https://via.placeholder.com/200" },
];

const stats = [
  { label: "Projets réalisés", value: 120 },
  { label: "Clients satisfaits", value: 50 },
  { label: "Années d’expérience", value: 10 },
];

const steps = [
  { step: "1", title: "Découverte", desc: "Comprendre vos besoins et définir vos objectifs." },
  { step: "2", title: "Conception", desc: "Créer des maquettes et un plan détaillé." },
  { step: "3", title: "Développement", desc: "Transformer vos idées en solutions concrètes." },
  { step: "4", title: "Accompagnement", desc: "Suivi, support et évolutions continues." },
];

// --- Composants internes --- //
const FadeInSection = ({ children }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
};

const Counter = ({ target }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setStarted(true),
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / target));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref} className="text-4xl font-bold text-[#23ad94]">
      +{count}
    </span>
  );
};

const ValueCard = ({ icon, title, description }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow hover:shadow-lg transition">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-[#2c4656]">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TeamMemberCard = ({ img, name, role, quote }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group">
    <img src={img} alt={name} loading="lazy" className="w-full h-56 object-cover group-hover:scale-105 transition-transform" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-[#2c4656]">{name}</h3>
      <p className="text-sm text-[#23ad94]">{role}</p>
      <p className="mt-2 text-gray-600 italic">“{quote}”</p>
    </div>
  </div>
);

// --- Page principale --- //
export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <FrontHeader />

      {/* Hero */}
      <section id="hero" className="bg-gradient-to-r from-[#2c4656] to-[#23ad94] text-white py-24">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <FadeInSection>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de nous</h1>
            <p className="text-lg md:text-xl">
              Chez Enma Labs, nous transformons vos idées en solutions numériques innovantes et durables.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Histoire */}
      <section id="histoire" className="py-20 container mx-auto px-6">
        <FadeInSection>
          <h2 className="text-3xl font-bold text-[#2c4656] mb-8 text-center">Notre histoire</h2>
          <p className="max-w-3xl mx-auto text-center text-gray-600">
            Fondée avec la passion de l’innovation, Enma Labs a grandi grâce à la confiance de ses clients.
            Depuis nos débuts, nous avons accompagné de nombreux projets, en gardant toujours la même vision :
            créer de l’impact positif grâce au digital.
          </p>
        </FadeInSection>
      </section>

      {/* Valeurs */}
      <section id="valeurs" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-[#2c4656] mb-12 text-center">Notre vision & nos valeurs</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <ValueCard key={i} {...v} />
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Équipe */}
      <section id="equipe" className="py-20 container mx-auto px-6">
        <FadeInSection>
          <h2 className="text-3xl font-bold text-[#2c4656] mb-12 text-center">Notre équipe</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <TeamMemberCard key={i} {...m} />
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <FadeInSection>
            <div className="grid sm:grid-cols-3 gap-8">
              {stats.map((s, i) => (
                <div key={i}>
                  <Counter target={s.value} />
                  <p className="mt-2 text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Méthodologie */}
      <section id="methode" className="py-20 container mx-auto px-6">
        <FadeInSection>
          <h2 className="text-3xl font-bold text-[#2c4656] mb-12 text-center">Notre méthodologie</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#23ad94] text-white flex items-center justify-center font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-[#2c4656]">{s.title}</h3>
                <p className="text-gray-600 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-gradient-to-r from-[#2c4656] to-[#23ad94] text-white text-center">
        <FadeInSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à collaborer ?</h2>
          <p className="mb-8 text-lg">Rejoignez-nous pour construire ensemble vos projets digitaux de demain.</p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-white text-[#2c4656] font-semibold rounded-full shadow hover:bg-gray-100 transition"
          >
            Contactez-nous
          </a>
        </FadeInSection>
      </section>

      <FrontFooter />
    </div>
  );
}
