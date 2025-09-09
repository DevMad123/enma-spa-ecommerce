// /resources/js/Pages/front/Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import FrontHeader from '@/Pages/front/layouts/Header';
import FrontFooter from '@/Pages/front/layouts/Footer';
import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import productImage from '../../../assets/front/imgs/product-default.jpg';
import catImage from '../../../assets/front/imgs/cat-default.jpg';
import defaultUserImg from '../../../assets/front/imgs/default-user.png';
import heraSneakerImg from '../../../assets/front/imgs/hero-sneaker.png';

// Palette
const COLORS = {
  gold: '#a68e55',
  brown: '#8c6c3c',
  black: '#040404',
  accent: '#23ad94',
  bg: 'linear-gradient(180deg,#f7f3ee_0%,#e6d9c2_100%)',
};

// Données fictives
const PRODUCTS = [
  {
    id: 1,
    name: 'Sneakers Gold Edition',
    image: productImage,
    price: 129.99,
    description: 'Un style premium, une finition dorée et un confort inégalé.',
    bestSeller: true,
    newArrival: true,
    category: 'Nouveautés',
  },
  {
    id: 2,
    name: 'Urban Brown High',
    image: productImage,
    price: 109.99,
    description: 'La basket urbaine chic, parfaite pour toutes vos sorties.',
    bestSeller: true,
    newArrival: false,
    category: 'Best Sellers',
  },
  {
    id: 3,
    name: 'Classic Black Low',
    image: productImage,
    price: 99.99,
    description: 'Intemporelle, élégante et ultra résistante.',
    bestSeller: false,
    newArrival: true,
    category: 'Classiques',
  },
  {
    id: 4,
    name: 'Street Art Limited',
    image: productImage,
    price: 149.99,
    description: 'Édition limitée, design exclusif pour les passionnés.',
    bestSeller: false,
    newArrival: false,
    category: 'Promotions',
  },
  {
    id: 5,
    name: 'Urban Brown High',
    image: productImage,
    price: 109.99,
    description: 'La basket urbaine chic, parfaite pour toutes vos sorties.',
    bestSeller: true,
    newArrival: true,
    category: 'Nouveautés',
  },
];

const CATEGORIES = [
  { id: 'cat1', name: 'Nouveautés', image: catImage },
  { id: 'cat2', name: 'Best Sellers', image: catImage },
  { id: 'cat3', name: 'Promotions', image: catImage },
  { id: 'cat4', name: 'Classiques', image: catImage },
];

const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Aïssata Traoré',
    quote: "Livraison rapide, produit conforme et super confortable !",
    avatar: defaultUserImg,
  },
  {
    id: 't2',
    name: 'Koffi Mensah',
    quote: "Le service client est au top, je recommande à 100%.",
    avatar: defaultUserImg,
  },
  {
    id: 't3',
    name: 'Marie Koné',
    quote: "Des baskets stylées et une expérience d’achat parfaite.",
    avatar: defaultUserImg,
  },
];

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

// Composants e-commerce

function HeroBanner() {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-16 min-h-[70vh] flex items-center justify-center"
      style={{
        background: COLORS.bg,
        backgroundImage: `url(${heraSneakerImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#a68e55]/70 via-[#8c6c3c]/60 to-[#040404]/80 z-0 pointer-events-none"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <motion.h1
              variants={fadeIn}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md text-white"
            >
              Découvrez nos meilleures offres sneakers
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg sm:text-xl text-white/90 max-w-xl"
            >
              Des modèles exclusifs, une qualité premium et des prix imbattables. Profitez de la livraison offerte dès 100€ d’achat !
            </motion.p>
            <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="#featured"
                className="px-6 py-3 rounded-full bg-[#a68e55] text-white font-bold shadow hover:bg-[#8c6c3c] transition"
              >
                Voir les nouveautés
              </Link>
              <Link
                href="#categories"
                className="px-6 py-3 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition"
              >
                Parcourir les catégories
              </Link>
            </motion.div>
          </div>
          <motion.div variants={fadeIn} className="flex justify-center md:justify-end">
            <img
              src={heraSneakerImg}
              alt="Sneaker Hero"
              className="max-w-md w-full drop-shadow-xl rounded-xl"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section id="categories" className="py-14 bg-[#f7f3ee]">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#8c6c3c]"
          >
            Nos catégories phares
          </motion.h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.article
              key={cat.id}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="group bg-white rounded-2xl p-4 shadow hover:shadow-lg transition hover:-translate-y-1"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-28 object-cover rounded-xl mb-3"
                loading="lazy"
              />
              <h3 className="text-lg font-semibold text-[#a68e55]">{cat.name}</h3>
              <Link
                href={`/category/${cat.id}`}
                className="mt-3 inline-block text-sm font-medium px-4 py-2 rounded-full bg-[#a68e55] text-white hover:bg-[#8c6c3c] transition"
              >
                Découvrir
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, i }) {
  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={i}
      className="group bg-white rounded-2xl p-5 shadow hover:shadow-xl hover:-translate-y-1 transition flex flex-col"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-[#a68e55] text-white text-xs px-2 py-0.5 rounded-full shadow">
          Nouveau
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#8c6c3c]">{product.name}</h3>
      <p className="mt-2 text-sm text-[#040404]/80 flex-1">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xl font-bold text-[#a68e55]">{product.price.toFixed(2)} €</span>
        <button
          className="px-4 py-2 rounded-full bg-[#8c6c3c] text-white font-semibold shadow hover:bg-[#a68e55] transition"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          Ajouter au panier
        </button>
      </div>
      <Link
        href={`/product/${product.id}`}
        className="mt-2 text-sm text-[#8c6c3c] hover:underline"
      >
        Voir détails
      </Link>
    </motion.article>
  );
}

// function FeaturedProducts() {
//   return (
//     <section id="featured" className="py-16 bg-[#f7f3ee]">
//       <div className="max-w-6xl mx-auto px-6">
//         <header className="text-center mb-8">
//           <motion.h2
//             variants={fadeIn}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="text-2xl font-bold text-[#a68e55]"
//           >
//             Nos produits phares
//           </motion.h2>
//         </header>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//           {PRODUCTS.map((p, i) => <ProductCard key={p.id} product={p} i={i} />)}
//         </div>
//       </div>
//     </section>
//   );
// }
function FeaturedProducts() {
  return (
    <section id="featured" className="py-16 bg-[#f7f3ee]">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#a68e55]"
          >
            Nos produits phares
          </motion.h2>
        </header>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {PRODUCTS.map((p, i) => (
            <SwiperSlide key={p.id}>
              <ProductCard product={p} i={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="temoignages" className="py-16 bg-[#8c6c3c]/10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-2xl font-bold text-[#8c6c3c] mb-6"
        >
          Ils nous font confiance
        </motion.h2>
        <div className="overflow-x-auto no-scrollbar py-3 -mx-2 px-2 snap-x snap-mandatory flex gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.id}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              tabIndex="0"
              className="min-w-[260px] max-w-xs shrink-0 bg-white rounded-2xl p-5 shadow ring-1 ring-[#a68e55]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a68e55]/40 snap-start"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#a68e55]"
                  loading="lazy"
                />
                <div className="font-semibold text-[#8c6c3c]">{t.name}</div>
              </div>
              <blockquote className="text-sm text-[#040404]/90">“{t.quote}”</blockquote>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// Nouveaux composants

function NewArrivals() {
  const arrivals = PRODUCTS.filter(p => p.newArrival);
  return (
    <section id="new-arrivals" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#a68e55]"
          >
            Nouveautés
          </motion.h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {arrivals.map((p, i) => <ProductCard key={p.id} product={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function BestSellers() {
  const bests = PRODUCTS.filter(p => p.bestSeller);
  return (
    <section id="best-sellers" className="py-14 bg-[#f7f3ee]">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#8c6c3c]"
          >
            Best Sellers
          </motion.h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {bests.map((p, i) => <ProductCard key={p.id} product={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function CategoryGallery() {
  return (
    <section id="category-gallery" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#a68e55]"
          >
            Explorez nos univers
          </motion.h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="group relative rounded-2xl overflow-hidden shadow hover:shadow-lg transition hover:-translate-y-1"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-36 object-cover group-hover:scale-105 transition"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040404]/70 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold text-white drop-shadow">{cat.name}</h3>
                <Link
                  href={`/category/${cat.id}`}
                  className="mt-2 inline-block text-xs font-medium px-3 py-1 rounded-full bg-[#a68e55] text-white hover:bg-[#8c6c3c] transition"
                >
                  Découvrir
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCarousel() {
  // Pour la démo, slider horizontal simple (pas de lib externe)
  const featured = PRODUCTS;
  return (
    <section id="carousel" className="py-14 bg-[#f7f3ee]">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl font-bold text-[#a68e55]"
          >
            Sélection exclusive
          </motion.h2>
        </header>
        {/* <div className="overflow-x-auto no-scrollbar flex gap-8 py-3 -mx-2 px-2 snap-x snap-mandatory"> */}
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {featured.map((p, i) => (
            // <motion.div
            //   key={p.id}
            //   variants={fadeIn}
            //   initial="hidden"
            //   whileInView="visible"
            //   viewport={{ once: true }}
            //   custom={i}
            //   tabIndex="0"
            //   className="min-w-[260px] max-w-xs shrink-0 snap-start"
            // >
            <SwiperSlide key={p.id}>
              <ProductCard product={p} i={i} />
              </SwiperSlide>
            // </motion.div>
          ))}
          </Swiper>
        {/* </div> */}
      </div>
    </section>
  );
}

function NewsletterSignup() {
  return (
    <section id="newsletter" className="py-14 bg-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-2xl font-bold text-[#8c6c3c] mb-4"
        >
          Restez informé des nouveautés et promos !
        </motion.h2>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6 text-[#040404]/80"
        >
          Inscrivez-vous à notre newsletter et recevez nos offres exclusives.
        </motion.p>
        <form className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <input
            type="email"
            placeholder="Votre email"
            className="px-4 py-3 rounded-full border border-[#a68e55]/40 focus:border-[#a68e55] focus:outline-none w-full sm:w-auto"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[#a68e55] text-white font-bold shadow hover:bg-[#8c6c3c] transition"
          >
            S’inscrire
          </button>
        </form>
      </div>
    </section>
  );
}

function TrustBadges() {
  return (
    <section id="trust-badges" className="py-10 bg-[#f7f3ee]">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8">
        <div className="flex flex-col items-center">
          <svg width="40" height="40" fill={COLORS.gold} viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
          <span className="mt-2 text-sm font-semibold text-[#8c6c3c]">Livraison rapide</span>
        </div>
        <div className="flex flex-col items-center">
          <svg width="40" height="40" fill={COLORS.gold} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span className="mt-2 text-sm font-semibold text-[#8c6c3c]">Paiement sécurisé</span>
        </div>
        <div className="flex flex-col items-center">
          <svg width="40" height="40" fill={COLORS.gold} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8"/></svg>
          <span className="mt-2 text-sm font-semibold text-[#8c6c3c]">Retours gratuits</span>
        </div>
      </div>
    </section>
  );
}

// Page principale Home
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f3ee] text-[#040404]">
      <FrontHeader />
      <main className="flex-grow">
        <HeroBanner />
        <TrustBadges />
        <CategorySection />
        <CategoryGallery />
        <FeaturedProducts />
        <ProductCarousel />
        <NewArrivals />
        <BestSellers />
        <Testimonials />
        <NewsletterSignup />
      </main>
      <FrontFooter />
    </div>
  );
}
