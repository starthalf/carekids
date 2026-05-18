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
}

interface AuthContextType {
  session: Session | null;
  parent: Parent | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  myAcademies: ParentAcademy[];
  selectedAcademyId: string | null;
  selectAcademy: (academyId: string) => void;
  currentAcademy: ParentAcademy | null;

  signUpFromInvite: (params: { token: string; name: string; email: string; password: string; phone?: string }) => Promise<{ error?: string }>;
  acceptInviteForExistingParent: (token: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SELECTED_ACADEMY_KEY = 'parents_selected_academy';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [myAcademies, setMyAcademies] = useState<ParentAcademy[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log('[AUTH] init start');
      try {
        const { data } = await supabase.auth.getSession();
        console.log('[AUTH] getSession done, user:', data.session?.user?.id);
        setSession(data.session);
        if (data.session) {
          await loadParentAndAcademies(data.session.user.id);
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
          await loadParentAndAcademies(newSession.user.id);
        } catch (err) {
          console.error('[AUTH] state change error:', err);
        }
      } else {
        setParent(null);
        setMyAcademies([]);
        setSelectedAcademyId(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadParentAndAcademies = async (authUserId: string) => {
    console.log('[LOAD] parent query start');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('parent query timeout 10s')), 10000)
    );

    try {
      const parentPromise = supabase
        .from('parents')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      const parentResult: any = await Promise.race([parentPromise, timeout]);
      const { data: parentRow } = parentResult;
      console.log('[LOAD] parent done', parentRow);

      if (!parentRow) {
        setParent(null);
        setMyAcademies([]);
        return;
      }
      const p = mapParent(parentRow);
      setParent(p);

      console.log('[LOAD] parent_students query start');
      const psPromise = supabase
        .from('parent_students')
        .select(`
          id, academy_id, student_id, relationship, status,
          students(name, grade, avatar),
          academies(name)
        `)
        .eq('parent_id', p.id)
        .eq('status', 'active');

      const psResult: any = await Promise.race([psPromise, timeout]);
      const { data: psRows } = psResult;
      console.log('[LOAD] parent_students done, count:', psRows?.length);

      const academies: ParentAcademy[] = (psRows || []).map((r: any) => ({
        parentStudentId: r.id,
        academyId: r.academy_id,
        academyName: r.academies?.name || '학원',
        studentId: r.student_id,
        studentName: r.students?.name || '자녀',
        studentGrade: r.students?.grade || 0,
        studentAvatar: r.students?.avatar || '',
        relationship: r.relationship,
      }));

      setMyAcademies(academies);

      const saved = localStorage.getItem(SELECTED_ACADEMY_KEY);
      const validSaved = academies.find(a => a.academyId === saved);
      if (validSaved) {
        setSelectedAcademyId(saved);
      } else if (academies.length > 0) {
        setSelectedAcademyId(academies[0].academyId);
        localStorage.setItem(SELECTED_ACADEMY_KEY, academies[0].academyId);
      } else {
        setSelectedAcademyId(null);
      }
    } catch (err) {
      console.error('[LOAD] error:', err);
      if (err instanceof Error && err.message.includes('timeout')) {
        console.warn('[LOAD] timeout - keeping existing state');
        return;
      }
      setParent(null);
      setMyAcademies([]);
    }
  };

  const selectAcademy = useCallback((academyId: string) => {
    setSelectedAcademyId(academyId);
    localStorage.setItem(SELECTED_ACADEMY_KEY, academyId);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await loadParentAndAcademies(data.session.user.id);
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

    await loadParentAndAcademies(userId);
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

    selectAcademy(invite.academy_id);
    await loadParentAndAcademies(userId);
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    localStorage.removeItem(SELECTED_ACADEMY_KEY);
    await supabase.auth.signOut();
  };

  const currentAcademy = myAcademies.find(a => a.academyId === selectedAcademyId) || null;

  return (
    <AuthContext.Provider
      value={{
        session,
        parent,
        isAuthenticated: !!session && !!parent,
        isLoading,
        myAcademies,
        selectedAcademyId,
        selectAcademy,
        currentAcademy,
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
