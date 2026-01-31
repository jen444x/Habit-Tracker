/**
 * API helper functions for connecting React to Flask backend
 */

const API_BASE = '/api';

// ============ Types ============

export interface User {
  id: number;
  username: string;
  timezone: string;
}

export interface Habit {
  id: number;
  title: string;
  body: string;
  challenge_id: number | null;
  display_order: number;
  completed: boolean;
  created_at: string | null;
  week_logs?: string[];
  habit_created_date?: string;
}

export interface HabitStats {
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completion_dates: string[];
}

export interface Challenge {
  id: number;
  title: string;
  created_at: string | null;
}

interface ApiError {
  error: string;
}

// ============ Helper ============

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for session cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Request failed');
  }

  return data as T;
}

// ============ Auth ============

export async function register(username: string, password: string) {
  return apiRequest<{ success: boolean; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string) {
  return apiRequest<{ success: boolean; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser() {
  return apiRequest<{ user: User | null }>('/auth/me');
}

// ============ Habits ============

export async function getHabits(date?: string, challengeId?: number) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (challengeId) params.set('challenge_id', String(challengeId));

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<{
    habits: Habit[];
    selected_date: string;
    today: string;
  }>(`/habits${query}`);
}

export async function getHabit(id: number) {
  return apiRequest<{
    habit: Habit;
    stats: HabitStats;
    challenge: Challenge | null;
  }>(`/habits/${id}`);
}

export async function createHabit(data: {
  title: string;
  body?: string;
  challenge_id?: number | null;
}) {
  return apiRequest<{ habit: Habit }>('/habits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHabit(
  id: number,
  data: { title: string; body?: string; challenge_id?: number | null }
) {
  return apiRequest<{ habit: Habit }>(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHabit(id: number) {
  return apiRequest<{ success: boolean }>(`/habits/${id}`, {
    method: 'DELETE',
  });
}

export async function completeHabit(id: number, date?: string) {
  return apiRequest<{ success: boolean; date: string }>(
    `/habits/${id}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ date }),
    }
  );
}

export async function undoCompleteHabit(id: number, date?: string) {
  return apiRequest<{ success: boolean; date: string }>(`/habits/${id}/undo`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
}

export async function moveHabit(id: number, direction: 'up' | 'down') {
  return apiRequest<{ success: boolean }>(`/habits/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ direction }),
  });
}

// ============ Challenges ============

export async function getChallenges() {
  return apiRequest<{ challenges: Challenge[] }>('/challenges');
}

export async function createChallenge(title: string) {
  return apiRequest<{ challenge: Challenge }>('/challenges', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function deleteChallenge(id: number) {
  return apiRequest<{ success: boolean }>(`/challenges/${id}`, {
    method: 'DELETE',
  });
}
