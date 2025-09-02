import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

/**
 * Home.jsx (FR)
 * - Intègre Framer Motion pour fade-in, slide et micro-interactions
 * - TODO: installer framer-motion: `npm install framer-motion` ou `yarn add framer-motion`
 * - TODO: remplacer placeholders / gradients par vraies images & liens projet
 */

/* ---------------------------
   Données (petits tableaux)
   --------------------------- */
const SERVICES = [
  { title: 'WebStudio', desc: 'Sites vitrines élégants & efficaces.', icon: '🌐' },
  { title: 'CreativeLabs', desc: 'Identité visuelle & branding innovant.', icon: '🎨' },
  { title: 'DevStudio', desc: 'Développement sur mesure & performant.', icon: '💻' },
];

const CASE_STUDIES = [
  {
    id: 'cs-1',
    title: 'Refonte site e-commerce',
    desc: 'Augmentation des conversions par une UX optimisée et des temps de chargement réduits.',
    tags: ['E-commerce', 'UX', 'Performance'],
    // TODO: ajouter imageSrc, link
  },
  {
    id: 'cs-2',
    title: "Identité de marque complète",
    desc: 'Branding, guidelines et kit social media pour lancement produit.',
    tags: ['Branding', 'Design'],
  },
  {
    id: 'cs-3',
    title: 'Plateforme de prise de RDV',
    desc: "Application web réactive avec planning et notifications.",
    tags: ['SaaS', 'Planning'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Awa Diabaté',
    role: 'Directrice Marketing — Client A',
    quote: "EnmalaBS a transformé notre présence en ligne : professionnalisme, réactivité et résultats.",
  },
  {
    name: 'Kouadio Yao',
    role: 'Gérant — Atelier Tech',
    quote: "Leur approche technique et design nous a permis d'automatiser 70% des tâches répétitives.",
  },
  {
    name: 'Marie Kouamé',
    role: 'CEO — Startup',
    quote: "Équipe créative et pragmatique. Projet livré dans le respect des délais et du budget.",
  },
];

/* ---------------------------
   Variants Framer Motion
   --------------------------- */
const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* ---------------------------
   Sous-composants (avec motion)
   --------------------------- */

function MotionButtonPrimary({ children, href = '#', onClick }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      role="button"
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 shadow-sm bg-white text-[#2c4656]"
    >
      {children}
    </motion.a>
  );
}

function MotionButtonOutline({ children, href = '#', onClick }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      role="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 border border-white text-white hover:bg-white hover:text-[#2c4656]"
    >
      {children}
    </motion.a>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <motion.article
      tabIndex={0}
      aria-labelledby={`svc-${title}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8, scale: 1.01 }}
      whileFocus={{ y: -4 }}
      className="relative bg-white/60 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-xl transform transition-all focus:outline-none"
    >
      <div className="text-4xl mb-4" aria-hidden>
        {icon}
      </div>
      <h3 id={`svc-${title}`} className="text-xl font-semibold text-[#0f1724]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#0f1724]/80">{desc}</p>
      {/* TODO: lien vers page dédiée */}
    </motion.article>
  );
}

function CaseStudyCard({ project }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm transform transition-all border border-white/10"
    >
      <div className="h-44 sm:h-52 md:h-40 lg:h-48 flex-shrink-0">
        {/* Placeholder gradient — remplacer par <img src="..." alt="..." loading="lazy" decoding="async" /> */}
        <div className="w-full h-full bg-gradient-to-br from-[#2c4656] to-[#23ad94] flex items-end p-4">
          <span className="text-white font-semibold opacity-90">Image placeholder</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h4 className="text-lg font-semibold text-[#0f1724]">{project.title}</h4>
        <p className="mt-2 text-sm text-[#0f1724]/80 flex-1">{project.desc}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 bg-[#2c4656]/8 text-[#2c4656] rounded-full">
                {t}
              </span>
            ))}
          </div>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-medium underline underline-offset-2 text-[#2c4656] hover:text-[#18424a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#23ad94]/60"
            aria-label={`Voir le projet ${project.title}`}
          >
            Voir le projet →
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function TestimonialCard({ t }) {
  return (
    <motion.figure
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      className="shrink-0 w-[90%] snap-center bg-white rounded-2xl p-6 shadow-sm transition"
    >
      <blockquote className="text-sm text-[#0f1724]/90">“{t.quote}”</blockquote>
      <figcaption className="mt-4 text-xs text-[#0f1724]/70">
        <div className="font-semibold">{t.name}</div>
        <div className="text-[12px]">{t.role}</div>
      </figcaption>
    </motion.figure>
  );
}

/* ---------------------------
   Composant principal
   --------------------------- */

export default function Home() {
  const contactFormRef = useRef(null);

  function handleContactSubmit(e) {
    e.preventDefault();
    const form = contactFormRef.current;
    if (!form) return;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };
    // Faux envoi — TODO: remplacer par API réelle
    // eslint-disable-next-line no-console
    console.log('Contact form submitted:', data);
    // Retour visuel simple
    // eslint-disable-next-line no-alert
    alert('Merci — message enregistré en local (TODO: connecter l’API).');
    form.reset();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf9] text-[#0f1724]">
      <FrontHeader />

      <main className="flex-grow">
        {/* HERO */}
        <motion.header
          id="hero"
          className="overflow-hidden relative min-h-[72vh] md:min-h-[78vh] flex items-center"
          role="banner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerStagger}
        >
          {/* Background gradient + mesh blobs */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(135deg, rgba(44,70,86,0.95) 0%, rgba(35,173,148,0.95) 100%)',
            }}
          />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-white/6 blur-3xl mix-blend-overlay" />
            <div className="absolute right-[-60px] bottom-[-40px] w-96 h-96 rounded-full bg-white/4 blur-2xl mix-blend-overlay" />
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
              <defs>
                <pattern id="p2" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0 L0 40" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#p2)" />
            </svg>
          </div>

          <motion.div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center" variants={fadeUp}>
            <motion.h1
              className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
              variants={fadeUp}
            >
              EnmalaBS — Créons l'expérience digitale qui vous distingue
            </motion.h1>

            <motion.p className="mt-4 text-white/90 max-w-2xl mx-auto text-base sm:text-lg" variants={fadeIn}>
              WebStudio • CreativeLabs • DevStudio — design stratégique, engineering robuste, et lancement
              impactant.
            </motion.p>

            <motion.div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center" variants={fadeIn}>
              <MotionButtonPrimary href="#services">Nos services</MotionButtonPrimary>
              <MotionButtonOutline href="#contact">Contactez-nous</MotionButtonOutline>
            </motion.div>

            <motion.div className="mt-10 flex justify-center gap-4 text-sm text-white/80" variants={fadeIn}>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full">
                <strong className="font-semibold">3</strong>
                pôles complémentaires
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full">
                <strong className="font-semibold">+ projets</strong>
                livrés avec soin
              </span>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Diagonal Separator */}
        <div className="relative">
          <svg className="w-full block" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0 48 L1440 0 L1440 48 Z" fill="#f7faf9" />
          </svg>
        </div>

        {/* SERVICES */}
        <section id="services" className="py-16 bg-[#f7faf9]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-[#0f1724]">Nos activités</h2>
              <p className="mt-2 text-sm text-[#0f1724]/70 max-w-2xl">
                Trois pôles experts pour couvrir toute la chaîne : stratégie, design, développement.
              </p>
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {SERVICES.map((s) => (
                <ServiceCard key={s.title} icon={s.icon} title={s.title} desc={s.desc} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* SVG Diagonal */}
        <div className="relative -mt-8">
          <svg className="w-full block" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0 L1440 48 L0 48 Z" fill="white" />
          </svg>
        </div>

        {/* CASE STUDIES */}
        <section id="etudes-de-cas" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-[#0f1724]">Études de cas</h2>
              <p className="mt-2 text-sm text-[#0f1724]/70 max-w-2xl">
                Quelques projets récents — résultats et approche pragmatique.
              </p>
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {CASE_STUDIES.map((p) => (
                <CaseStudyCard key={p.id} project={p} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Diagonal */}
        <div className="relative">
          <svg className="w-full block" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0 48 L1440 0 L1440 48 Z" fill="#f7faf9" />
          </svg>
        </div>

        {/* PROCESS / METHODOLOGY */}
        <section id="process" className="py-16 bg-[#f7faf9]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-[#0f1724]">Notre processus</h2>
              <p className="mt-2 text-sm text-[#0f1724]/70 max-w-2xl">
                Méthodologie claire, itérations rapides et livrables concrets à chaque étape.
              </p>
            </motion.div>

            <motion.ol
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.li variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2c4656] text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="text-lg font-semibold">Découverte</h3>
                </div>
                <p className="mt-3 text-sm text-[#0f1724]/80">
                  Atelier besoins, audit existant et définition des objectifs.
                </p>
                <div className="mt-3 text-2xl" aria-hidden>🔎</div>
              </motion.li>

              <motion.li variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2c4656] text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="text-lg font-semibold">Design</h3>
                </div>
                <p className="mt-3 text-sm text-[#0f1724]/80">Maquettes, prototypes et tests utilisateurs rapides.</p>
                <div className="mt-3 text-2xl" aria-hidden>🎨</div>
              </motion.li>

              <motion.li variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2c4656] text-white flex items-center justify-center font-bold">3</div>
                  <h3 className="text-lg font-semibold">Développement</h3>
                </div>
                <p className="mt-3 text-sm text-[#0f1724]/80">Architecture solide, code maintenable et intégrations API.</p>
                <div className="mt-3 text-2xl" aria-hidden>💻</div>
              </motion.li>

              <motion.li variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2c4656] text-white flex items-center justify-center font-bold">4</div>
                  <h3 className="text-lg font-semibold">Lancement</h3>
                </div>
                <p className="mt-3 text-sm text-[#0f1724]/80">Déploiement, monitoring et suivi post-lancement.</p>
                <div className="mt-3 text-2xl" aria-hidden>🚀</div>
              </motion.li>
            </motion.ol>
          </div>
        </section>

        {/* Diagonal */}
        <div className="relative -mt-8">
          <svg className="w-full block" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0 L1440 48 L0 48 Z" fill="white" />
          </svg>
        </div>

        {/* TESTIMONIALS */}
        <section id="temoignages" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-[#0f1724]">Témoignages clients</h2>
              <p className="mt-2 text-sm text-[#0f1724]/70 max-w-2xl">
                Ce que disent nos partenaires après les premières livraisons.
              </p>
            </motion.div>

            <div className="mt-8 relative">
              <div
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 py-4"
                role="list"
                aria-label="Témoignages clients"
              >
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} role="listitem">
                    <TestimonialCard t={t} />
                  </div>
                ))}
              </div>

              <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-[#2c4656]/6 rounded-full p-2">
                <span className="text-xs text-[#2c4656]">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-16 bg-[#f7faf9]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-[#0f1724]">Contact / Devis rapide</h2>
                <p className="mt-2 text-sm text-[#0f1724]/70">
                  Parlez-nous de votre projet — nous revenons avec une proposition claire.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#0f1724]/80">
                  <li>📍 Basés à Abidjan — intervention locale & à distance</li>
                  <li>⏱️ Réponse typique : 48h ouvrées</li>
                  <li>🔒 Confidentialité respectée</li>
                </ul>
              </motion.div>

              <motion.form
                ref={contactFormRef}
                onSubmit={handleContactSubmit}
                className="bg-white p-6 rounded-2xl shadow-sm border border-white/10"
                aria-label="Formulaire de contact rapide"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col">
                    <span className="text-xs font-medium text-[#0f1724]/80">Nom</span>
                    <input
                      name="name"
                      type="text"
                      required
                      className="mt-2 p-3 rounded-md border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]/60"
                      placeholder="Votre nom"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs font-medium text-[#0f1724]/80">Email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-2 p-3 rounded-md border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]/60"
                      placeholder="contact@exemple.com"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs font-medium text-[#0f1724]/80">Message</span>
                    <textarea
                      name="message"
                      required
                      rows="4"
                      className="mt-2 p-3 rounded-md border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]/60"
                      placeholder="Décrivez brièvement votre projet, budget approximatif, délais..."
                    />
                  </label>

                  <div className="flex items-center justify-between gap-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      className="px-5 py-3 rounded-lg bg-[#2c4656] text-white font-semibold hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#23ad94]/60 transition"
                    >
                      Envoyer le message
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO: ouvrir calendrier de RDV (intégration future).');
                      }}
                      whileHover={{ scale: 1.01 }}
                      className="px-4 py-2 rounded-lg border border-[#2c4656] text-[#2c4656] hover:bg-[#2c4656]/6 transition"
                    >
                      Demander RDV
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            </div>

            <p className="text-xs text-[#0f1724]/60 mt-6">
              {/* TODO: remplacer par coordonnées réelles */}
              Adresse • Téléphone • Email — informations publiques et mentions légales à ajouter.
            </p>
          </div>
        </section>
      </main>

      <FrontFooter />
    </div>
  );
}
