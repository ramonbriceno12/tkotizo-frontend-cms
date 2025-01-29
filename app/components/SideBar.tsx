// app/components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaHandshake,
  FaPercentage,
  FaBars,
  FaTimes,
  FaShoppingBag
} from 'react-icons/fa';
import useWindowSize from '../hooks/useWindowSize';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width !== undefined && width < 1024; // Adjust the breakpoint as needed

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const menuItems = [
    { name: 'Dashboard', icon: <FaUsers />, href: '/' },
    { name: 'Usuarios', icon: <FaUsers />, href: '/users/list' },
    { name: 'Ordenes de compra recibidas', icon: <FaShoppingCart />, href: '/purchase-orders/list' },
    { name: 'Ordenes de compra cotizadas', icon: <FaShoppingBag />, href: '/purchase-orders/list' },
    { name: 'Facturas', icon: <FaFileInvoiceDollar />, href: '/invoices/list' },
    { name: 'Proveedores', icon: <FaHandshake />, href: '/providers/list' },
    { name: 'Comisiones', icon: <FaPercentage />, href: '/comisiones' },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg focus:outline-none"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <nav className={`flex-1 px-4 py-6 ${isMobile && isOpen ? 'pt-20' : ''}`}>
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
