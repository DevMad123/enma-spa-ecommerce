import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';

const CartDropdown = ({ cartCount, cartItems, basepath, mobile }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Open on hover/click (desktop), click only (mobile)
  const handleMouseEnter = () => !mobile && setOpen(true);
  const handleMouseLeave = () => !mobile && setOpen(false);
  const handleClick = () => setOpen(!open);

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={open}
      onKeyDown={handleKeyDown}
    >
      <button
        className="flex items-center"
        aria-label="Cart"
        onClick={handleClick}
      >
        <svg width="24" height="24" aria-hidden="true" focusable="false" className="text-blue-600"><use href="#icon-cart" /></svg>
        <span className="ml-1 font-semibold">{cartCount}</span>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg z-30 p-4"
          role="menu"
          aria-label="Cart items"
        >
          <ul>
            {cartItems.length === 0 ? (
              <li className="text-gray-500 py-2">Your cart is empty.</li>
            ) : (
              cartItems.map((item, idx) => (
                <li key={idx} className="flex items-center py-2 border-b last:border-b-0">
                  <img src={`${basepath}/${item.imgUrl}`} alt="" className="w-10 h-10 rounded mr-3" loading="lazy" />
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-blue-600">${item.price * item.quantity}</div>
                </li>
              ))
            )}
          </ul>
          <Link href="/checkout" className="block mt-4 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default React.memo(CartDropdown);