import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebaseConfig';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const WriteEssay = () => {
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [essay, setEssay] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [babyMonth, setBabyMonth] = useState('');

  // 아기 생일을 바탕으로 개월 수 자동 계산 (14개월 등)
  useEffect(() => {
    const fetchBabyInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const birth = new Date(userDoc.data().birthDate);
          const now = new Date();
          const diff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
          setBabyMonth(`${diff}개월`);
        }
      }
    };
    fetchBabyInfo();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // 실제 구현 시 Google AI Studio에서 발급받은 API 키를 사용하는 백엔드 로직 연동 필요
    // 여기서는 흐름만 구성합니다.
    setTimeout(() => {
      setEssay(`[AI가 작성한 ${babyMonth} 차 육아 에세이]\n\n오늘 제주도의 햇살 아래에서 아이가 보여준 미소는 마치... (학습된 톤앤매너로 작성됨)`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 pb-20 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* 오늘의 질문 푸시 제안 */}
        <div className="bg-[#FFF0ED] p-5 rounded-[30px] border border-[#FFD8CC] shadow-sm">
          <p className="text-[#FF8E8E] text-xs font-bold mb-1">💡 오늘의 질문</p>
          <p className="text-[#6D5D4B] text-sm leading-relaxed">
            오늘 아이와 눈이 마주쳤을 때 어떤 기분이 들었나요? 그 찰나의 순간을 기록해 보세요.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F2EAD3]">
          <label className="block text-[#A79277] text-xs font-bold mb-3 ml-2">오늘의 사진</label>
          <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#FFF0ED] file:text-[#FF8E8E] mb-6"/>

          <label className="block text-[#A79277] text-xs font-bold mb-3 ml-2">간단한 기록</label>
          <textarea 
            className="w-full h-32 p-4 bg-[#FAF9F6] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFB0B0] text-sm"
            placeholder="기억하고 싶은 순간을 짧게 적어주세요."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-6 py-4 bg-[#FFB0B0] text-white rounded-full font-bold shadow-lg active:scale-95 transition-all"
          >
            {isGenerating ? "AI가 감성을 담아 쓰는 중..." : "AI 육아 에세이 만들기"}
          </button>
        </div>

        {/* 결과 에세이 (수정 기능 포함) */}
        {essay && (
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F2EAD3] animate-fade-in">
            <h3 className="text-[#6D5D4B] font-bold mb-4 text-center">완성된 에세이</h3>
            <textarea 
              className="w-full h-64 p-2 bg-transparent border-none outline-none italic text-[#6D5D4B] leading-relaxed resize-none"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
            <button className="w-full mt-4 py-3 bg-[#8B7E74] text-white rounded-full text-sm font-bold">
              이대로 저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteEssay;
