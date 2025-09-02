// /resources/js/Pages/front/Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';
import heroImg from '../../../assets/front/imgs/hero-bg.png';

/*
  TODO: remplacer les placeholders par de vraies images/URLs et textes de projet.
  Ce fichier est responsive mobile-first.
*/

/* ---------- petites données en haut du fichier ---------- */
const SERVICES = [
  { id: 'webstudio', title: 'WebStudio', desc: 'Sites vitrines élégants, SEO-friendly et conversion-oriented.', icon: '🌐' },
  { id: 'creativelabs', title: 'CreativeLabs', desc: 'Branding, identité visuelle et contenus créatifs percutants.', icon: '🎨' },
  { id: 'devstudio', title: 'DevStudio', desc: 'Applications sur-mesure, API robustes et scalables.', icon: '💻' },
];

const CASE_STUDIES = [
  { id: 'proj-1', title: "Refonte - Regie Pub Locale", desc: "Optimisation UX d'un tunnel de souscription et intégration CMS.", tags: ['UX', 'CMS', 'Performance'] },
  { id: 'proj-2', title: "Plateforme Éducative", desc: "Portail de cours en ligne, suivi des étudiants et dashboard admin.", tags: ['Laravel', 'React', 'SaaS'] },
  { id: 'proj-3', title: "E-commerce Premium", desc: "Catalogue, paiement local, et optimisation mobile-first.", tags: ['E-commerce', 'Conversion', 'Mobile'] },
];

const PROCESS_STEPS = [
  { step: 1, title: 'Découverte', emoji: '🔎', text: "Ateliers & audit pour comprendre vos objectifs." },
  { step: 2, title: 'Design', emoji: '✏️', text: "Maquettes, prototypes et validations UX." },
  { step: 3, title: 'Développement', emoji: '⚙️', text: "Code propre, tests et intégrations continues." },
  { step: 4, title: 'Lancement', emoji: '🚀', text: "Mise en production et plan de montée en charge." },
];

const TESTIMONIALS = [
  { id: 't1', name: 'Aïssata Traoré', role: 'Directrice Marketing — Client A', quote: "Leur approche pragmatique et leur sens du détail ont transformé notre site en un vrai levier de ventes." },
  { id: 't2', name: 'Koffi Mensah', role: 'CEO — Start-up B', quote: "Livraison rapide, communication claire et support post-lancement efficace." },
  { id: 't3', name: 'Marie Koné', role: 'Responsable Communication — ONG C', quote: "Équipe créative et professionnelle — notre marque n'a jamais été aussi cohérente." },
];

/* ---------- animations ---------- */
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
};

/* ---------- sous-composants ---------- */
function ServiceCard({ service, i }) {
  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={i}
      aria-labelledby={`svc-${service.id}`}
      className="group bg-white/6 backdrop-blur-sm ring-1 ring-white/6 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition transform"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 ring-1 ring-white/5 text-2xl">
        {service.icon}
      </div>
      <h3 id={`svc-${service.id}`} className="mt-4 text-lg font-semibold text-white">{service.title}</h3>
      <p className="mt-2 text-sm text-white/80">{service.desc}</p>
      <a href="#contact" className="mt-4 inline-block text-sm font-medium px-4 py-2 rounded-md bg-white text-[#2c4656] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white/40 transition">En savoir plus</a>
    </motion.article>
  );
}

function CaseStudyCard({ item, i }) {
  const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#2c4656'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ffffff' font-size='40'>Image Placeholder</text></svg>`);
  const src = `data:image/svg+xml;utf8,${svg}`;
  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={i}
      className="group bg-white/5 backdrop-blur rounded-2xl overflow-hidden ring-1 ring-white/6"
    >
      <div className="aspect-[16/9]">
        <img src={src} alt={`${item.title} — visuel placeholder`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold text-white">{item.title}</h4>
        <p className="mt-2 text-sm text-white/80">{item.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => <span key={t} className="text-xs px-2 py-1 bg-white/6 rounded-md text-white/90">{t}</span>)}
        </div>
        <div className="mt-4">
          <a href="#contact" className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md bg-white text-[#2c4656] hover:translate-y-[-2px] transition">Voir le projet</a>
        </div>
      </div>
    </motion.article>
  );
}

function TestimonialCard({ t, i }) {
  return (
    <motion.figure
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={i}
      tabIndex="0"
      className="min-w-[280px] max-w-xs shrink-0 bg-white/6 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-white/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 snap-start"
    >
      <blockquote className="text-sm text-white/90">“{t.quote}”</blockquote>
      <figcaption className="mt-4 text-xs text-white/70">
        <div className="font-semibold text-white">{t.name}</div>
        <div>{t.role}</div>
      </figcaption>
    </motion.figure>
  );
}

/* ---------- composant principal ---------- */
export default function Home() {
  function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    console.log('Demande de contact (factice):', {
      name: form.name.value, email: form.email.value, message: form.message.value,
    });
    form.reset();
    alert('Merci — votre demande a bien été prise en compte (simulation).');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#071724_0%,#041018_100%)] text-white">
      <FrontHeader />
      <main className="flex-grow">
        {/* HERO */}
        <section id="hero" className="relative pt-20 pb-12 min-h-[70vh] flex items-center" style={{ background: 'linear-gradient(135deg,#2c4656 0%,#23ad94 100%)' }}>
          <div className="relative pt-8 z-10 max-w-6xl mx-auto px-6 w-full">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md">EnmaLabs — Studio digital</motion.h1>
                <motion.p variants={fadeIn} className="mt-4 text-lg sm:text-xl text-white/90 max-w-xl">WebStudio • CreativeLabs • DevStudio — Nous conjuguons design, stratégie et ingénierie pour des expériences digitales mémorables.</motion.p>
                <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a href="#services" className="px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold shadow-sm hover:shadow-md transition">Nos services</a>
                  <a href="#contact" className="px-5 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition">Contactez-nous</a>
                </motion.div>
              </div>
              <motion.div variants={fadeIn} className="flex justify-center lg:justify-end">
                <img
                  src={heroImg}
                  alt="Solutions digitales modernes par EnmaLabs"
                  className="max-w-md w-full drop-shadow-xl rounded-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-16 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="text-center mb-8">
              <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-2xl font-bold">Nos pôles</motion.h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICES.map((s, i) => <ServiceCard key={s.id} service={s} i={i} />)}
            </div>
          </div>
        </section>

        {/* CASE STUDIES */}
        <section id="etudes-de-cas" className="py-16 bg-[#0b2730]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-2xl font-bold mb-6">Études de cas</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CASE_STUDIES.map((c, i) => <CaseStudyCard key={c.id} item={c} i={i} />)}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="py-16 bg-[#071724]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-2xl font-bold mb-8 text-center">Processus & méthodologie</motion.h2>
            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PROCESS_STEPS.map((p, i) => (
                <motion.li key={p.step} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="bg-white/6 rounded-2xl p-4 ring-1 ring-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">{p.step}</div>
                    <div className="text-sm font-semibold">{p.title}</div>
                  </div>
                  <p className="text-xs text-white/80 mt-2">{p.emoji} {p.text}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="temoignages" className="py-16 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-2xl font-bold mb-6">Témoignages clients</motion.h2>
            <div className="overflow-x-auto no-scrollbar py-3 -mx-2 px-2 snap-x snap-mandatory flex gap-4">
              {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.id} t={t} i={i} />)}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-16 bg-[#072028]">
          <div className="max-w-4xl mx-auto px-6">
            <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-2xl font-bold mb-8 text-center">Contact & Devis rapide</motion.h2>
            <motion.form variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} onSubmit={handleContactSubmit} className="bg-white/6 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs">Nom</label>
                <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs">Email</label>
                <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="message" className="block text-xs">Message</label>
                <textarea id="message" name="message" rows="4" required className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2" />
              </div>
              <div className="md:col-span-2 flex justify-between">
                <button type="submit" className="px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold">Envoyer la demande</button>
              </div>
            </motion.form>
          </div>
        </section>
      </main>
      <FrontFooter />
    </div>
  );
}
