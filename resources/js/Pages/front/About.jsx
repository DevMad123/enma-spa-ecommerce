import React, { useEffect, useRef, useState } from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

// ==================== Données ====================
const values = [
  { icon: "💡", title: "Innovation", text: "Nous créons des solutions modernes et adaptées aux besoins de nos clients." },
  { icon: "✨", title: "Qualité", text: "L’excellence et l’attention au détail sont au cœur de chaque projet." },
  { icon: "🤝", title: "Collaboration", text: "Nous croyons en la force des équipes et des partenariats durables." },
  { icon: "🌍", title: "Impact", text: "Nous développons des solutions qui transforment et créent de la valeur." },
];

const team = [
  { name: "N'golo Ouattara", role: "CEO & Fondateur", quote: "Créer pour inspirer.", img: "https://via.placeholder.com/300x300", linkedin: "#" },
  { name: "Awa Diabaté", role: "CTO", quote: "L’innovation avant tout.", img: "https://via.placeholder.com/300x300", linkedin: "#" },
  { name: "Jean Kouadio", role: "Lead Designer", quote: "Le design est une expérience.", img: "https://via.placeholder.com/300x300", linkedin: "#" },
  { name: "Fatou Koné", role: "Chef de projet", quote: "Organiser pour réussir.", img: "https://via.placeholder.com/300x300", linkedin: "#" },
];

const stats = [
  { value: 120, label: "Projets réalisés" },
  { value: 50, label: "Clients satisfaits" },
  { value: 10, label: "Années d’expérience" },
  { value: 3, label: "Studios créatifs" },
];

const steps = [
  { title: "Découverte", text: "Analyse des besoins et compréhension des enjeux." },
  { title: "Conception", text: "Création de maquettes et validation des parcours utilisateurs." },
  { title: "Développement", text: "Réalisation technique avec les meilleures pratiques." },
  { title: "Accompagnement", text: "Support, maintenance et amélioration continue." },
];

// ==================== Composants internes ====================
const FadeInSection = ({ children }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.2 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {children}
    </div>
  );
};

const Counter = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let i = 0;
        const step = Math.ceil(value / 50);
        const interval = setInterval(() => {
          i += step;
          if (i >= value) {
            setCount(value);
            clearInterval(interval);
          } else {
            setCount(i);
          }
        }, 30);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-[#23ad94]">{count}+</div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

// ==================== Page About ====================
export default function About() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <FrontHeader />

      {/* Hero */}
      <section id="hero" className="bg-gradient-to-r from-[#2c4656] to-[#23ad94] text-white py-20">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">À propos de nous</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Enma Labs, c’est l’alliance de la créativité, de l’innovation et de la technologie pour offrir des solutions digitales premium qui transforment les idées en réussites.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section id="histoire" className="py-16 max-w-6xl mx-auto px-6">
        <FadeInSection>
          <h2 className="text-3xl font-bold text-center mb-10">Notre histoire</h2>
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <p>Fondée avec une vision claire : rendre le digital accessible et impactant pour toutes les entreprises.</p>
            <p>Au fil des années, nous avons grandi grâce à la confiance de nos clients et à une équipe passionnée.</p>
            <p>Aujourd’hui, nous sommes un acteur reconnu dans le développement web, mobile et la communication digitale.</p>
          </div>
        </FadeInSection>
      </section>

      {/* Vision & valeurs */}
      <section id="valeurs" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-center mb-12">Vision & Valeurs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((val, i) => (
                <div key={i} className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transition">
                  <div className="text-4xl mb-4">{val.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{val.title}</h3>
                  <p className="text-gray-600">{val.text}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Équipe */}
      <section id="equipe" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-center mb-12">Notre équipe</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden group">
                  <img src={member.img} alt={member.name} loading="lazy" className="w-full h-56 object-cover" />
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                    <p className="italic text-gray-600 text-sm mt-2">“{member.quote}”</p>
                    <a href={member.linkedin} className="inline-block mt-3 text-[#23ad94] opacity-0 group-hover:opacity-100 transition">LinkedIn</a>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Chiffres clés */}
      <section id="stats" className="py-16 bg-white">
        <FadeInSection>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            {stats.map((stat, i) => (
              <Counter key={i} value={stat.value} label={stat.label} />
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Méthodologie */}
      <section id="methode" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-center mb-12">Notre méthodologie</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {steps.map((step, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-2xl font-bold text-[#23ad94] mb-2">{i + 1}</div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.text}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-gradient-to-r from-[#2c4656] to-[#23ad94] text-white text-center">
        <FadeInSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à collaborer ?</h2>
          <p className="mb-8">Discutons de votre projet et construisons ensemble votre succès digital.</p>
          <a href="#contact" className="px-6 py-3 bg-white text-[#2c4656] rounded-full font-semibold shadow hover:bg-gray-100 transition">
            Contactez-nous
          </a>
        </FadeInSection>
      </section>

      <FrontFooter />
    </div>
  );
}