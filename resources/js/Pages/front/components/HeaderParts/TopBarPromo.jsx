import React from 'react';

const TopBarPromo = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center py-2 text-sm font-medium">
    {/* Example promo, replace with dynamic content if needed */}
    Free Shipping Over $100 & Free Returns | Hotline: <a href="tel:+88 01924224778" className="underline">+88 01924224778</a>
  </div>
);

export default React.memo(TopBarPromo);