import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

  // 중복 호출 방지: 이미 load한 userId 기록 + 현재 진행 중인 load Promise 캐시
  const loadedUserIdRef = useRef<string | null>(null);
  const inflightLoadRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      console.log('[AUTH] init start');
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        console.log('[AUTH] getSession done, user:', data.session?.user?.id);
        setSession(data.session);
        if (data.session) {
          await loadIdentityAndAcademies(data.session.user.id);
        }
      } catch (err) {
        console.error('[AUTH] init error:', err);
      } finally {
        if (!cancelled) {
          console.log('[AUTH] init finally');
          setIsLoading(false);
        }
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AUTH] state change:', event);

      // INITIAL_SESSION은 init()에서 이미 처리. 무시.
      // (자동 로그인 시 중복 호출이 발생해 화면 진입이 느려지는 주요 원인)
      if (event === 'INITIAL_SESSION') {
        return;
      }

      setSession(newSession);
      if (newSession) {
        // 같은 user_id면 이미 load됐는지 확인
        if (loadedUserIdRef.current === newSession.user.id) {
          console.log('[AUTH] skip duplicate load for same user');
          return;
        }
        try {
          await loadIdentityAndAcademies(newSession.user.id);
        } catch (err) {
          console.error('[AUTH] state change error:', err);
        }
      } else {
        loadedUserIdRef.current = null;
        setParent(null);
        setIsOwnerAccount(false);
        setMyAcademies([]);
        setSelectedKey(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadIdentityAndAcademies = async (authUserId: string): Promise<void> => {
    // 이미 같은 user로 load 중이면 그 Promise를 공유 (race 방지)
    if (inflightLoadRef.current && loadedUserIdRef.current === authUserId) {
      return inflightLoadRef.current;
    }

    const promise = (async () => {
      console.log('[LOAD] identity query start');
      try {
        // parent + teacher 두 정체성을 병렬 조회 (timeout 없이 — 자연스러운 응답 시간 활용)
        const [parentResult, teacherResult] = await Promise.all([
          supabase.from('parents').select('*').eq('auth_user_id', authUserId).maybeSingle(),
          supabase.from('teachers').select('id, academy_id, name, role').eq('auth_user_id', authUserId).maybeSingle(),
        ]);

        const parentRow = parentResult?.data || null;
        const teacherRow = teacherResult?.data || null;
        const isOwner = teacherRow?.role === 'owner';

        console.log('[LOAD] parent:', !!parentRow, 'teacher owner:', isOwner);

        if (!parentRow && !isOwner) {
          setParent(null);
          setIsOwnerAccount(false);
          setMyAcademies([]);
          loadedUserIdRef.current = authUserId;
          return;
        }

        // parent + owner 정체성 조회를 병렬화 (직렬 처리 → 병렬로)
        let parentAcademies: ParentAcademy[] = [];
        let ownerAcademies: ParentAcademy[] = [];

        const parentPromise = parentRow
          ? (async () => {
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
            })()
          : Promise.resolve();

        const ownerPromise = (isOwner && teacherRow)
          ? (async () => {
              const [academyRes, studentRes] = await Promise.all([
                supabase.from('academies').select('id, name').eq('id', teacherRow.academy_id).maybeSingle(),
                supabase.from('students').select('id, name, grade, avatar').eq('academy_id', teacherRow.academy_id).order('grade').order('name'),
              ]);

              const academyName = academyRes.data?.name || '학원';
              ownerAcademies = (studentRes.data || []).map((s: any) => ({
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
            })()
          : Promise.resolve();

        await Promise.all([parentPromise, ownerPromise]);

        if (!parentRow) setParent(null);
        setIsOwnerAccount(isOwner);

        // 본인 자녀와 중복되는 학생은 owner_preview에서 제외
        const parentStudentIds = new Set(parentAcademies.map(p => p.studentId));
        ownerAcademies = ownerAcademies.filter(o => !parentStudentIds.has(o.studentId));

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

        loadedUserIdRef.current = authUserId;
        console.log('[LOAD] done');
      } catch (err) {
        console.error('[LOAD] error:', err);
        setParent(null);
        setIsOwnerAccount(false);
        setMyAcademies([]);
      } finally {
        inflightLoadRef.current = null;
      }
    })();

    inflightLoadRef.current = promise;
    return promise;
  };

  const selectAcademy = useCallback((parentStudentId: string) => {
    setSelectedKey(parentStudentId);
    localStorage.setItem(SELECTED_KEY, parentStudentId);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      // 명시적 refresh: 캐시 무효화하고 재조회
      loadedUserIdRef.current = null;
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

    loadedUserIdRef.current = null;
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

    loadedUserIdRef.current = null;
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
    loadedUserIdRef.current = null;
    await supabase.auth.signOut();
  };

  const currentAcademy = myAcademies.find(a => a.parentStudentId === selectedKey) || null;
  const isOwnerPreview = currentAcademy?.source === 'owner_preview';

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