// src/components/admin/GenerateInsightsButton.tsx
// 학원용 앱에 추가. 디버깅 + 수동 트리거용.
// SettingsPage 또는 학생 관리 페이지에 배치.

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function GenerateInsightsButton() {
  const { academy, isOwner } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOwner || !academy) return null;

  const trigger = async () => {
    if (!confirm('이번 주 리포트를 지금 생성할까요? (모든 학생 대상, 1-2분 소요)')) return;

    setIsGenerating(true);
    setResult(null);

    try {
      // Edge Function 직접 호출
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult({ success: false, message: '로그인 정보 없음' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-weekly-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'academy',
            academy_id: academy.id,
            week_offset: 0,
            generated_by: 'manual',
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `완료! ${data.generated}명 생성, ${data.errors}건 실패`,
        });
      } else {
        setResult({ success: false, message: data.error || '실패' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">AI 주간 리포트</h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        매주 일요일 새벽 자동 생성됩니다. 지금 수동으로 생성하려면 아래 버튼을 누르세요.
      </p>
      <button
        onClick={trigger}
        disabled={isGenerating}
        className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-600 disabled:bg-gray-300"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            생성 중... (1-2분)
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            이번 주 리포트 생성하기
          </>
        )}
      </button>
      {result && (
        <p className={`text-xs mt-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}