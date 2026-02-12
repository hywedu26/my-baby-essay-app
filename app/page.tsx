"use client"; // Next.js 클라이언트 컴포넌트 선언 (필수!)

import React, { useState } from 'react';
// 파일들이 app 폴더 바깥에 있으므로 ../ 를 붙여서 경로를 맞춰줍니다.
import Dashboard from '../Dashboard';
import WriteEssay from '../WriteEssay';
import Archive from '../Archive';
import Auth from '../Auth';

export default function Page() { // 이름을 App에서 Page로 변경하고 export default를 붙여줍니다.
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  if (!isLoggedIn) return <Auth />;

  return (
    <div className="relative font-sans">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'write' && <WriteEssay />}
      {currentPage === 'archive' && <Archive />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#F2EAD3] px-6 py-3 flex justify-around items-center print:hidden">
        <button onClick={() => setCurrentPage('dashboard')} className={`text-xl ${currentPage === 'dashboard' ? 'opacity-100' : 'opacity-30'}`}>📅</button>
        <button onClick={() => setCurrentPage('write')} className={`text-3xl bg-[#FFB0B0] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 ${currentPage === 'write' ? 'scale-110' : ''}`}>+</button>
        <button onClick={() => setCurrentPage('archive')} className={`text-xl ${currentPage === 'archive' ? 'opacity-100' : 'opacity-30'}`}>📖</button>
      </nav>
    </div>
  );
}
