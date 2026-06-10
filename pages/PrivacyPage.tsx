import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Database, Clock, Trash2, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="py-3 flex items-center gap-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">개인정보 보호</h1>
          <p className="text-sm text-gray-500 mt-0.5">데이터 관리 및 보안</p>
        </div>
      </header>

      {/* 우리가 보호하는 방식 */}
      <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 text-sm">우리 아이 정보는 안전합니다</h2>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              KidsInside는 학원별로 데이터를 완전히 격리하여 저장합니다. 다른 학원이 우리 학원
              데이터를 볼 수 없고, 부모님은 본인 자녀 데이터만 보입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 수집 정보 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Database className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-medium text-gray-800 text-sm">수집하는 정보</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700">필수 정보</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              학부모 이름·이메일·연락처, 자녀 이름·학년, 학원 가입 시 발급된 식별자
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">학습 활동 정보</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              학원에서 입력한 자녀의 출결·숙제·시험 점수·수업 태도 기록
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">AI 분석 결과</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              위 데이터로 매주 생성되는 5축 지표·인사이트·해시태그·부모 액션 추천
            </p>
          </div>
        </div>
      </div>

      {/* 이용 목적 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-medium text-gray-800 text-sm">이용 목적 및 보관 기간</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700">이용 목적</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              자녀의 주간 학습 인사이트 생성 및 학원-학부모 간 소통
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">보관 기간</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              학원 재학 기간 동안 보관. 학원 탈퇴 또는 계정 삭제 시 30일 이내 파기.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">제3자 제공</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              없음. AI 인사이트 생성을 위해 데이터의 일부가 OpenAI/Anthropic API로
              전달되며, 해당 처리자는 데이터를 저장하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 데이터 삭제 요청 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-medium text-gray-800 text-sm">데이터 삭제 요청</h2>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            자녀의 모든 학습 데이터·AI 분석 결과의 영구 삭제를 원하시면 아래 이메일로 요청해
            주세요. 본인 확인 후 영업일 기준 3일 이내 처리됩니다.
          </p>
          <a
            href="mailto:privacy@kidsinside.com"
            className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            <Mail className="w-3.5 h-3.5" />
            privacy@kidsinside.com
          </a>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center px-4 mt-2">
        KidsInside 개인정보 처리방침 v1.0
      </p>
    </div>
  );
}