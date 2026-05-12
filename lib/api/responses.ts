type Body = Record<string, unknown>;

function json(body: Body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const respond = {
  ok: (data: Body = {}, status = 200) => json({ data }, status),
  created: (data: Body = {}) => json({ data }, 201),
  badRequest: (message: string, details?: unknown) => json({ error: message, details }, 400),
  unauthorized: (message = "Unauthorized") => json({ error: message }, 401),
  forbidden: (message = "Forbidden") => json({ error: message }, 403),
  notFound: (message = "Not found") => json({ error: message }, 404),
  unprocessable: (message: string, details?: unknown) => json({ error: message, details }, 422),
  serverError: (message = "Server error", details?: unknown) => json({ error: message, details }, 500),
};
