import { useState } from 'react';
import { User, Lock, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { id, password });
    // 여기에 로그인 로직 추가
  };

  return (
    // 전체 배경 (AppLayout과 동일한 그라디언트)
    <div className="h-screen w-screen flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      
      {/* 모바일 컨테이너 */}
      <div className="w-full max-w-[480px] h-full bg-white/50 backdrop-blur-sm flex flex-col relative shadow-xl px-6">
        
        {/* 상단 여백 및 로고 영역 */}
        <div className="flex-1 flex flex-col justify-center items-center -mt-20">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-primary-600">
            {/* 로고 아이콘 자리 (임시로 텍스트나 아이콘 사용) */}
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">도비종합학원</h1>
          <p className="text-gray-500 text-sm">학부모님, 환영합니다!</p>
        </div>

        {/* 로그인 폼 영역 */}
        <div className="w-full mb-12">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* 아이디 입력 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                placeholder="아이디"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                placeholder="비밀번호"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
            >
              <span>로그인하기</span>
              <ChevronRight className="w-4 h-4 opacity-80" />
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
            <button className="hover:text-primary-600 transition-colors">아이디 찾기</button>
            <div className="w-[1px] h-3 bg-gray-300"></div>
            <button className="hover:text-primary-600 transition-colors">비밀번호 찾기</button>
            <div className="w-[1px] h-3 bg-gray-300"></div>
            <button className="hover:text-primary-600 transition-colors font-medium">회원가입</button>
          </div>
        </div>

        {/* 하단 저작권/정보 */}
        <div className="pb-8 text-center">
          <p className="text-xs text-gray-400">
            © 2024 CareKids. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}