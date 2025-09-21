import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          DINH MMO <span className="text-purple-400">AI</span>
        </h1>
        <p className="text-sm text-gray-400">Tạo Nhân Vật Đồng Nhất</p>
      </div>
    </header>
  );
};

export default Header;