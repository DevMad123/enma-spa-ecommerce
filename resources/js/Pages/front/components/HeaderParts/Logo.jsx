import React from 'react';
import { Link } from '@inertiajs/react';
import logo from '../../../../../assets/front/imgs/logo.webp';

const Logo = () => (
  <Link href="/" aria-label="Home" className="flex items-center">
    <img
      src={logo}
      alt="Logo"
      className="h-10 w-auto"
      loading="lazy"
    />
  </Link>
);

export default React.memo(Logo);