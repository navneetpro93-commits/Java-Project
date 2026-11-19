// FinGuard Client API connecting React Frontend to Java Backend Server (Port 8080)

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer Vite proxy (/api) in development, fallback to direct Java port 8080
const PRIMARY_URL = import.meta.env.VITE_API_URL || '/api';
const DIRECT_JAVA_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Try Primary URL (Vite proxy /api)
  try {
    const res = await fetch(`${PRIMARY_URL}${path}`, {
      ...options,
      headers,
    });
    
    // If proxied response is JSON, return parsed data
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Server returned error (${res.status})`);
    }
    return data;
  } catch (primaryErr) {
    // If primary failed (e.g. Vite proxy unreachable or direct port needed), try direct port 8080
    try {
      const directRes = await fetch(`${DIRECT_JAVA_URL}${path}`, {
        ...options,
        headers,
      });
      const directData = await directRes.json().catch(() => ({}));
      if (!directRes.ok) {
        throw new Error(directData.error || `Java Server error (${directRes.status})`);
      }
      return directData;
    } catch (directErr) {
      // Both attempts failed
      throw new Error(primaryErr.message || 'Cannot connect to Java backend on http://localhost:8080');
    }
  }
}

export const api = {
  // Health & Heartbeat
  getHealth: () => request('/health'),
  getOverview: () => request('/overview'),
  
  // Authentication & Customers
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

  // Transactions & Clearing
  move: ({ type, fromAccount, toAccount, amount, purpose }) =>
    request('/move', {
      method: 'POST',
      body: JSON.stringify({
        type: (type || '').toUpperCase(),
        fromAccount: fromAccount || '',
        toAccount: toAccount || '',
        amount: Number(amount),
        purpose: purpose || 'General Banking',
      }),
    }),

  // Ledgers & Intelligence
  getStatement: (account, sort = 'date') =>
    request(`/statement?account=${encodeURIComponent(account)}&sort=${encodeURIComponent(sort)}`),

  getSpending: (account) =>
    request(`/spending?account=${encodeURIComponent(account)}`),

  // Security & Locks
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

  // Stress & Concurrency Labs
  runRaceLab: () =>
    request('/labs/race', { method: 'POST' }),

  runPriorityLab: () =>
    request('/labs/priority', { method: 'POST' }),

  runFreezeLab: () =>
    request('/labs/freeze', { method: 'POST' }),

  // Database Status
  getDbStatus: () =>
    request('/db/status'),
};
