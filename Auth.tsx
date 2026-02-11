import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // 로그인 로직
        await signInWithEmailAndPassword(auth, email, password);
        alert("어서오세요! 아이의 기록으로 안내할게요.");
      } else {
        // 회원가입 로직
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // 신규 유저의 기본 프로필 생성
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          createdAt: new Date(),
          setupComplete: false // 이후 온보딩 페이지로 유도하기 위함
        });
        alert("환영합니다! 우리 가족의 소중한 공간이 생성되었습니다.");
      }
    } catch (error) {
      alert("문제가 발생했어요: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-sm border border-[#F2EAD3]">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-[#6D5D4B]">육아 에세이 기록관</h1>
          <p className="text-[#A79277] mt-2 text-sm">따뜻한 기억을 기록으로 남기세요</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="이메일 주소" 
            className="w-full p-4 bg-[#FAF9F6] border-none rounded-2xl focus:ring-2 focus:ring-[#FFB0B0] outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full p-4 bg-[#FAF9F6] border-none rounded-2xl focus:ring-2 focus:ring-[#FFB0B0] outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-4 bg-[#FFB0B0] text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform mt-4">
            {isLogin ? "로그인하기" : "시작하기(회원가입)"}
          </button>
        </form>

        <p className="text-center mt-6 text-[#A79277] text-sm">
          {isLogin ? "처음이신가요?" : "이미 계정이 있나요?"} 
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 text-[#FF8E8E] font-bold underline"
          >
            {isLogin ? "가입하기" : "로그인하기"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
