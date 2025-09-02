// /resources/js/Pages/front/Contact.jsx
import React, { useRef } from 'react';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';

/* ---------- FAQ data (tableau en haut du fichier) ---------- */
const FAQ_ITEMS = [
  {
    q: "Quels types de projets prenez-vous en charge ?",
    a: "Nous travaillons sur les sites vitrines, web apps, e-commerce, branding et intégrations API. Chaque projet est évalué pour définir l'équipe et le planning adaptés.",
  },
  {
    q: "Quel est votre délai moyen de réponse ?",
    a: "Nous répondons sous 48 heures ouvrées pour une première prise de contact et évaluation initiale.",
  },
  {
    q: "Proposez-vous une phase de maintenance après livraison ?",
    a: "Oui. Nous proposons des packs de maintenance et support post-lancement adaptés à vos besoins.",
  },
  {
    q: "Travaillez-vous avec des clients internationaux ?",
    a: "Absolument — nous accompagnons des clients locaux et internationaux, en français et en anglais si nécessaire.",
  },
];

function IconText({ icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl ring-1 ring-white/8">
        <span aria-hidden="true">{icon}</span>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <details className="bg-white/6 rounded-lg p-4 open:shadow-md">
      <summary className="cursor-pointer font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]">
        {q}
      </summary>
      <div className="mt-2 text-sm text-white/80">{a}</div>
    </details>
  );
}

export default function Contact() {
  const formRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };
    // TODO: Remplacer par un appel API réel
    // eslint-disable-next-line no-console
    console.log('Contact form (simulation):', data);
    // simple feedback accessible
    try {
      form.reset();
      // petit indicateur visuel simple
      alert('Merci — votre message a bien été enregistré (simulation).');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#071724_0%,#041018_100%)] text-white">
      <FrontHeader />

      <main className="flex-grow">
        {/* HERO */}
        <section
          id="hero"
          aria-labelledby="contact-hero-title"
          className="relative pt-20 pb-12"
          style={{ background: 'linear-gradient(135deg,#2c4656 0%,#23ad94 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-20 -top-24 w-[420px] h-[420px] blur-3xl opacity-30">
              <svg viewBox="0 0 600 600" className="w-full h-full" aria-hidden="true">
                <defs>
                  <linearGradient id="gHero" x1="0" x2="1">
                    <stop offset="0%" stopColor="#2c4656" />
                    <stop offset="100%" stopColor="#23ad94" />
                  </linearGradient>
                </defs>
                <path fill="url(#gHero)" opacity="0.08" d="M421,307Q412,364,359,400Q306,436,249,430Q192,424,140,395Q88,366,82,307Q76,248,115,206Q154,164,205,132Q256,100,309,118Q362,136,410,169Q458,202,430,253Q402,304,421,307Z" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h1 id="contact-hero-title" className="text-4xl sm:text-5xl font-extrabold">
              Contactez-nous
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Parlons de votre projet — simple, rapide et sans engagement. Racontez-nous votre besoin.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="#form"
                className="px-6 py-3 rounded-lg bg-white text-[#2c4656] font-semibold shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
              >
                Envoyer un message
              </a>
            </div>
          </div>
        </section>

        {/* Coordonnées directes */}
        <section id="coordonnees" aria-labelledby="coord-title" className="py-12 bg-[#041018]">
          <div className="max-w-6xl mx-auto px-6">
            <header className="mb-6 text-center">
              <h2 id="coord-title" className="text-2xl font-bold">Coordonnées</h2>
              <p className="mt-2 text-white/80">Contactez-nous directement par téléphone ou email, ou utilisez le formulaire ci-dessous.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/6 rounded-2xl ring-1 ring-white/6">
                <IconText icon="📍">
                  <div className="font-semibold">Adresse</div>
                  <div className="text-sm text-white/80">Abidjan, Côte d'Ivoire (placeholder)</div>
                </IconText>
              </div>

              <div className="p-6 bg-white/6 rounded-2xl ring-1 ring-white/6">
                <IconText icon="📞">
                  <div className="font-semibold">Téléphone</div>
                  <div className="text-sm text-white/80">
                    <a href="tel:+225000000000" className="hover:underline">+225 00 00 00 000</a>
                  </div>
                </IconText>
              </div>

              <div className="p-6 bg-white/6 rounded-2xl ring-1 ring-white/6">
                <IconText icon="✉️">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-white/80">
                    <a href="mailto:contact@enmalabs.com" className="hover:underline">contact@enmalabs.com</a>
                  </div>
                </IconText>
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire */}
        <section id="form" aria-labelledby="form-title" className="py-16 bg-[#071724]">
          <div className="max-w-4xl mx-auto px-6">
            <header className="mb-6 text-center">
              <h2 id="form-title" className="text-2xl font-bold">Formulaire de contact</h2>
              <p className="mt-2 text-white/80">Remplissez ce formulaire et nous vous répondrons sous 48h ouvrées.</p>
            </header>

            <form
              ref={formRef => { formRef && (formRef.current = formRef); }}
              onSubmit={handleSubmit}
              className="bg-white/6 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-white/6"
              aria-label="Formulaire de contact"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90">Nom</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Votre nom complet"
                    className="mt-2 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="contact@exemple.com"
                    className="mt-2 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-white/90">Sujet</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Objet de votre demande"
                    className="mt-2 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-white/90">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    required
                    placeholder="Décrivez brièvement votre projet, vos objectifs et vos contraintes."
                    className="mt-2 block w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23ad94] resize-vertical"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between mt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
                  >
                    Envoyer le message
                  </button>

                  <p className="text-sm text-white/70">
                    Nous répondons généralement sous <strong>48h ouvrées</strong>.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="py-16 bg-[#041018]">
          <div className="max-w-4xl mx-auto px-6">
            <header className="mb-6 text-center">
              <h2 id="faq-title" className="text-2xl font-bold">Questions fréquentes</h2>
              <p className="mt-2 text-white/80">Vous avez une question ? voici les réponses aux plus courantes.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
              {FAQ_ITEMS.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* Carte / Localisation */}
        <section id="map" className="py-16 bg-[#071724]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold">Où nous trouver</h3>
              <p className="mt-2 text-white/80">Nous sommes basés à Abidjan — venez nous rencontrer sur rendez-vous.</p>
              <p className="mt-4 text-sm text-white/70">Adresse (placeholder): Quartier, Ville, Pays</p>
              <p className="mt-2 text-sm text-white/70">Horaires : Lun-Ven 9:00 — 17:00</p>
            </div>

            <div className="rounded-2xl overflow-hidden ring-1 ring-white/6 bg-white/6">
              {/* Placeholder carte (lazy) */}
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                  `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%' height='100%' fill='#2c4656'/><text x='50%' y='50%' fill='#ffffff99' font-size='24' text-anchor='middle' dominant-baseline='middle'>Carte / Placeholder — TODO: remplacer par une vraie carte</text></svg>`
                )}`}
                alt="Carte - emplacement (placeholder)"
                loading="lazy"
                decoding="async"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section id="cta" className="py-16 bg-gradient-to-r from-[#23ad94] to-[#2c4656] text-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold">Prêt à travailler avec nous ?</h3>
            <p className="mt-2 text-white/90">Parlons de votre projet — rapide, simple et clair.</p>
            <div className="mt-6">
              <a
                href="#form"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-[#2c4656] font-semibold hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40 transition"
              >
                Contactez-nous
              </a>
            </div>
          </div>
        </section>
      </main>

      <FrontFooter />
    </div>
  );
}