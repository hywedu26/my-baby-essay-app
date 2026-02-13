import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [recordedDates, setRecordedDates] = useState([]); // 기록이 있는 날짜들 (하트 표시용)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // 유저 정보(아이 이름 등) 가져오기
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());

        // 기록이 있는 날짜들 가져오기 (컬렉션 이름은 'essays'로 가정)
        const q = query(collection(db, "users", user.uid, "essays"));
        const querySnapshot = await getDocs(q);
        const dates = querySnapshot.docs.map(doc => doc.data().date); // 'YYYY-MM-DD' 형식
        setRecordedDates(dates);
      }
    };
    fetchUserData();
  }, []);

  // 달력 생성 로직 (간략화)
  const renderCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasRecord = recordedDates.includes(dateStr);

      days.push(
        <div key={i} className="relative p-4 text-[#6D5D4B] font-medium">
          {i}
          {hasRecord && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-2xl text-[#FF8E8E]">❤️</span>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 font-sans">
      {/* 상단 프로필 영역 */}
      <header className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-28 h-28 rounded-full border-4 border-[#FFD8CC] overflow-hidden shadow-md mb-4 bg-white">
          <img src={userData?.profileImg || "/api/placeholder/150/150"} alt="프로필" className="object-cover w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold text-[#6D5D4B]">
          행복한 {userData?.babyName || "아이"}의 기록 모음
        </h1>
        <p className="text-[#A79277] mt-2 italic text-sm">제주도 푸른 바다처럼 건강하게 자라렴</p>
      </header>

      {/* 달력 영역 */}
      <section className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F2EAD3] max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-xl font-bold text-[#8B7E74]">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="py-2 text-[#A79277] text-xs font-bold">{day}</div>
          ))}
          {renderCalendar()}
        </div>
      </section>

      {/* 기록 추가 플로팅 버튼 */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#FFB0B0] text-white rounded-full shadow-2xl text-3xl flex items-center justify-center hover:scale-110 transition-transform">
        +
      </button>
    </div>
  );
};

export default Dashboard;
