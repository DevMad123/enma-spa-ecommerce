import React from 'react';
import { usePage, Link } from '@inertiajs/react';

const ActiveLink = ({ href, children, ...props }) => {
  const { url } = usePage();
  const isActive = url.startsWith(href);
  return (
    <Link
      href={href}
      {...props}
      className={`${props.className || ''} ${isActive ? 'text-blue-600 font-bold' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;