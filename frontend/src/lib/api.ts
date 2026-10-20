const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface NestErrorBody {
  message?: unknown;
}

function extractErrorMessage(text: string, status: number, statusText: string): string {
  if (!text) {
    return statusText || `Error ${status}`;
  }

  let body: NestErrorBody | null = null;
  try {
    body = JSON.parse(text) as NestErrorBody;
  } catch {
    body = null;
  }

  if (!body || body.message === undefined) {
    return statusText || `Error ${status}`;
  }

  const { message } = body;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (Array.isArray(message)) {
    const parts = message.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (parts.length > 0) {
      return parts.join(" · ");
    }
  }
  return statusText || `Error ${status}`;
}

async function toApiError(response: Response): Promise<ApiError> {
  const text = await response.text().catch(() => "");
  return new ApiError(
    extractErrorMessage(text, response.status, response.statusText),
    response.status,
  );
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Respuesta no válida del servidor", response.status);
  }
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Respuesta no válida del servidor", response.status);
  }
}
