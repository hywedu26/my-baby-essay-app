"use client";

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, collection, query, getDocs, addDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Firebase 설정 (선생님의 기존 설정값)
const firebaseConfig = {
  apiKey: "AIzaSyDRqbQMPdeTzwnMe40HgnqhV-Uvo727834",
  authDomain: "my-baby-essay.firebaseapp.com",
  projectId: "my-baby-essay",
  storageBucket: "my-baby-essay.firebasestorage.app",
  messagingSenderId: "708848692442",
  appId: "1:708848692442:web:6fc6572861c705af73c9e3"
};

// 2. Gemini API 설정 (⭐⭐ 방금 '새 프로젝트'에서 받은 키를 여기에 넣으세요! ⭐⭐)
const GEMINI_API_KEY = "AIzaSyCrJ2zFlaEC2BhX2eadV_ZprdWuZNmgCqc"; 

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [essayResult, setEssayResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordedDates, setRecordedDates] = useState([]);
  const [today] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
            const q = query(collection(db, "users", currentUser.uid, "essays"));
            const snapshot = await getDocs(q);
            setRecordedDates(snapshot.docs.map(doc => doc.data().date));
        } catch (e) {
            console.log("데이터 없음:", e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (isLogin) => {
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { alert("오류: " + err.message); }
  };

  const handleGenerate = async () => {
    if (!note) return alert("메모를 적어주세요!");
    setIsGenerating(true);
    
    try {
      // 최신 모델 gemini-1.5-flash 사용
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        당신은 14개월 아기 '다원'이의 아빠이자 감성적인 에세이 작가입니다.
        아래의 메모 내용을 바탕으로 따뜻하고 사랑스러운 육아 에세이를 한 편 써주세요.
        문체는 '초록바다 아일랜드'라는 필명에 어울리게 서정적이고 다정하게 해주세요.
        
        메모 내용: ${note}
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      setEssayResult(generatedText);
      
      // 저장
      const todayStr = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, "users", user.uid, "essays"), {
        date: todayStr,
        content: generatedText,
        originalNote: note,
        imageUrl: null,
        createdAt: new Date()
      });
      
      setRecordedDates(prev => [...prev, todayStr]);
      alert("AI 에세이가 완성되었습니다! 💖");
      setView('archive'); 
      
    } catch (error) {
      console.error(error);
      alert("AI 생성 실패: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // (아래 화면 렌더링 코드는 동일합니다)
  const renderCalendar = () => {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasRecord = recordedDates.includes(dateStr);
      days.push(
        <div key={i} className="relative p-2 h-14 border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-sm text-[#6D5D4B]">{i}</span>
          {hasRecord && <span className="text-xl">❤️</span>}
        </div>
      );
    }
    return days;
  };

  if (loading) return <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">로딩 중...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[30px] p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#6D5D4B]">초록바다 육아 기록</h1>
          <input type="email" placeholder="이메일" className="w-full p-4 mb-3 bg-[#FAF9F6] rounded-xl" onChange={(e)=>setEmail(e.target.value)}/>
          <input type="password" placeholder="비밀번호" className="w-full p-4 mb-6 bg-[#FAF9F6] rounded-xl" onChange={(e)=>setPassword(e.target.value)}/>
          <div className="flex gap-2">
            <button onClick={()=>handleAuth(true)} className="flex-1 py-3 bg-[#FFB0B0] text-white rounded-xl font-bold">로그인</button>
            <button onClick={()=>handleAuth(false)} className="flex-1 py-3 border border-[#FFB0B0] text-[#FFB0B0] rounded-xl font-bold">가입</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-20 font-sans">
      <header className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-[#6D5D4B]">다원이의 기록 🌿</h1>
        <button onClick={()=>signOut(auth)} className="text-xs text-[#A79277] border px-3 py-1 rounded-full">로그아웃</button>
      </header>

      {view === 'dashboard' && (
        <div className="p-6">
          <div className="bg-white rounded-[30px] p-6 shadow-sm border border-[#F2EAD3] mb-6">
            <h2 className="text-center font-bold text-[#8B7E74] mb-4">{today.getMonth()+1}월의 기록</h2>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['일','월','화','수','목','금','토'].map(d=><div key={d} className="text-xs text-[#A79277]">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>
        </div>
      )}

      {view === 'write' && (
        <div className="p-6">
          <div className="bg-white rounded-[30px] p-6 shadow-sm mb-6">
            <h2 className="font-bold text-[#6D5D4B] mb-4">오늘의 순간 기록하기</h2>
            <div className="p-4 bg-[#FFF0ED] rounded-xl mb-4 text-xs text-[#FF8E8E]">
              📸 사진 기능은 점검 중입니다. 글로만 남겨주세요!
            </div>
            <textarea 
              className="w-full h-32 p-4 bg-[#FAF9F6] rounded-xl outline-none mb-4 resize-none"
              placeholder="짧게 메모를 남겨주세요 (예: 다원이가 오늘 판다가 되었다.)"
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-[#FFB0B0] text-white rounded-xl font-bold shadow-md"
            >
              {isGenerating ? "AI가 글을 다듬는 중..." : "에세이 만들기 ✨"}
            </button>
          </div>
        </div>
      )}

      {view === 'archive' && (
        <div className="p-6">
             <div className="bg-white rounded-[30px] p-6 shadow-sm mb-6">
                <h2 className="font-bold text-[#6D5D4B] mb-4">최근 기록</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#6D5D4B]">
                    {essayResult ? essayResult : "아직 작성된 글이 없습니다."}
                </div>
                <button onClick={()=>setView('dashboard')} className="mt-6 w-full py-3 bg-[#8B7E74] text-white rounded-xl text-sm font-bold">
                    달력으로 돌아가기
                </button>
             </div>
        </div>
      )}

      <nav className="fixed bottom-0 w-full bg-white border-t border-[#F2EAD3] flex justify-around p-4 pb-6">
        <button onClick={()=>setView('dashboard')} className={`text-2xl ${view==='dashboard'?'opacity-100':'opacity-30'}`}>📅</button>
        <button onClick={()=>setView('write')} className={`text-4xl bg-[#FFB0B0] text-white w-14 h-14 rounded-full flex items-center justify-center -mt-8 shadow-lg ${view==='write'?'scale-110':''}`}>+</button>
        <button onClick={()=>setView('archive')} className={`text-2xl ${view==='archive'?'opacity-100':'opacity-30'}`}>📖</button>
      </nav>
    </div>
  );
}
