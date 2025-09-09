// /resources/js/Pages/front/components/NavigationPrimaire.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import ActiveLink from "./ActiveLink"; // ton composant

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

const NavigationPrimaire = ({ categories }) => {
  // ---- états
  const [desktopOpenId, setDesktopOpenId] = useState(null); // id de catégorie ouverte (desktop)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // menu burger
  const [mobileExpanded, setMobileExpanded] = useState(() => new Set()); // ids ouverts en mobile

  const navRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // lg

  // Fermer le mega menu quand on clique dehors (desktop)
  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current?.contains(e.target)) {
        setDesktopOpenId(null);
      }
    }
    if (isDesktop) {
      document.addEventListener("click", onDocClick);
    }
    return () => document.removeEventListener("click", onDocClick);
  }, [isDesktop]);

  // Réinitialiser les états quand on change de breakpoint
  useEffect(() => {
    setDesktopOpenId(null);
    setMobileExpanded(new Set());
  }, [isDesktop]);

  // ----------------------
  // Handlers Desktop
  // ----------------------
  const openDesktop = (id) => setDesktopOpenId(id);
  const closeDesktop = () => setDesktopOpenId(null);

  const handleDesktopKey = (e, id) => {
    // Accessibilité clavier : Enter/Espace ouvre, Escape ferme
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDesktopOpenId((prev) => (prev === id ? null : id));
    }
    if (e.key === "Escape") {
      closeDesktop();
    }
  };

  // ----------------------
  // Handlers Mobile
  // ----------------------
  const toggleMobileCategory = (id) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ----------------------
  // Mémos
  // ----------------------
  const mainLinks = useMemo(
    () => [
      { href: "/all/product", label: "Boutique" },
      { href: "/all/brands", label: "Marques" },
      { href: "/promotions", label: "Promotions" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  return (
    <div ref={navRef} className="relative">
      {/* BARRE PRINCIPALE */}
      <div className="flex items-center justify-between gap-4 py-3">
        {/* Left: liens principaux (desktop) */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-6">
          {/* Catégories (déclencheur mega menu) */}
          <div
            className="relative"
            onMouseEnter={() => openDesktop("categories")}
            onMouseLeave={closeDesktop}
          >
            <button
              type="button"
              onKeyDown={(e) => handleDesktopKey(e, "categories")}
              aria-haspopup="true"
              aria-expanded={desktopOpenId === "categories"}
              className="font-semibold text-gray-900 hover:text-[#8c6c3c] inline-flex items-center gap-2 transition-colors"
            >
              Catégories
              <svg
                className={classNames(
                  "h-4 w-4 transition-transform duration-200",
                  desktopOpenId === "categories" ? "rotate-180" : ""
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
              </svg>
            </button>

            {/* MEGA MENU (desktop) */}
            <div
              role="menu"
              aria-label="Mega menu catégories"
              className={classNames(
                "absolute left-0 top-full w-[900px] xl:w-[1000px] z-40",
                "transition-all duration-200",
                desktopOpenId === "categories"
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              )}
            >
              <div className="mt-3 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                <div className="grid grid-cols-12 gap-0">
                  {/* Colonne image/banner */}
                  <div className="col-span-4 relative hidden xl:block">
                    {/* Astuce : tu peux faire varier l’image selon la catégorie survolée si tu veux */}
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${categories[0]?.image || "/images/placeholder-wide.jpg"})`,
                      }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-semibold">Explore nos catégories</h3>
                      <p className="text-sm opacity-90">
                        Trouve rapidement ce qu’il te faut parmi nos sélections.
                      </p>
                    </div>
                  </div>

                  {/* Colonnes de catégories */}
                  <div className="col-span-12 xl:col-span-8 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat.id} className="group">
                          <Link
                            href={`/category/${cat.slug || cat.id}`}
                            className="block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div
                              className="h-28 w-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${cat.image || "/images/placeholder.jpg"})`,
                              }}
                              aria-hidden="true"
                            />
                          </Link>
                          <div className="mt-3">
                            <div className="flex items-start justify-between">
                              <ActiveLink
                                href={`/category/${cat.slug || cat.id}`}
                                className="font-semibold text-gray-900 group-hover:text-[#8c6c3c] transition-colors"
                              >
                                {cat.name}
                              </ActiveLink>
                              <ActiveLink
                                href={`/category/${cat.slug || cat.id}`}
                                className="text-sm text-[#8c6c3c] hover:underline whitespace-nowrap"
                              >
                                Voir tout →
                              </ActiveLink>
                            </div>
                            {cat.description && (
                              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                            )}
                            {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                              <ul className="mt-3 space-y-1">
                                {cat.subcategories.slice(0, 6).map((sub) => (
                                  <li key={sub.id}>
                                    <ActiveLink
                                      href={`/category/${cat.slug || cat.id}/${sub.slug || sub.id}`}
                                      className="text-sm text-gray-700 hover:text-[#8c6c3c] transition-colors"
                                    >
                                      {sub.name}
                                    </ActiveLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /MEGA MENU */}
          </div>
          {mainLinks.map((l) => (
            <ActiveLink
              key={l.href}
              href={l.href}
              className="font-medium text-gray-800 hover:text-white transition-colors"
            >
              {l.label}
            </ActiveLink>
          ))}
        </nav>

        {/* Right: actions (exemple) */}
        <div className="ml-auto flex items-center gap-3">
          <ActiveLink
            href="/account"
            className="text-sm font-medium text-gray-700 hover:text-white"
          >
            Mon compte
          </ActiveLink>
          <ActiveLink
            href="/cart"
            className="relative text-sm font-medium text-gray-700 hover:text-white"
          >
            Panier
            {/* Badge exemple */}
            {/* <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 rounded-full bg-[#8c6c3c] text-white text-xs flex items-center justify-center">2</span> */}
          </ActiveLink>

          {/* Burger (mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* NAV MOBILE */}
      <div
        className={classNames(
          "lg:hidden overflow-hidden rounded-2xl border border-gray-100 shadow-sm",
          "transition-[max-height,opacity] duration-300",
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav aria-label="Navigation mobile" className="bg-white">
          {/* Liens principaux */}
          <div className="px-4 py-3 border-b border-gray-100">
            <ul className="space-y-2">
              {mainLinks.map((l) => (
                <li key={l.href}>
                  <ActiveLink
                    href={l.href}
                    className="block rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-50"
                  >
                    {l.label}
                  </ActiveLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Accordéon Catégories */}
          <div className="px-2 py-3">
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Catégories
            </h3>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
              {categories.map((cat) => {
                const opened = mobileExpanded.has(cat.id);
                return (
                  <li key={cat.id} className="p-2">
                    <button
                      type="button"
                      onClick={() => toggleMobileCategory(cat.id)}
                      aria-expanded={opened}
                      className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition"
                    >
                      <div
                        className="h-10 w-10 flex-shrink-0 rounded-lg bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${cat.image || "/images/placeholder.jpg"})`,
                        }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 text-left">
                        <span className="block font-medium text-gray-900">{cat.name}</span>
                        {cat.description && (
                          <span className="text-xs text-gray-500">{cat.description}</span>
                        )}
                      </div>
                      <svg
                        className={classNames(
                          "h-4 w-4 transition-transform",
                          opened ? "rotate-180" : ""
                        )}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                      </svg>
                    </button>

                    {/* Sous-catégories */}
                    <div
                      className={classNames(
                        "grid transition-[grid-template-rows] duration-300",
                        opened ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-2 pl-12 pr-2 pb-2">
                          <div className="flex items-center justify-between mb-2">
                            <ActiveLink
                              href={`/category/${cat.slug || cat.id}`}
                              className="text-sm font-semibold text-[#8c6c3c] hover:underline"
                            >
                              Voir tout →
                            </ActiveLink>
                          </div>
                          <ul className="space-y-1">
                            {(cat.subcategories || []).map((sub) => (
                              <li key={sub.id}>
                                <ActiveLink
                                  href={`/category/${cat.slug || cat.id}/${sub.slug || sub.id}`}
                                  className="block rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {sub.name}
                                </ActiveLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

// ----------------------
// Hook media query (vanilla)
// ----------------------
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    try {
      mql.addEventListener("change", onChange);
    } catch {
      // Safari
      mql.addListener(onChange);
    }
    return () => {
      try {
        mql.removeEventListener("change", onChange);
      } catch {
        mql.removeListener(onChange);
      }
    };
  }, [query]);
  return matches;
}

export default React.memo(NavigationPrimaire);
