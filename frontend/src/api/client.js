function getCsrf() {
  const m = document.cookie.match(/csrftoken=([^;]+)/);
  return m ? m[1] : '';
}

export async function api(url, options = {}) {
  const headers = { ...options.headers };
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['X-CSRFToken'] = getCsrf();
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  return res;
}

export async function apiJson(url, options = {}) {
  const res = await api(url, options);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
