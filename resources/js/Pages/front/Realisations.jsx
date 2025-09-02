// /resources/js/Pages/front/Realisation.jsx
import React, { useState } from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

/*
  Realisation.jsx
  - Page portfolio / réalisations
  - TODO: remplacer placeholders par images réelles et liens de projets
*/

/* ---------- données des projets ---------- */
const PROJECTS = [
  {
    id: 'p1',
    title: 'Site vitrine — Office Local',
    desc: "Refonte UX pour améliorer la conversion des formulaires de contact.",
    tags: ['Web', 'SEO'],
    category: 'Web',
  },
  {
    id: 'p2',
    title: 'Branding & Identité — Marque Locale',
    desc: "Création d'une identité complète : logo, charte et supports.",
    tags: ['Branding', 'Creative'],
    category: 'Creative',
  },
  {
    id: 'p3',
    title: 'Plateforme Éducative',
    desc: "Portail d'apprentissage avec suivi et dashboard enseignants.",
    tags: ['Laravel', 'Dev'],
    category: 'Dev',
  },
  {
    id: 'p4',
    title: 'E-commerce mobile-first',
    desc: "Catalogue optimisé mobile et tunnel de paiement local.",
    tags: ['Web', 'Conversion'],
    category: 'Web',
  },
  {
    id: 'p5',
    title: 'Campagne visuelle - CreativeLabs',
    desc: "Direction artistique et contenus pour réseaux sociaux.",
    tags: ['Creative', 'Content'],
    category: 'Creative',
  },
  {
    id: 'p6',
    title: 'API & Intégrations',
    desc: "API robuste pour synchronisation multi-systèmes et monitoring.",
    tags: ['Dev', 'API'],
    category: 'Dev',
  },
  {
    id: 'p7',
    title: 'Landing produit',
    desc: "Page de lancement avec A/B testing et analytics intégrés.",
    tags: ['Web', 'A/B'],
    category: 'Web',
  },
  {
    id: 'p8',
    title: 'Refonte packaging digital',
    desc: "Identité pack et mockups pour distribution e-commerce.",
    tags: ['Creative', 'Packaging'],
    category: 'Creative',
  },
  {
    id: 'p9',
    title: 'Système d’authentification SSO',
    desc: "Sécurité renforcée et SSO pour portail client.",
    tags: ['Dev', 'Security'],
    category: 'Dev',
  },
];

/* ---------- composants internes ---------- */

function IconBlob({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g2" x1="0" x2="1">
          <stop offset="0%" stopColor="#2c4656" />
          <stop offset="100%" stopColor="#23ad94" />
        </linearGradient>
      </defs>
      <path fill="url(#g2)" opacity="0.08" d="M421,307Q412,364,359,400Q306,436,249,430Q192,424,140,395Q88,366,82,307Q76,248,115,206Q154,164,205,132Q256,100,309,118Q362,136,410,169Q458,202,430,253Q402,304,421,307Z" />
    </svg>
  );
}

function ProjectCard({ project }) {
  // simple gradient placeholder svg data URI
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0%' stop-color='#2c4656'/><stop offset='100%' stop-color='#23ad94'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='28'>${project.title}</text></svg>`
  );
  const src = `data:image/svg+xml;utf8,${svg}`;

  return (
    <article
      className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-white/6 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition"
      aria-labelledby={`proj-${project.id}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={src}
          alt={`${project.title} — visuel placeholder`}
          loading="lazy"
          decoding="async"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />
      </div>
      <div className="p-4">
        <h3 id={`proj-${project.id}`} className="text-lg font-semibold text-white">{project.title}</h3>
        <p className="mt-2 text-sm text-white/80">{project.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 bg-white/6 rounded-md text-white/90">{t}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <a
            href="#highlight"
            className="text-sm font-semibold inline-flex items-center px-3 py-2 rounded-md bg-white text-[#2c4656] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white/30 transition"
            aria-label={`Voir le projet ${project.title}`}
          >
            Voir le projet
          </a>
          <span className="text-xs text-white/60">{project.category}</span>
        </div>
      </div>
    </article>
  );
}

function HighlightProject({ project }) {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><defs><linearGradient id='gH' x1='0' x2='1'><stop offset='0%' stop-color='#23ad94'/><stop offset='100%' stop-color='#2c4656'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#gH)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='36'>${project.title} — Projet phare</text></svg>`
  );
  const src = `data:image/svg+xml;utf8,${svg}`;

  return (
    <section id="highlight" aria-labelledby="highlight-title" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-6">
          <h2 id="highlight-title" className="text-2xl font-bold text-white">Projet phare</h2>
          <p className="mt-2 text-sm text-white/80">Zoom sur un projet représentatif de notre savoir-faire.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/6 bg-white/6 backdrop-blur-sm">
            <img
              src={src}
              alt={`${project.title} — image mise en avant`}
              loading="lazy"
              decoding="async"
              className="w-full h-80 object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
            <p className="mt-4 text-white/80">{project.desc}</p>
            <p className="mt-3 text-sm text-white/70">
              {/* TODO: étoffer la description du projet phare */}
              Travail réalisé : prototype, design system, intégration front-end, optimisation des performances et maintenance continue.
            </p>
            <div className="mt-6">
              <a
                href="#contact"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
              >
                Voir le projet
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- composant principal Realisation ---------- */

export default function Realisation() {
  const [filter, setFilter] = useState('Tous');

  // simulation simple de filtrage via tableau (sans complexité)
  const filtered = filter === 'Tous' ? PROJECTS : PROJECTS.filter((p) =>
    (filter === 'Web' && p.category === 'Web') ||
    (filter === 'Creative' && p.category === 'Creative') ||
    (filter === 'Dev' && p.category === 'Dev')
  );

  // choisir project phare (ex: premier Web ou fallback)
  const highlightProject = PROJECTS.find((p) => p.category === 'Web') || PROJECTS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#071724_0%,#041018_100%)] text-white">
      <FrontHeader />

      <main className="flex-grow">
        {/* HERO */}
        <section
          id="hero"
          aria-labelledby="real-title"
          className="relative pt-20 pb-12"
          style={{ background: 'linear-gradient(135deg,#2c4656 0%,#23ad94 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 -top-20 w-[480px] h-[480px] blur-3xl opacity-30">
              <IconBlob className="w-full h-full" />
            </div>
            <div className="absolute right-0 bottom-[-80px] w-[380px] h-[380px] blur-2xl opacity-25">
              <IconBlob className="w-full h-full" />
            </div>
            <div className="absolute inset-0 bg-[url('/images/mesh.png')] bg-[length:600px_600px] opacity-5 mix-blend-overlay" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 id="real-title" className="text-4xl sm:text-5xl font-extrabold">Nos Réalisations</h1>
              <p className="mt-4 text-lg text-white/90">
                Découvrez une sélection de projets menés par nos équipes WebStudio, CreativeLabs et DevStudio — design réfléchi, code propre, impact mesurable.
              </p>
              <div className="mt-6">
                <a
                  href="#portfolio"
                  className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md transition"
                >
                  Voir le portfolio
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Separator diagonal */}
        <div aria-hidden="true">
          <svg className="block w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
            <path d="M0 40 L1440 0 L1440 40 Z" fill="#041018" />
          </svg>
        </div>

        {/* PORTFOLIO FILTER & GRID */}
        <section id="portfolio" aria-labelledby="portfolio-title" className="py-16 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 id="portfolio-title" className="text-2xl font-bold">Portfolio filtrable</h2>
                <p className="mt-1 text-sm text-white/80">Filtrez par catégorie pour voir des exemples pertinents.</p>
              </div>

              <div className="mt-4 md:mt-0 flex gap-2" role="tablist" aria-label="Filtrer les projets">
                {['Tous', 'Web', 'Creative', 'Dev'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/30 transition ${
                      filter === f
                        ? 'bg-white text-[#2c4656]'
                        : 'bg-white/6 text-white/90 hover:bg-white/10'
                    }`}
                    aria-pressed={filter === f}
                    role="tab"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Highlight project */}
        <HighlightProject project={highlightProject} />

        {/* Processus créatif */}
        <section id="process" aria-labelledby="process-title" className="py-16 bg-[#071724]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="text-center mb-8">
              <h2 id="process-title" className="text-2xl font-bold">Processus créatif</h2>
              <p className="mt-2 text-sm text-white/80">Quatre étapes claires pour transformer une idée en produit fini.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-3 ring-1 ring-white/6">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-semibold">💡</div>
                <h3 className="font-semibold text-white">Idée</h3>
                <p className="text-sm text-white/80">Atelier de cadrage et définition des objectifs.</p>
              </div>
              <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-3 ring-1 ring-white/6">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-semibold">✏️</div>
                <h3 className="font-semibold text-white">Design</h3>
                <p className="text-sm text-white/80">Maquettes, prototype et itérations rapides.</p>
              </div>
              <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-3 ring-1 ring-white/6">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-semibold">⚙️</div>
                <h3 className="font-semibold text-white">Développement</h3>
                <p className="text-sm text-white/80">Intégration, tests et performances optimisées.</p>
              </div>
              <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-3 ring-1 ring-white/6">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-semibold">🚀</div>
                <h3 className="font-semibold text-white">Livraison</h3>
                <p className="text-sm text-white/80">Déploiement sécurisé et accompagnement post-lancement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section id="cta" aria-labelledby="cta-title" className="py-16 bg-gradient-to-r from-[#041018] to-[#072028]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-2xl p-8 bg-white/6 backdrop-blur-sm ring-1 ring-white/6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 id="cta-title" className="text-xl font-bold text-white">Parlons de votre projet !</h2>
                <p className="mt-2 text-sm text-white/80">Décrivez votre idée et nous construirons la meilleure version digitale ensemble.</p>
              </div>
              <div>
                <a
                  href="#contact"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
                >
                  Contactez-nous
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FrontFooter />
    </div>
  );
}
