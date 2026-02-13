// pages/onboarding.tsx (또는 app/onboarding/page.tsx)
import React, { useState } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    babyName: '',
    birthDate: '',
    styles: ['', '', '']
  });
  const router = useRouter();

  const handleNext = () => setStep(step + 1);
  
  const saveProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        setupComplete: true
      });
      router.push('/dashboard'); // 완료 후 메인 화면으로
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4 font-['NanumSquareRound']">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-sm border border-[#F2EAD3]">
        
        {/* Step 1: 아이 정보 입력 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-[#6D5D4B] mb-2 text-center">반가워요!</h2>
            <p className="text-[#A79277] text-center mb-8 text-sm">우리 아이의 첫 기록을 시작해볼까요?</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[#8B7E74] text-xs ml-2">아이의 이름(또는 태명)</label>
                <input 
                  className="w-full p-4 mt-1 bg-[#FAF9F6] border-none rounded-2xl focus:ring-2 focus:ring-[#FFB0B0] outline-none"
                  placeholder="예: 초록바다"
                  onChange={(e) => setFormData({...formData, babyName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[#8B7E74] text-xs ml-2">아이의 생일</label>
                <input 
                  type="date"
                  className="w-full p-4 mt-1 bg-[#FAF9F6] border-none rounded-2xl focus:ring-2 focus:ring-[#FFB0B0] outline-none"
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>
            <button onClick={handleNext} className="w-full mt-10 py-4 bg-[#FFB0B0] text-white rounded-full font-bold shadow-md hover:bg-[#FF9E9E]">다음으로</button>
          </div>
        )}

        {/* Step 2: 톤앤매너 학습용 글 입력 */}
        {step === 2 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-xl font-bold text-[#6D5D4B] mb-2">당신의 따뜻한 문체를 알려주세요</h2>
            <p className="text-[#A79277] text-xs mb-6 leading-relaxed">평소 작성하신 글 3편을 적어주시면,<br/>AI가 당신의 감성을 그대로 학습해 에세이를 써드려요.</p>
            
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <textarea 
                  key={i}
                  className="w-full h-24 p-4 bg-[#FAF9F6] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#FFB0B0] outline-none italic"
                  placeholder={`글 예시 ${i + 1}을 입력하세요...`}
                  onChange={(e) => {
                    const newStyles = [...formData.styles];
                    newStyles[i] = e.target.value;
                    setFormData({...formData, styles: newStyles});
                  }}
                />
              ))}
            </div>
            <button onClick={saveProfile} className="w-full mt-6 py-4 bg-[#FFB0B0] text-white rounded-full font-bold shadow-md">시작하기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
