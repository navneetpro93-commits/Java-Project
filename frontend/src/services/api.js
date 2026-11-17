// API service connecting React Frontend to FinGuard Java HTTP Server

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    // If proxied fetch failed (e.g., if Vite proxy isn't hitting backend directly), try direct port 8080 fallback
    if (BASE_URL === '/api' && !options._retried) {
      try {
        const directRes = await fetch(`http://localhost:8080/api${path}`, {
          ...config,
          headers: { 'Content-Type': 'application/json' },
        });
        const directData = await directRes.json().catch(() => ({}));
        if (!directRes.ok) {
          throw new Error(directData.error || `HTTP ${directRes.status}`);
        }
        return directData;
      } catch (fallbackErr) {
        throw new Error(err.message || 'Cannot connect to FinGuard Java server');
      }
    }
    throw err;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getOverview: () => request('/overview'),
  
  login: (customerId, pin) => 
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ customerId, pin }),
    }),

  createCustomer: (name, pin) =>
    request('/customers', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    }),

  createAccount: (customerId, type, opening) =>
    request('/accounts', {
      method: 'POST',
      body: JSON.stringify({ customerId, type, opening: Number(opening) }),
    }),

  move: ({ type, fromAccount, toAccount, amount, purpose }) =>
    request('/move', {
      method: 'POST',
      body: JSON.stringify({
        type: (type || '').toUpperCase(),
        fromAccount: fromAccount || '',
        toAccount: toAccount || '',
        amount: Number(amount),
        purpose: purpose || 'Transfer',
      }),
    }),

  getStatement: (account, sort = 'date') =>
    request(`/statement?account=${encodeURIComponent(account)}&sort=${encodeURIComponent(sort)}`),

  getSpending: (account) =>
    request(`/spending?account=${encodeURIComponent(account)}`),

  freeze: (account, pin) =>
    request('/freeze', {
      method: 'POST',
      body: JSON.stringify({ account, pin }),
    }),

  unfreeze: (account, pin, phrase = 'UNFREEZE') =>
    request('/unfreeze', {
      method: 'POST',
      body: JSON.stringify({ account, pin, phrase }),
    }),

  cancelCooldown: (id) =>
    request('/cooldown/cancel', {
      method: 'POST',
      body: JSON.stringify({ id: Number(id) }),
    }),

  runRaceLab: () =>
    request('/labs/race', { method: 'POST' }),

  runPriorityLab: () =>
    request('/labs/priority', { method: 'POST' }),

  runFreezeLab: () =>
    request('/labs/freeze', { method: 'POST' }),
};
