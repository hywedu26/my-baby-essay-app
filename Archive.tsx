import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const Archive = () => {
  const [essays, setEssays] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'month' 등으로 확장 가능

  useEffect(() => {
    const fetchEssays = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "users", user.uid, "essays"),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        setEssays(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchEssays();
  }, []);

  // PDF 저장 기능 (브라우저의 인쇄 기능을 활용한 간이 PDF 저장)
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 pb-24 font-sans print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-10 print:hidden">
          <h1 className="text-2xl font-bold text-[#6D5D4B]">기록 보관소</h1>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-[#8B7E74] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#6D5D4B]"
          >
            PDF로 소장하기
          </button>
        </header>

        <div className="space-y-8">
          {essays.length > 0 ? (
            essays.map((essay) => (
              <article key={essay.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-[#F2EAD3] print:shadow-none print:border-none print:mb-12">
                {essay.imageUrl && (
                  <img src={essay.imageUrl} alt="오늘의 기록" className="w-full h-64 object-cover" />
                )}
                <div className="p-8">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[#FF8E8E] font-bold text-sm">{essay.babyMonth}차 기록</span>
                    <span className="text-[#A79277] text-xs">{essay.date}</span>
                  </div>
                  <p className="text-[#6D5D4B] leading-relaxed whitespace-pre-wrap italic">
                    {essay.content}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-[#F2EAD3]">
              <p className="text-[#A79277] text-sm italic">아직 기록된 에세이가 없어요.<br/>첫 번째 추억을 남겨보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
