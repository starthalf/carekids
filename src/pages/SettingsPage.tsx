import { User, Bell, Shield, HelpCircle, ChevronRight, LogOut } from 'lucide-react';
import { useChildData } from '../contexts/ChildDataContext';
import { children } from '../data/mockData';

const menuItems = [
  { icon: Bell, label: '알림 설정', description: '푸시 알림 및 리마인더' },
  { icon: Shield, label: '개인정보 보호', description: '데이터 관리 및 보안' },
  { icon: HelpCircle, label: '도움말', description: 'FAQ 및 문의하기' },
];

export default function SettingsPage() {
  const { currentChild, setCurrentChild } = useChildData();

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="py-3">
        <h1 className="text-xl font-bold text-gray-800">설정</h1>
        <p className="text-sm text-gray-500 mt-1">앱 설정 및 프로필 관리</p>
      </header>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-500 mb-3">자녀 선택</h2>
        <div className="flex gap-3">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setCurrentChild(child)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                currentChild.id === child.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-primary-100">
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-800 text-sm">{child.name}</p>
                <p className="text-xs text-gray-500">{child.grade}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">학부모 계정</p>
            <p className="text-sm text-gray-500">parent@email.com</p>
          </div>
        </div>

        {menuItems.map((item, index) => (
          <button
            key={item.label}
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

      <button className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">로그아웃</span>
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Parents Insight Dashboard v1.0.0
      </p>
    </div>
  );
}
