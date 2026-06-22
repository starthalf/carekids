import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mapParent } from '../lib/mappers';
import type { Parent } from '../types';

export interface ParentAcademy {
  parentStudentId: string;
  academyId: string;
  academyName: string;
  studentId: string;
  studentName: string;
  studentGrade: number;
  studentAvatar: string;
  relationship: string;
  source: 'parent' | 'owner_preview';
}

interface AuthContextType {
  session: Session | null;
  parent: Parent | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  myAcademies: ParentAcademy[];
  selectedKey: string | null;
  selectAcademy: (parentStudentId: string) => void;
  currentAcademy: ParentAcademy | null;
  isOwnerPreview: boolean;
  identityLoaded: boolean;   // 백그라운드 정체성 로딩 완료 여부

  signUpFromInvite: (params: { token: string; name: string; email: string; password: string; phone?: string }) => Promise<{ error?: string }>;
  acceptInviteForExistingParent: (token: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SELECTED_KEY = 'parents_selected_key';

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
  // 백그라운드 정체성 로딩이 끝났는지. 끝나기 전엔 session만으로 인증 인정(깜빡임 방지),
  // 끝난 후엔 실제 parent/owner 여부로 최종 판정.
  const [identityLoaded, setIdentityLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('[AUTH] init start');
      try {
        // getSession에 3초 timeout — PWA에서 토큰 갱신이 매달리는 것 방지
        const sessionPromise = supabase.auth.getSession();
        const sessTimeout = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => {
            console.warn('[AUTH] getSession timeout 3s');
            resolve({ data: { session: null } });
          }, 3000)
        );
        const { data } = await Promise.race([sessionPromise, sessTimeout]);
        console.log('[AUTH] getSession done, user:', data.session?.user?.id);
        setSession(data.session);

        // ⚡ 세션 확인 즉시 화면 진입 (데이터 로딩 안 기다림)
        setIsLoading(false);
        console.log('[AUTH] init - session resolved, entering app');

        if (data.session) {
          loadIdentityAndAcademies(data.session.user.id).catch(err =>
            console.error('[AUTH] background load error:', err)
          );
        }
      } catch (err) {
        console.error('[AUTH] init error:', err);
        setIsLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[AUTH] state change:', event);

      // INITIAL_SESSION은 init()에서 이미 처리하므로 무시.
      if (event === 'INITIAL_SESSION') {
        return;
      }

      setSession(newSession);
      if (newSession) {
        // 로그인 직후에도 화면은 즉시 진입 (데이터는 백그라운드).
        // ⚠️ supabase-js 데드락 방지: onAuthStateChange 콜백 안에서 직접 await하지 않고
        // setTimeout(0)으로 디퍼 — auth lock 해제 후 실행.
        setIsLoading(false);
        const userId = newSession.user.id;
        setTimeout(() => {
          loadIdentityAndAcademies(userId).catch(err =>
            console.error('[AUTH] state change load error:', err)
          );
        }, 0);
      } else {
        setParent(null);
        setIsOwnerAccount(false);
        setMyAcademies([]);
        setSelectedKey(null);
        setIdentityLoaded(false);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadIdentityAndAcademies = async (authUserId: string) => {
    console.log('[LOAD] identity query start');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('identity query timeout 6s')), 6000)
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
        const parentStudentIds = new Set(parentAcademies.map(p => p.studentId));
        ownerAcademies = ownerAcademies.filter(o => !parentStudentIds.has(o.studentId));
      }

      // 최종 합치기
      const combined = [...parentAcademies, ...ownerAcademies];
      setMyAcademies(combined);

      // selectedKey 복원
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
    } finally {
      // 정체성 로딩 완료 (성공/실패 무관). 이후 isAuthenticated가 실제 값으로 판정됨.
      setIdentityLoaded(true);
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
    const newKey = (await getParentStudentIdForStudent(parentRow.id, invite.student_id)) || null;
    if (newKey) selectAcademy(newKey);
    return {};
  };

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

  // 인증 판정:
  //  - 정체성 로딩 전(identityLoaded=false): session만 있으면 인증 인정 → 깜빡임 방지,
  //    즉시 홈 진입. 데이터는 백그라운드로 채워짐.
  //  - 정체성 로딩 후(identityLoaded=true): 실제 parent/owner 여부로 최종 판정.
  //    (둘 다 아니면 로그인 화면으로)
  const isAuthenticated = !!session && (!identityLoaded || !!parent || isOwnerAccount);

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
        identityLoaded,
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