"use client";

import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// 1. Firebase 설정 (본인의 실제 값으로 확인 부탁드려요)
const firebaseConfig = {
  apiKey: "AIzaSyDRqbQMPdeTzwnMe40HgnqhV-Uvo727834",
  authDomain: "my-baby-essay.firebaseapp.com",
  projectId: "my-baby-essay",
  storageBucket: "my-baby-essay.firebasestorage.app",
  messagingSenderId: "708848692442",
  appId: "1:708848692442:web:6fc6572861c705af73c9e3"
};

// Firebase 초기화 (중복 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (isLogin: boolean) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert("오류가 발생했습니다: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center font-sans text-[#A79277]">로딩 중...</div>;

  // 로그인하지 않은 경우 (로그인 화면)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-6 font-sans text-[#6D5D4B]">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-sm border border-[#F2EAD3]">
          <h1 className="text-2xl font-bold text-center mb-8">육아 에세이 기록관</h1>
          <input type="email" placeholder="이메일" className="w-full p-4 mb-4 bg-[#FAF9F6] rounded-2xl outline-none" onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder="비밀번호" className="w-full p-4 mb-6 bg-[#FAF9F6] rounded-2xl outline-none" onChange={(e)=>setPassword(e.target.value)} />
          <button onClick={() => handleAuth(true)} className="w-full py-4 bg-[#FFB0B0] text-white rounded-full font-bold mb-4">로그인</button>
          <button onClick={() => handleAuth(false)} className="w-full py-4 border border-[#FFB0B0] text-[#FFB0B0] rounded-full font-bold">회원가입</button>
        </div>
      </div>
    );
  }

  // 로그인한 경우 (대시보드 - 간단 버전)
  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 font-sans text-[#6D5D4B]">
      <header className="text-center mt-10">
        <h1 className="text-2xl font-bold">행복한 기록 모음</h1>
        <p className="text-[#A79277] mt-2 italic">14개월 아드님과의 소중한 순간</p>
      </header>
      <div className="mt-10 bg-white rounded-[40px] p-8 text-center border border-[#F2EAD3]">
        달력과 에세이 기능이 곧 활성화됩니다!
      </div>
    </div>
  );
}
