import React, { useState } from 'react';
import Dashboard from './Dashboard';
import WriteEssay from './WriteEssay';
import Archive from './Archive';
import Auth from './Auth';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 실제 구현 시 auth.onAuthStateChanged 사용

  if (!isLoggedIn) return <Auth />;

  return (
    <div className="relative">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'write' && <WriteEssay />}
      {currentPage === 'archive' && <Archive />}

      {/* 하단 탭 바 (아이패드 미니에서 한 손으로 조작하기 편한 위치) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#F2EAD3] px-6 py-3 flex justify-around items-center print:hidden">
        <button onClick={() => setCurrentPage('dashboard')} className={`text-xl ${currentPage === 'dashboard' ? 'opacity-100' : 'opacity-30'}`}>📅</button>
        <button onClick={() => setCurrentPage('write')} className={`text-3xl bg-[#FFB0B0] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 ${currentPage === 'write' ? 'scale-110' : ''}`}>+</button>
        <button onClick={() => setCurrentPage('archive')} className={`text-xl ${currentPage === 'archive' ? 'opacity-100' : 'opacity-30'}`}>📖</button>
      </nav>
    </div>
  );
};

export default App;
