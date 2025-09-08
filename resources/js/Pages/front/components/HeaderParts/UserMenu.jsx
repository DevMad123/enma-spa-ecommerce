import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ isLogin, userInfo, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const handleClick = () => setOpen(!open);
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="relative" tabIndex={0} aria-haspopup="true" aria-expanded={open} onKeyDown={handleKeyDown}>
      <button
        className="flex items-center"
        aria-label="User menu"
        onClick={handleClick}
      >
        <svg width="24" height="24" aria-hidden="true" focusable="false" className="text-gray-700"><use href="#icon-user" /></svg>
        {isLogin && <span className="ml-2 font-medium">{JSON.parse(userInfo).name}</span>}
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg z-30 w-48"
          role="menu"
          aria-label="User menu"
        >
          {isLogin ? (
            <>
              <Link to="/user/deshboard/1" className="block px-4 py-2 hover:bg-blue-50">Profile</Link>
              <button onClick={onLogout} className="block w-full text-left px-4 py-2 hover:bg-blue-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-2 hover:bg-blue-50">Login</Link>
              <Link to="/Signup" className="block px-4 py-2 hover:bg-blue-50">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(UserMenu);