import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = ({
  open,
  onClose,
  categories,
  isLogin,
  userInfo,
  onLogout,
  wishCount,
}) => {
  const panelRef = useRef();

  // Focus trap
  useEffect(() => {
    if (!open) return;
    panelRef.current && panelRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={onClose}
    >
      <nav
        ref={panelRef}
        className="bg-white w-80 h-full p-6 overflow-y-auto"
        tabIndex={0}
        aria-label="Mobile navigation"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600"
          aria-label="Close menu"
          onClick={onClose}
        >
          <svg width="24" height="24"><use href="#icon-close" /></svg>
        </button>
        <Link to="/" className="block mb-6 font-bold text-xl">Home</Link>
        <Link to="/all/product" className="block mb-4 font-semibold">Shop</Link>
        <div className="mb-4">
          <span className="font-semibold">Categories</span>
          <ul className="ml-2 mt-2">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link to={`/category/${cat.slug || cat.id}`} className="block py-1 px-2 hover:bg-blue-50 rounded">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/all/brands" className="block mb-4 font-semibold">Brands</Link>
        <Link to="/contact/us/ll" className="block mb-4 font-semibold">Contact</Link>
        <Link to="/product/wishlist" className="block mb-4 font-semibold relative">
          Wishlist
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{wishCount}</span>
        </Link>
        <div className="mt-6">
          {isLogin ? (
            <>
              <Link to="/user/deshboard/1" className="block mb-2">Profile</Link>
              <button onClick={onLogout} className="block w-full text-left mb-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block mb-2">Login</Link>
              <Link to="/Signup" className="block mb-2">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default React.memo(MobileMenu);