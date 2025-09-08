/**
 * PR MIGRATION NOTE:
 * - This is a new, innovative e-commerce header component, refactoring the previous Header.
 * - All features from Multimart's Header are preserved and improved: mega-menu, search autocomplete, cart dropdown, wishlist, user menu, responsive mobile/off-canvas menu, accessibility, and performance.
 * - Split into subcomponents in `HeaderParts/`.
 * - To switch back, revert `src/components/Header/index.js` to export the previous Header.
 * - All props/events/state integrations are preserved; see migration notes in subcomponents if you need to adapt.
 * - Tests and Storybook stories included.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getWishcount } from '../../../redux/slices/settingSlice';
import { userAction } from '../../../redux/slices/userSlice';
import axiosClient from '../../../axios-client';
import { toast } from 'react-toastify';

// Subcomponents
import Logo from '../components/HeaderParts/Logo';
import TopBarPromo from '../components/HeaderParts/TopBarPromo';
import PrimaryNav from '../components/HeaderParts/PrimaryNav';
import SearchAutocomplete from '../components/HeaderParts/SearchAutocomplete';
import CartDropdown from '../components/HeaderParts/CartDropdown';
import UserMenu from '../components/HeaderParts/UserMenu';
import MobileMenu from '../components/HeaderParts/MobileMenu';

// Styling: Tailwind preferred, fallback to CSS classes if not available
import '../../../styles/header.css';

// Accessibility: ARIA roles, focus management, keyboard navigation
// Performance: Debounced search, lazy icons, memoized menus

const FrontHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const cartCount = useSelector((state) => state.cart.totalQuantity);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishCount = useSelector((state) => state.setting.wishcount);
  const isLogin = useSelector((state) => state.user.isLogin);
  const userInfo = useSelector((state) => state.user.userInfo);
  const basepath = useSelector((state) => state.setting.basepath);

  // Local state
  const [categories, setCategories] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch categories for mega-menu
  useEffect(() => {
    let mounted = true;
    axiosClient.get('/product/category')
      .then(({ data }) => {
        if (mounted) setCategories(data);
      })
      .catch(() => setCategories([]));
    return () => { mounted = false; };
  }, []);

  // Fetch wish count on mount
  useEffect(() => {
    dispatch(getWishcount());
  }, [dispatch]);

  // Debounced search handler
  const handleSearch = useCallback((query) => {
    if (!query) {
      setSearchSuggestions([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      axiosClient.get(`/search/product?name=${encodeURIComponent(query)}`)
        .then(({ data }) => setSearchSuggestions(data))
        .catch(() => setSearchSuggestions([]))
        .finally(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // User logout
  const handleLogout = () => {
    axiosClient.post('/logout').then(() => {
      dispatch(userAction.logout());
      toast.success('Successfully Logout');
      navigate('/home');
    });
  };

  // Mobile menu accessibility
  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Keyboard accessibility for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // SSR fallback: don't use browser-only APIs at module top level

  return (
    <header className="w-full z-50">
      {/* Top promo bar */}
      <TopBarPromo />

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Logo basepath={basepath} />
          <PrimaryNav categories={categories} />
          <div className="flex items-center space-x-6">
            <SearchAutocomplete
              onSearch={handleSearch}
              suggestions={searchSuggestions}
              loading={searchLoading}
            />
            <CartDropdown cartCount={cartCount} cartItems={cartItems} basepath={basepath} />
            <Link to="/product/wishlist" className="relative group" aria-label="Wishlist">
              <span className="inline-block align-middle">
                <svg width="24" height="24" aria-hidden="true" focusable="false" className="text-pink-500"><use href="#icon-heart" /></svg>
              </span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{wishCount}</span>
            </Link>
            <UserMenu
              isLogin={isLogin}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
            {/* Language/Currency switcher stub */}
            <div className="ml-2">
              <button className="text-sm text-gray-600 hover:text-blue-600" aria-label="Change language/currency">
                EN | USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <Logo basepath={basepath} />
          <div className="flex items-center space-x-4">
            <button
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={openMobileMenu}
              className="focus:outline-none"
            >
              <svg width="32" height="32" aria-hidden="true" focusable="false"><use href="#icon-menu" /></svg>
            </button>
            <CartDropdown cartCount={cartCount} cartItems={cartItems} basepath={basepath} mobile />
          </div>
        </div>
        <MobileMenu
          open={mobileMenuOpen}
          onClose={closeMobileMenu}
          categories={categories}
          isLogin={isLogin}
          userInfo={userInfo}
          onLogout={handleLogout}
          wishCount={wishCount}
        />
      </div>
    </header>
  );
};

export default FrontHeader;
