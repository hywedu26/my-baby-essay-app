"use client";

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, getDocs, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 1. Firebase 설정 (선생님의 설정값)
const firebaseConfig = {
  apiKey: "AIzaSyDRqbQMPdeTzwnMe40HgnqhV-Uvo727834",
  authDomain: "my-baby-essay.firebaseapp.com",
  projectId: "my-baby-essay",
  storageBucket: "my-baby-essay.firebasestorage.app",
  messagingSenderId: "708848692442",
  appId: "1:708848692442:web:6fc6572861c705af73c9e3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 화면 전환용 (dashboard, write, archive)
  
  // 로그인 관련 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 에세이 작성 관련 상태
  const [note, setNote] = useState('');
  const [essayResult, setEssayResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  // 달력 관련 상태
  const [recordedDates, setRecordedDates] = useState([]);
  const [today] = useState(new Date());

  // 로그인 상태 감시 및 데이터 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 기록된 날짜들 가져오기 (하트 표시용)
        const q = query(collection(db, "users", currentUser.uid, "essays"));
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => doc.data().date);
        setRecordedDates(dates);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 로그인/회원가입 처리
  const handleAuth = async (isLogin) => {
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { alert("오류: " + err.message); }
  };

  // AI 에세이 생성 (가짜 AI - 실제 연동 전 테스트용)
  const handleGenerate = async () => {
    if (!note) return alert("오늘의 메모를 적어주세요!");
    setIsGenerating(true);
    
    // 사진 업로드 로직
    let imageUrl = '';
    if (fileInputRef.current?.files[0]) {
      const file = fileInputRef.current.files[0];
      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    // 2초 뒤 가짜 결과 생성 (나중에 Gemini API로 교체 가능)
    setTimeout(async () => {
      const generatedText = `[초록바다 아일랜드의 기록]\n\n제주도의 따뜻한 바람이 불어오는 오늘, 14개월 다원이는... "${note}"\n\n(이 부분에 AI가 쓴 멋진 글이 들어갑니다.)`;
      setEssayResult(generatedText);
      
      // Firestore에 저장
      const todayStr = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, "users", user.uid, "essays"), {
        date: todayStr,
        content: generatedText,
        originalNote: note,
        imageUrl: imageUrl,
        createdAt: new Date()
      });
      
      // 달력 업데이트를 위해 날짜 추가
      setRecordedDates(prev => [...prev, todayStr]);
      setIsGenerating(false);
      alert("오늘의 기록이 저장되었습니다!");
      setView('dashboard');
    }, 2000);
  };

  // 캘린더 렌더링
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

  // 1. 로그인 화면
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

  // 2. 메인 앱 화면
  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-20 font-sans">
      {/* 상단 헤더 */}
      <header className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-[#6D5D4B]">다원이의 기록 🌿</h1>
        <button onClick={()=>signOut(auth)} className="text-xs text-[#A79277] border px-3 py-1 rounded-full">로그아웃</button>
      </header>

      {/* 뷰: 대시보드 (달력) */}
      {view === 'dashboard' && (
        <div className="p-6">
          <div className="bg-white rounded-[30px] p-6 shadow-sm border border-[#F2EAD3] mb-6">
            <h2 className="text-center font-bold text-[#8B7E74] mb-4">{today.getMonth()+1}월의 기록</h2>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['일','월','화','수','목','금','토'].map(d=><div key={d} className="text-xs text-[#A79277]">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>
          <div className="text-center">
            <p className="text-[#A79277] text-sm">오늘 다원이는 어떤 표정을 지었나요?</p>
          </div>
        </div>
      )}

      {/* 뷰: 글쓰기 */}
      {view === 'write' && (
        <div className="p-6">
          <div className="bg-white rounded-[30px] p-6 shadow-sm mb-6">
            <h2 className="font-bold text-[#6D5D4B] mb-4">오늘의 순간 기록하기</h2>
            <input type="file" ref={fileInputRef} className="mb-4 text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#FFF0ED] file:text-[#FF8E8E]"/>
            <textarea 
              className="w-full h-32 p-4 bg-[#FAF9F6] rounded-xl outline-none mb-4 resize-none"
              placeholder="짧게 메모를 남겨주세요 (예: 다원이가 처음으로 '아빠'라고 했다!)"
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

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#F2EAD3] flex justify-around p-4 pb-6">
        <button onClick={()=>setView('dashboard')} className={`text-2xl ${view==='dashboard'?'opacity-100':'opacity-30'}`}>📅</button>
        <button onClick={()=>setView('write')} className={`text-4xl bg-[#FFB0B0] text-white w-14 h-14 rounded-full flex items-center justify-center -mt-8 shadow-lg ${view==='write'?'scale-110':''}`}>+</button>
        <button onClick={()=>setView('archive')} className={`text-2xl ${view==='archive'?'opacity-100':'opacity-30'}`}>📖</button>
      </nav>
    </div>
  );
}
