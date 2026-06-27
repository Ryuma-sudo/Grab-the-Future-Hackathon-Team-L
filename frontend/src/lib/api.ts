const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: ApiUser;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiFetch<ApiUser>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
