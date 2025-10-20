import React, { useEffect, useMemo, useRef, useState } from 'react';

const defaultItems = [
  { icon: '💬', text: 'Service client dédié et disponible' },
  { icon: '🏅', text: 'Produits authentiques et jamais portés' },
  { icon: '💳', text: 'Paiement en 2, 3 ou 4 fois' },
  { icon: '🚚', text: 'Livraison rapide et suivie' },
  { icon: '🔒', text: 'Paiement 100% sécurisé' },
  { icon: '📦', text: 'Retours faciles sous 14 jours' },
];

export default function FeaturesCarousel({ items }) {
  const features = useMemo(() => (Array.isArray(items) && items.length ? items : defaultItems), [items]);
  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const pausedUntilRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let intervalId;
    const step = () => {
      if (!el) return;
      if (Date.now() < pausedUntilRef.current) return; // pause auto-scroll during user interaction
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft + 10 >= maxScroll) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 240, behavior: 'smooth' });
      }
    };
    intervalId = setInterval(step, 3500);
    return () => clearInterval(intervalId);
  }, []);

  // Wheel => horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        pausedUntilRef.current = Date.now() + 3000;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = (e) => {
    const el = containerRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    startScrollLeft.current = el.scrollLeft;
    setDragging(true);
    pausedUntilRef.current = Date.now() + 3000;
  };

  const onMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    isDown.current = false;
    setDragging(false);
  };

  const onMouseUp = () => {
    const el = containerRef.current;
    if (!el) return;
    isDown.current = false;
    setDragging(false);
  };

  const onMouseMove = (e) => {
    const el = containerRef.current;
    if (!el || !isDown.current) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX.current;
    el.scrollLeft = startScrollLeft.current - walk;
    pausedUntilRef.current = Date.now() + 3000;
  };

  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Inject small CSS to hide scrollbar cross-browser */}
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
        <div
          ref={containerRef}
          className={`flex gap-4 overflow-x-auto no-scrollbar snap-x ${dragging ? 'snap-none' : 'snap-proximity'} cursor-grab active:cursor-grabbing`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              className="min-w-[260px] snap-start flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
                <span aria-hidden>{f.icon}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 leading-snug">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
