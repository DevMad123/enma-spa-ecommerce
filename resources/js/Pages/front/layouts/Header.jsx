/**
 * PR MIGRATION NOTE:
 * - Nouveau header e-commerce moderne, responsive et dynamique pour Laravel + Inertia.js + React.
 * - Palette : #a68e55, #8c6c3c, #040404 (+ couleurs complémentaires).
 * - Effet sticky, transitions, ombre portée, menu burger animé, CTA visibles.
 * - Compatible avec le background élégant de la home.
 * - Tous les liens utilisent Inertia.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, router } from '@inertiajs/react';
import { getWishcount } from '../../../redux/slices/settingSlice'; // <-- Ajouté ici
import Logo from '../components/HeaderParts/Logo';
import TopBarPromo from '../components/HeaderParts/TopBarPromo';
import PrimaryNav from '../components/HeaderParts/PrimaryNav';
import SearchAutocomplete from '../components/HeaderParts/SearchAutocomplete';
import CartDropdown from '../components/HeaderParts/CartDropdown';
import UserMenu from '../components/HeaderParts/UserMenu';
import MobileMenu from '../components/HeaderParts/MobileMenu';
import '../../../../css/header.css';

const HEADER_BG = 'bg-gradient-to-r from-[#a68e55] via-[#8c6c3c] to-[#040404]';

const FrontHeader = () => {
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.totalQuantity);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishCount = useSelector((state) => state.setting.wishcount);
  const isLogin = useSelector((state) => state.user.isLogin);
  const userInfo = useSelector((state) => state.user.userInfo);

  const [categories, setCategories] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sticky header effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch categories for mega-menu
  useEffect(() => {
    let mounted = true;
    // axiosClient.get('/product/category')
    //   .then(({ data }) => { if (mounted) setCategories(data); })
    //   .catch(() => setCategories([]));
    // return () => { mounted = false; };
  }, []);

  useEffect(() => { dispatch(getWishcount()); }, [dispatch]);

  // Debounced search handler
  const handleSearch = useCallback((query) => {
    if (!query) { setSearchSuggestions([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      // axiosClient.get(`/search/product?name=${encodeURIComponent(query)}`)
      //   .then(({ data }) => setSearchSuggestions(data))
      //   .catch(() => setSearchSuggestions([]))
      //   .finally(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    // axiosClient.post('/logout').then(() => {
    //   dispatch(userAction.logout());
    //   toast.success('Déconnexion réussie');
    //   router.visit('/home');
    // });
  };

  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') closeMobileMenu(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top promo bar */}
      <TopBarPromo />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${scrolled
            ? 'shadow-xl bg-[#040404]/90 backdrop-blur-md py-2'
            : `${HEADER_BG} py-4`
          }`}
        style={{
          boxShadow: scrolled ? '0 4px 24px 0 rgba(40,40,40,0.18)' : 'none',
        }}
        aria-label="Site header"
      >
        {/* Desktop Header */}
        <div className="hidden md:flex max-w-7xl mx-auto items-center justify-between px-6">
          <Logo />
          <PrimaryNav categories={categories} />
          <div className="flex items-center space-x-6">
            <SearchAutocomplete
              onSearch={handleSearch}
              suggestions={searchSuggestions}
              loading={searchLoading}
            />
            <CartDropdown cartCount={cartCount} cartItems={cartItems} />
            <Link href="/product/wishlist" className="relative group !text-[#a68e55] hover:!text-[#8c6c3c] transition" aria-label="Wishlist">
              <span className="inline-block align-middle">
                <svg width="24" height="24" aria-hidden="true" focusable="false" className="text-pink-500"><use href="#icon-heart" /></svg>
              </span>
              <span className="absolute -top-2 -right-2 bg-[#a68e55] text-white rounded-full text-xs px-2 py-0.5">{wishCount}</span>
            </Link>
            <UserMenu
              isLogin={isLogin}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
            <div className="ml-2">
              <button className="text-sm text-[#a68e55] hover:text-[#8c6c3c] font-semibold transition" aria-label="Change language/currency">
                EN | USD
              </button>
            </div>
            <Link href="/checkout" className="ml-4 px-4 py-2 rounded-full bg-[#a68e55] text-white font-bold shadow hover:bg-[#8c6c3c] transition">
              Commander
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4">
          <Logo />
          <div className="flex items-center space-x-4">
            <button
              aria-label="Ouvrir le menu"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={openMobileMenu}
              className="focus:outline-none group"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className={`block absolute h-0.5 w-6 bg-[#a68e55] rounded transition-all duration-300
                  ${mobileMenuOpen ? 'rotate-45 top-4' : 'top-2'}`}></span>
                <span className={`block absolute h-0.5 w-6 bg-[#a68e55] rounded transition-all duration-300
                  ${mobileMenuOpen ? 'opacity-0' : 'top-4'}`}></span>
                <span className={`block absolute h-0.5 w-6 bg-[#a68e55] rounded transition-all duration-300
                  ${mobileMenuOpen ? '-rotate-45 top-4' : 'top-6'}`}></span>
              </span>
            </button>
            <CartDropdown cartCount={cartCount} cartItems={cartItems} mobile />
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
      {/* Spacer for sticky header */}
      <div className="h-20 md:h-24"></div>
    </>
  );
};

export default FrontHeader;
