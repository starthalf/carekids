import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mapParent } from '../lib/mappers';
import type { Parent } from '../types';

// ============================================================
// 타입
// ============================================================
//
// 부모용 앱은 두 가지 종류의 정체성을 동시에 지원:
//   1. 'parent'        : 정상적인 학부모. parents 테이블 매칭.
//   2. 'owner_preview' : 학원장이 본인 학원 학부모 화면을 미리보기. teachers role=owner.
//
// 한 사용자가 둘 다일 수 있음 (학원장이 본인 학원에 자녀를 보내는 경우).
// 그 경우 본인 자녀(parent)가 먼저 정렬되고, 학원장 미리보기 학생들이 뒤에 붙음.
//
// myAcademies 리스트의 각 항목은 parentStudentId를 unique key로 사용.
// 학원장 모드 항목의 parentStudentId는 'owner__{academyId}__{studentId}' 형태의 가상 ID.
// ============================================================

export interface ParentAcademy {
  parentStudentId: string;          // unique key. owner_preview면 'owner__...' prefix
  academyId: string;
  academyName: string;
  studentId: string;
  studentName: string;
  studentGrade: number;
  studentAvatar: string;
  relationship: string;             // owner_preview면 '원장 미리보기'
  source: 'parent' | 'owner_preview';
}

interface AuthContextType {
  session: Session | null;
  parent: Parent | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  myAcademies: ParentAcademy[];
  selectedKey: string | null;        // 이전 selectedAcademyId 대체. parentStudentId 사용.
  selectAcademy: (parentStudentId: string) => void;
  currentAcademy: ParentAcademy | null;
  isOwnerPreview: boolean;           // 지금 보고 있는 게 학원장 모드인가

  signUpFromInvite: (params: { token: string; name: string; email: string; password: string; phone?: string }) => Promise<{ error?: string }>;
  acceptInviteForExistingParent: (token: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SELECTED_KEY = 'parents_selected_key';   // 이전 키 'parents_selected_academy'와 다름

function ownerVirtualKey(academyId: string, studentId: string): string {
  return `owner__${academyId}__${studentId}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [isOwnerAccount, setIsOwnerAccount] = useState<boolean>(false);
  const [myAcademies, setMyAcademies] = useState<ParentAcademy[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log('[AUTH] init start');
      try {
        const { data } = await supabase.auth.getSession();
        console.log('[AUTH] getSession done, user:', data.session?.user?.id);
        setSession(data.session);
        if (data.session) {
          await loadIdentityAndAcademies(data.session.user.id);
        }
      } catch (err) {
        console.error('[AUTH] init error:', err);
      } finally {
        console.log('[AUTH] init finally');
        setIsLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AUTH] state change:', event);
      setSession(newSession);
      if (newSession) {
        try {
          await loadIdentityAndAcademies(newSession.user.id);
        } catch (err) {
          console.error('[AUTH] state change error:', err);
        }
      } else {
        setParent(null);
        setIsOwnerAccount(false);
        setMyAcademies([]);
        setSelectedKey(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadIdentityAndAcademies = async (authUserId: string) => {
    console.log('[LOAD] identity query start');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('identity query timeout 10s')), 10000)
    );

    try {
      // parent + teacher 두 정체성을 병렬 조회
      const parentPromise = supabase
        .from('parents')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      const teacherPromise = supabase
        .from('teachers')
        .select('id, academy_id, name, role')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      const [parentResult, teacherResult]: any = await Promise.race([
        Promise.all([parentPromise, teacherPromise]),
        timeout,
      ]);

      const parentRow = parentResult?.data || null;
      const teacherRow = teacherResult?.data || null;
      const isOwner = teacherRow?.role === 'owner';

      console.log('[LOAD] parent:', !!parentRow, 'teacher owner:', isOwner);

      // 둘 다 없으면 학부모도 학원장도 아님 → 빈 상태
      if (!parentRow && !isOwner) {
        setParent(null);
        setIsOwnerAccount(false);
        setMyAcademies([]);
        return;
      }

      // 1. parent 정체성 처리
      let parentAcademies: ParentAcademy[] = [];
      if (parentRow) {
        const p = mapParent(parentRow);
        setParent(p);

        const { data: psRows } = await supabase
          .from('parent_students')
          .select(`
            id, academy_id, student_id, relationship, status,
            students(name, grade, avatar),
            academies(name)
          `)
          .eq('parent_id', p.id)
          .eq('status', 'active');

        parentAcademies = (psRows || []).map((r: any) => ({
          parentStudentId: r.id,
          academyId: r.academy_id,
          academyName: r.academies?.name || '학원',
          studentId: r.student_id,
          studentName: r.students?.name || '자녀',
          studentGrade: r.students?.grade || 0,
          studentAvatar: r.students?.avatar || '',
          relationship: r.relationship,
          source: 'parent' as const,
        }));
      } else {
        setParent(null);
      }

      // 2. 학원장 정체성 처리
      let ownerAcademies: ParentAcademy[] = [];
      setIsOwnerAccount(isOwner);
      if (isOwner && teacherRow) {
        // 본인 학원 정보
        const { data: academyRow } = await supabase
          .from('academies')
          .select('id, name')
          .eq('id', teacherRow.academy_id)
          .maybeSingle();

        // 본인 학원 모든 학생
        const { data: studentRows } = await supabase
          .from('students')
          .select('id, name, grade, avatar')
          .eq('academy_id', teacherRow.academy_id)
          .order('grade')
          .order('name');

        const academyName = academyRow?.name || '학원';

        ownerAcademies = (studentRows || []).map((s: any) => ({
          parentStudentId: ownerVirtualKey(teacherRow.academy_id, s.id),
          academyId: teacherRow.academy_id,
          academyName,
          studentId: s.id,
          studentName: s.name,
          studentGrade: s.grade,
          studentAvatar: s.avatar || '',
          relationship: '원장 미리보기',
          source: 'owner_preview' as const,
        }));

        // 본인 자녀와 중복되는 학생은 owner_preview에서 제외
        // (이미 parent로 들어가있으면 거기서 본다)
        const parentStudentIds = new Set(parentAcademies.map(p => p.studentId));
        ownerAcademies = ownerAcademies.filter(o => !parentStudentIds.has(o.studentId));
      }

      // 최종 합치기: 본인 자녀 먼저, 학원장 미리보기 학생 뒤에
      const combined = [...parentAcademies, ...ownerAcademies];
      setMyAcademies(combined);

      // selectedKey 복원: 이전 선택이 여전히 유효하면 유지, 아니면 첫 항목
      const saved = localStorage.getItem(SELECTED_KEY);
      const validSaved = combined.find(a => a.parentStudentId === saved);
      if (validSaved) {
        setSelectedKey(saved);
      } else if (combined.length > 0) {
        const firstKey = combined[0].parentStudentId;
        setSelectedKey(firstKey);
        localStorage.setItem(SELECTED_KEY, firstKey);
      } else {
        setSelectedKey(null);
      }
    } catch (err) {
      console.error('[LOAD] error:', err);
      if (err instanceof Error && err.message.includes('timeout')) {
        console.warn('[LOAD] timeout - keeping existing state');
        return;
      }
      setParent(null);
      setIsOwnerAccount(false);
      setMyAcademies([]);
    }
  };

  const selectAcademy = useCallback((parentStudentId: string) => {
    setSelectedKey(parentStudentId);
    localStorage.setItem(SELECTED_KEY, parentStudentId);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await loadIdentityAndAcademies(data.session.user.id);
    }
  }, []);

  const signUpFromInvite = async (params: { token: string; name: string; email: string; password: string; phone?: string }) => {
    const { token, name, email, password, phone } = params;

    const { data: invite, error: inviteErr } = await supabase
      .from('parent_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle();
    if (inviteErr || !invite) return { error: '유효하지 않은 초대 링크입니다' };
    if (new Date(invite.expires_at) < new Date()) return { error: '만료된 초대 링크입니다' };

    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr || !authData.user) return { error: authErr?.message || '가입 실패' };

    const userId = authData.user.id;

    const { data: newParent, error: pErr } = await supabase
      .from('parents')
      .insert({ auth_user_id: userId, name, email, phone: phone || null })
      .select()
      .single();
    if (pErr || !newParent) return { error: `부모 정보 생성 실패: ${pErr?.message}` };

    const { error: psErr } = await supabase
      .from('parent_students')
      .upsert(
        {
          parent_id: newParent.id,
          student_id: invite.student_id,
          academy_id: invite.academy_id,
          relationship: invite.relationship,
          status: 'active',
          removed_at: null,
        },
        { onConflict: 'parent_id,student_id' }
      );
    if (psErr) return { error: psErr.message };

    await supabase
      .from('parent_invites')
      .update({ status: 'used', used_by_parent_id: newParent.id, used_at: new Date().toISOString() })
      .eq('id', invite.id);

    await loadIdentityAndAcademies(userId);
    return {};
  };

  const acceptInviteForExistingParent = async (token: string) => {
    const { data: invite, error: inviteErr } = await supabase
      .from('parent_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle();
    if (inviteErr || !invite) return { error: '유효하지 않은 초대' };
    if (new Date(invite.expires_at) < new Date()) return { error: '만료된 초대' };

    const sessionData = await supabase.auth.getSession();
    const userId = sessionData.data.session?.user.id;
    if (!userId) return { error: '로그인 정보 없음' };

    const { data: parentRow } = await supabase
      .from('parents')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();
    if (!parentRow) return { error: '부모 정보 없음' };

    const { error: psErr } = await supabase
      .from('parent_students')
      .upsert(
        {
          parent_id: parentRow.id,
          student_id: invite.student_id,
          academy_id: invite.academy_id,
          relationship: invite.relationship,
          status: 'active',
          removed_at: null,
        },
        { onConflict: 'parent_id,student_id' }
      );
    if (psErr) return { error: psErr.message };

    await supabase
      .from('parent_invites')
      .update({ status: 'used', used_by_parent_id: parentRow.id, used_at: new Date().toISOString() })
      .eq('id', invite.id);

    await loadIdentityAndAcademies(userId);
    // 새로 추가된 항목 선택
    const newKey = (await getParentStudentIdForStudent(parentRow.id, invite.student_id)) || null;
    if (newKey) selectAcademy(newKey);
    return {};
  };

  // helper: 초대 수락 후 새로 생긴 parent_student row의 id를 찾기 위함
  const getParentStudentIdForStudent = async (parentId: string, studentId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('parent_students')
      .select('id')
      .eq('parent_id', parentId)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .maybeSingle();
    return data?.id || null;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    localStorage.removeItem(SELECTED_KEY);
    await supabase.auth.signOut();
  };

  const currentAcademy = myAcademies.find(a => a.parentStudentId === selectedKey) || null;
  const isOwnerPreview = currentAcademy?.source === 'owner_preview';

  // 인증: parent 또는 owner 둘 중 하나라도 있으면 통과
  const isAuthenticated = !!session && (!!parent || isOwnerAccount);

  return (
    <AuthContext.Provider
      value={{
        session,
        parent,
        isAuthenticated,
        isLoading,
        myAcademies,
        selectedKey,
        selectAcademy,
        currentAcademy,
        isOwnerPreview,
        signUpFromInvite,
        acceptInviteForExistingParent,
        signIn,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}