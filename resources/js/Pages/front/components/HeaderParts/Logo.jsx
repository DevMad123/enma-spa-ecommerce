import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ basepath }) => (
  <Link to="/" aria-label="Home" className="flex items-center">
    <img
      src={basepath ? `${basepath}/resources/assets/front/imgs/logo.webp` : '/resources/assets/front/imgs/logo.webp'}
      alt="Logo"
      className="h-10 w-auto"
      loading="lazy"
    />
  </Link>
);

export default React.memo(Logo);