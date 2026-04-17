(function bootstrapLocalDemoAuth() {
  function toBase64Url(value) {
    return btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  function buildFakeJwt(nowSeconds, ttlSeconds) {
    var header = { alg: 'HS256', typ: 'JWT' };
    var payload = {
      aud: 'authenticated',
      exp: nowSeconds + ttlSeconds,
      iat: nowSeconds,
      sub: 'local-demo-user',
      email: 'demo@local.app',
      phone: '',
      role: 'authenticated',
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: { full_name: 'Demo User', name: 'Demo User' },
      aal: 'aal1',
      amr: [{ method: 'oauth', timestamp: nowSeconds }],
      session_id: 'local-session-id',
      is_anonymous: false,
    };

    return toBase64Url(header) + '.' + toBase64Url(payload) + '.local-demo-signature';
  }

  try {
    var now = Math.floor(Date.now() / 1000);
    var ttl = 60 * 60 * 24 * 30;
    var storageKey = 'sb-auth-auth-token';
    var userStorageKey = storageKey + '-user';

    var existingRaw = localStorage.getItem(storageKey);
    var keepExisting = false;

    if (existingRaw) {
      try {
        var existing = JSON.parse(existingRaw);
        if (existing && existing.access_token && Number(existing.expires_at || 0) > now + 120) {
          keepExisting = true;
        }
      } catch (_ignore) {
        keepExisting = false;
      }
    }

    if (keepExisting) {
      return;
    }

    var accessToken = buildFakeJwt(now, ttl);
    var user = {
      id: 'local-demo-user',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'demo@local.app',
      email_confirmed_at: new Date(now * 1000).toISOString(),
      phone: '',
      confirmed_at: new Date(now * 1000).toISOString(),
      last_sign_in_at: new Date(now * 1000).toISOString(),
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: {
        full_name: 'Demo User',
        name: 'Demo User',
      },
      identities: [],
      created_at: new Date(now * 1000).toISOString(),
      updated_at: new Date(now * 1000).toISOString(),
      is_anonymous: false,
    };

    var session = {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: ttl,
      expires_at: now + ttl,
      refresh_token: 'local-demo-refresh-token',
      user: user,
    };

    localStorage.setItem(storageKey, JSON.stringify(session));
    localStorage.setItem(userStorageKey, JSON.stringify({ user: user }));
  } catch (_err) {
    // Ignore local boot errors so the app can still try normal auth.
  }
})();
