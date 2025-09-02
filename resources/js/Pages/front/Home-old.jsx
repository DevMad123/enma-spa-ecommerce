// /resources/js/Pages/front/Home.jsx
import React from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

/*
  TODO: remplacer les placeholders par de vraies images/URLs et textes de projet.
  Ce fichier est responsive mobile-first et n'ajoute aucune dépendance externe.
*/

/* ---------- petites données en haut du fichier ---------- */
const SERVICES = [
  {
    id: 'webstudio',
    title: 'WebStudio',
    desc: 'Sites vitrines élégants, SEO-friendly et conversion-oriented.',
    icon: '🌐',
  },
  {
    id: 'creativelabs',
    title: 'CreativeLabs',
    desc: 'Branding, identité visuelle et contenus créatifs percutants.',
    icon: '🎨',
  },
  {
    id: 'devstudio',
    title: 'DevStudio',
    desc: 'Applications sur-mesure, API robustes et scalables.',
    icon: '💻',
  },
];

const CASE_STUDIES = [
  {
    id: 'proj-1',
    title: "Refonte - Regie Pub Locale",
    desc: "Optimisation UX d'un tunnel de souscription et intégration CMS.",
    tags: ['UX', 'CMS', 'Performance'],
  },
  {
    id: 'proj-2',
    title: "Plateforme Éducative",
    desc: "Portail de cours en ligne, suivi des étudiants et dashboard admin.",
    tags: ['Laravel', 'React', 'SaaS'],
  },
  {
    id: 'proj-3',
    title: "E-commerce Premium",
    desc: "Catalogue, paiement local, et optimisation mobile-first.",
    tags: ['E-commerce', 'Conversion', 'Mobile'],
  },
];

const PROCESS_STEPS = [
  { step: 1, title: 'Découverte', emoji: '🔎', text: "Ateliers & audit pour comprendre vos objectifs." },
  { step: 2, title: 'Design', emoji: '✏️', text: "Maquettes, prototypes et validations UX." },
  { step: 3, title: 'Développement', emoji: '⚙️', text: "Code propre, tests et intégrations continues." },
  { step: 4, title: 'Lancement', emoji: '🚀', text: "Mise en production et plan de montée en charge." },
];

const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Aïssata Traoré',
    role: 'Directrice Marketing — Client A',
    quote: "Leur approche pragmatique et leur sens du détail ont transformé notre site en un vrai levier de ventes.",
  },
  {
    id: 't2',
    name: 'Koffi Mensah',
    role: 'CEO — Start-up B',
    quote: "Livraison rapide, communication claire et support post-lancement efficace.",
  },
  {
    id: 't3',
    name: 'Marie Koné',
    role: 'Responsable Communication — ONG C',
    quote: "Équipe créative et professionnelle — notre marque n'a jamais été aussi cohérente.",
  },
];

/* ---------- sous-composants locaux ---------- */

function IconBlob({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 600"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#2c4656" />
          <stop offset="100%" stopColor="#23ad94" />
        </linearGradient>
      </defs>
      <g>
        <path fill="url(#g1)" opacity="0.08" d="M421,307Q412,364,359,400Q306,436,249,430Q192,424,140,395Q88,366,82,307Q76,248,115,206Q154,164,205,132Q256,100,309,118Q362,136,410,169Q458,202,430,253Q402,304,421,307Z" />
      </g>
    </svg>
  );
}

function ServiceCard({ service }) {
  return (
    <article
      aria-labelledby={`svc-${service.id}`}
      className="group bg-white/6 backdrop-blur-sm ring-1 ring-white/6 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition transform will-change-transform"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 ring-1 ring-white/5 text-2xl">
        <span aria-hidden="true">{service.icon}</span>
      </div>
      <h3 id={`svc-${service.id}`} className="mt-4 text-lg font-semibold text-white">
        {service.title}
      </h3>
      <p className="mt-2 text-sm text-white/80">{service.desc}</p>
      <a
        href="#contact"
        className="mt-4 inline-block text-sm font-medium px-4 py-2 rounded-md bg-white text-[#2c4656] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white/40 transition"
      >
        En savoir plus
      </a>
    </article>
  );
}

function CaseStudyCard({ item }) {
  // small inline SVG placeholder (data URI)
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#2c4656'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ffffff' font-size='40'>Image Placeholder</text></svg>`
  );
  const src = `data:image/svg+xml;utf8,${svg}`;

  return (
    <article className="group bg-white/5 backdrop-blur rounded-2xl overflow-hidden ring-1 ring-white/6">
      <div className="aspect-[16/9]">
        <img
          src={src}
          alt={`${item.title} — visuel placeholder`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold text-white">{item.title}</h4>
        <p className="mt-2 text-sm text-white/80">{item.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 bg-white/6 rounded-md text-white/90">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md bg-white text-[#2c4656] hover:translate-y-[-2px] transition"
            aria-label={`Voir le projet ${item.title}`}
          >
            Voir le projet
          </a>
        </div>
      </div>
    </article>
  );
}

function TestimonialCard({ t }) {
  return (
    <figure
      tabIndex="0"
      className="min-w-[280px] max-w-xs shrink-0 bg-white/6 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-white/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 scroll-snap-align: start"
      aria-label={`Témoignage de ${t.name}`}
    >
      <blockquote className="text-sm text-white/90">“{t.quote}”</blockquote>
      <figcaption className="mt-4 text-xs text-white/70">
        <div className="font-semibold text-white">{t.name}</div>
        <div>{t.role}</div>
      </figcaption>
    </figure>
  );
}

/* ---------- composant principal Home ---------- */

export default function Home() {
  function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };
    // TODO: remplacer par un envoi réel (API)
    // eslint-disable-next-line no-console
    console.log('Demande de contact (factice):', data);
    form.reset();
    // petite confirmation visuelle minimale (accessible)
    alert('Merci — votre demande a bien été prise en compte (simulation).');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#071724_0%,#041018_100%)] text-white">
      <FrontHeader />
      <main className="flex-grow">
        {/* HERO */}
        <section
          id="hero"
          aria-labelledby="home-title"
          className="relative pt-16 pb-12 min-h-[70vh] flex items-center"
          style={{ background: 'linear-gradient(135deg,#2c4656 0%,#23ad94 100%)' }}
        >
          {/* background mesh / blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -left-20 -top-24 w-[480px] h-[480px] blur-3xl opacity-40">
              <IconBlob className="w-full h-full" />
            </div>
            <div className="absolute right-0 bottom-[-80px] w-[380px] h-[380px] blur-2xl opacity-30">
              <IconBlob className="w-full h-full" />
            </div>
            <div className="absolute inset-0 bg-[url('/images/mesh.png')] bg-[length:600px_600px] opacity-5 mix-blend-overlay" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 id="home-title" className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
                  EnmaLabs — Studio digital
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-xl">
                  WebStudio • CreativeLabs • DevStudio — Nous conjuguons design, stratégie et ingénierie pour des expériences digitales mémorables.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <a
                    href="#services"
                    className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
                  >
                    Nos services
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center px-5 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/20 transition"
                  >
                    Contactez-nous
                  </a>
                </div>

                <div className="mt-6 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
                    </svg>
                    <span>Projets récents disponibles dans la section Études de cas.</span>
                  </span>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/8 bg-white/6 backdrop-blur p-1">
                  {/* Placeholder hero card */}
                  <div className="bg-gradient-to-br from-white/6 to-white/4 p-6 rounded-xl">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><rect width='100%' height='100%' fill='#ffffff11'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ffffff88' font-size='28'>Visuel / produit — TODO</text></svg>`
                        )}`}
                        alt="Aperçu projet — placeholder"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-white">Produit phare — TODO</h3>
                      <p className="text-xs text-white/80 mt-1">Brève description — remplacez par votre contenu réel.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagonal separator */}
        <div aria-hidden="true" className="relative">
          <svg className="block w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
            <path d="M0 40 L1440 0 L1440 40 Z" fill="#041018" />
          </svg>
        </div>

        {/* SERVICES */}
        <section id="services" aria-labelledby="services-title" className="py-16 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="text-center mb-8">
              <h2 id="services-title" className="text-2xl font-bold">Nos pôles</h2>
              <p className="mt-2 text-sm text-white/80">Trois équipes pour couvrir l'ensemble de vos besoins digitaux.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICES.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>

        {/* Diagonal separator */}
        <div aria-hidden="true" className="relative">
          <svg className="block w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
            <path d="M0 0 L1440 40 L0 40 Z" fill="#0B2730" />
          </svg>
        </div>

        {/* CASE STUDIES */}
        <section id="etudes-de-cas" aria-labelledby="case-title" className="py-16 bg-[#0b2730]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h2 id="case-title" className="text-2xl font-bold">Études de cas</h2>
                <p className="mt-1 text-sm text-white/80">Sélection de projets représentatifs — résultats mesurables.</p>
              </div>
              <div className="text-sm text-white/70">Voir tous — TODO</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CASE_STUDIES.map((c) => (
                <CaseStudyCard key={c.id} item={c} />
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS / METHODOLOGIE */}
        <section id="process" aria-labelledby="process-title" className="py-16 bg-[#071724]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="text-center mb-8">
              <h2 id="process-title" className="text-2xl font-bold">Processus & méthodologie</h2>
              <p className="mt-2 text-sm text-white/80">Un parcours clair, itératif et transparent.</p>
            </header>

            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PROCESS_STEPS.map((p) => (
                <li key={p.step} className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-3 ring-1 ring-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-semibold text-white">
                      {p.step}
                    </div>
                    <div className="text-sm font-semibold text-white">{p.title}</div>
                  </div>
                  <p className="text-xs text-white/80">{p.emoji} {p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="temoignages" aria-labelledby="testimonials-title" className="py-16 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h2 id="testimonials-title" className="text-2xl font-bold">Témoignages clients</h2>
                <p className="mt-1 text-sm text-white/80">Ils partagent leur expérience de collaboration.</p>
              </div>
              <div className="text-sm text-white/70">Swipe →</div>
            </header>

            <div
              className="overflow-x-auto no-scrollbar py-3 -mx-2 px-2 snap-x snap-mandatory"
              role="region"
              aria-label="Carrousel de témoignages"
            >
              <div className="flex gap-4">
                {TESTIMONIALS.map((t) => (
                  <div key={t.id} className="snap-start">
                    <TestimonialCard t={t} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT / DEVIS */}
        <section id="contact" aria-labelledby="contact-title" className="py-16 bg-[#072028]">
          <div className="max-w-4xl mx-auto px-6">
            <header className="text-center mb-8">
              <h2 id="contact-title" className="text-2xl font-bold">Contact & Devis rapide</h2>
              <p className="mt-2 text-sm text-white/80">Décrivez votre besoin et nous reviendrons vers vous.</p>
            </header>

            <div className="bg-white/6 backdrop-blur-sm ring-1 ring-white/6 rounded-2xl p-6">
              <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-xs font-medium text-white/80">Nom</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="email" className="block text-xs font-medium text-white/80">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    placeholder="contact@exemple.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-xs font-medium text-white/80">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    className="mt-1 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    placeholder="Décrivez brièvement votre projet..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
                  >
                    Envoyer la demande
                  </button>

                  <div className="text-sm text-white/70">
                    <strong>Délais :</strong> réponse sous 48h ouvrées — TODO: préciser SLA.
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <FrontFooter />
    </div>
  );
}
