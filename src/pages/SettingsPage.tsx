import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, HelpCircle, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StudentPhoto from '../components/avatar/StudentPhoto';

const menuItems = [
  { icon: Shield, label: '개인정보 보호', description: '데이터 관리 및 보안', path: '/settings/privacy' },
  { icon: HelpCircle, label: '도움말', description: 'FAQ 및 문의하기', path: '/settings/help' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { parent, myAcademies, selectedKey, selectAcademy, signOut } = useAuth();

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await signOut();
    navigate('/login');
  };

  const parentItems = myAcademies.filter((a) => a.source === 'parent');
  const ownerItems = myAcademies.filter((a) => a.source === 'owner_preview');

  let sectionLabel = '';
  let sectionHint = '';
  if (parentItems.length > 0 && ownerItems.length === 0) {
    sectionLabel = `우리 아이 (${parentItems.length})`;
    sectionHint = '자녀를 선택하면 그 아이의 주간 리포트를 봅니다';
  } else if (ownerItems.length > 0 && parentItems.length === 0) {
    sectionLabel = `우리 학원 학생 (${ownerItems.length})`;
    sectionHint = '학원장으로서 부모님이 보시는 화면을 미리 확인합니다';
  } else {
    sectionLabel = `연결된 자녀 · 학원 학생 (${myAcademies.length})`;
    sectionHint = '본인 자녀 + 원장 미리보기 학생이 함께 있습니다';
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="py-3">
        <h1 className="text-xl font-bold text-gray-800">설정</h1>
        <p className="text-sm text-gray-500 mt-1">앱 설정 및 프로필 관리</p>
      </header>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-700">{sectionLabel}</h2>
        <p className="text-xs text-gray-400 mt-1 mb-3">{sectionHint}</p>
        {myAcademies.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">연결된 학원이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {myAcademies.map((a) => (
              <button
                key={a.parentStudentId}
                onClick={() => selectAcademy(a.parentStudentId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  a.parentStudentId === selectedKey
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <StudentPhoto
                  avatar={a.studentAvatar}
                  seed={a.studentId}
                  alt={a.studentName}
                  className="w-12 h-12 rounded-full bg-gray-100 ring-2 ring-offset-2 ring-primary-100 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{a.studentName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {a.academyName}
                    {a.source === 'owner_preview' && (
                      <span className="ml-1 text-[10px] text-amber-600">· 원장 미리보기</span>
                    )}
                  </p>
                </div>
                {a.parentStudentId === selectedKey && (
                  <Check className="w-5 h-5 text-primary-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{parent?.name || '학부모'}</p>
            <p className="text-sm text-gray-500 truncate">{parent?.email}</p>
          </div>
        </div>

        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">로그아웃</span>
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        키즈위크 학부모 v1.0.0
      </p>
    </div>
  );
}