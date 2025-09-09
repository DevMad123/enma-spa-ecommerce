import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import ActiveLink from './ActiveLink'; // à créer

// Keyboard accessible mega-menu
const PrimaryNav = ({ categories }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const handleMouseEnter = (id) => setOpenMenu(id);
  const handleMouseLeave = () => setOpenMenu(null);

  return (
    <nav aria-label="Main navigation" className="flex space-x-6">
      <ActiveLink href="/home" className="font-semibold text-white hover:text-blue-600">Home</ActiveLink>
      <ActiveLink href="/all/product" className="font-semibold text-white hover:text-blue-600">Shop</ActiveLink>
      <div className="relative group" tabIndex={0}
        onMouseEnter={() => handleMouseEnter('categories')}
        onMouseLeave={handleMouseLeave}
        aria-haspopup="true"
        aria-expanded={openMenu === 'categories'}
      >
        <button className="font-semibold text-gray-700 hover:text-blue-600 focus:outline-none" aria-label="Shop Categories">
          Categories
        </button>
        {openMenu === 'categories' && (
          <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg w-72 z-20 p-4"
            role="menu"
            aria-label="Categories"
          >
            <ul>
              {categories.map(cat => (
                <li key={cat.id}>
                  <ActiveLink href={`/category/${cat.slug || cat.id}`} className="block py-2 px-3 hover:bg-blue-50 rounded text-gray-800">
                    {cat.name}
                  </ActiveLink>
                  {/* Optionally render children as submenu */}
                  {cat.children && cat.children.length > 0 && (
                    <ul className="ml-4 mt-1">
                      {cat.children.map(sub => (
                        <li key={sub.id}>
                          <ActiveLink href={`/category/${cat.slug || cat.id}/${sub.slug || sub.id}`} className="block py-1 px-2 hover:bg-blue-100 rounded text-gray-600">
                            {sub.name}
                          </ActiveLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ActiveLink href="/all/brands" className="font-semibold text-gray-700 hover:text-blue-600">Brands</ActiveLink>
      <ActiveLink href="/contact/us/ll" className="font-semibold text-gray-700 hover:text-blue-600">Contact</ActiveLink>
    </nav>
  );
};

export default React.memo(PrimaryNav);