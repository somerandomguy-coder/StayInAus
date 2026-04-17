#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'www.settledin.app');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

function readJsonSnapshot(relativePath, fallback) {
  try {
    const raw = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
    return JSON.parse(raw);
  } catch (_err) {
    return fallback;
  }
}

const occupations = readJsonSnapshot('api/occupations.html', []);
const universities = readJsonSnapshot('api/universities.html', []);

const visaCatalog = [
  { id: '500', subclass: '500', name: 'Student Visa', category: 'study', leads_to_pr: false },
  { id: '485', subclass: '485', name: 'Temporary Graduate', category: 'work', leads_to_pr: true },
  { id: '189', subclass: '189', name: 'Skilled Independent', category: 'pr', leads_to_pr: true },
  { id: '190', subclass: '190', name: 'Skilled Nominated', category: 'pr', leads_to_pr: true },
  { id: '491', subclass: '491', name: 'Skilled Work Regional', category: 'pr', leads_to_pr: true },
  { id: '186', subclass: '186', name: 'Employer Nomination Scheme', category: 'pr', leads_to_pr: true },
];

const defaultJourneyTasks = [
  {
    id: 'task-application-1',
    title: 'Confirm Passport Validity',
    category: 'application',
    section: 'application',
    subcategory: 'documents',
    completed: true,
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date('2026-03-02').toISOString(),
  },
  {
    id: 'task-application-2',
    title: 'Prepare Financial Evidence',
    category: 'application',
    section: 'application',
    subcategory: 'documents',
    completed: false,
    created_at: new Date('2026-03-03').toISOString(),
    updated_at: new Date('2026-03-03').toISOString(),
  },
  {
    id: 'task-predep-1',
    title: 'Book Temporary Accommodation',
    category: 'predeparture',
    section: 'predeparture',
    subcategory: 'housing',
    completed: false,
    created_at: new Date('2026-03-04').toISOString(),
    updated_at: new Date('2026-03-04').toISOString(),
  },
];

const state = {
  preferences: {
    id: 'pref-local-1',
    user_id: 'local-demo-user',
    onboarding_completed: true,
    onboarding_completed_at: new Date('2026-03-10').toISOString(),
    current_step: 'application',
    home_country: 'Vietnam',
    purpose: 'study',
    currently_in_australia: true,
    preferred_state: 'NSW',
    preferred_city: 'Sydney',
    visa_status: true,
    visa_type: '500',
    has_applied_visa_485: false,
    has_visa_485_granted: false,
    english_test_result: 'IELTS',
    target_university: universities[0]?.id || null,
    course: 'Software Engineering',
    course_start_date: '2024-07-01',
    course_end_date: '2026-07-22',
    study_level: 'bachelor',
    expected_arrival_date: '2026-08-01',
    purpose_details: {
      occupation_code: '261313',
      age_range: '25-32',
      english_proficiency_level: 'proficient',
      work_experience_au_years: '1',
      work_experience_overseas_years: '2',
      qualification_type: 'bachelor',
      partner_status: 'single',
      nomination_type: 'none',
      has_regional_study: false,
      has_australian_study_requirement: true,
      has_specialist_education: false,
      has_skill_assessment: true,
      has_professional_year: false,
      has_naati: false,
    },
    pr_settlement_data: {},
    work_visa_pathways: [],
    updated_at: new Date().toISOString(),
  },
  visaHistory: [
    {
      id: 'visa-history-1',
      visa_subclass: '500',
      visa_start_date: '2023-08-22',
      visa_expiry_date: '2026-07-22',
      visa_186_stream: null,
      status: 'active',
      is_current: true,
      created_at: new Date('2023-08-22').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  workVisaPathways: [],
  feedback: [],
  journey: {
    id: 'journey-local-1',
    user_id: 'local-demo-user',
    current_step: 'application',
    start_date: new Date('2026-03-01').toISOString(),
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date().toISOString(),
    completed_steps: [],
    profile: {
      visaUniversity: null,
      expectedArrivalDate: '2026-08-01',
    },
    journeyTasks: defaultJourneyTasks,
    preDepartureTasks: defaultJourneyTasks.filter((t) => t.category === 'predeparture'),
  },
  subscription: {
    plan_type: 'free',
    status: 'active',
    is_active: true,
    is_pro: false,
    current_period_end: new Date('2026-12-31').toISOString(),
    billing_cycle: null,
    stripe_price_id: null,
    cancel_at_period_end: false,
    has_scheduled_change: false,
    scheduled_billing_cycle: null,
  },
  accountDeletion: {
    is_pending: false,
    can_cancel: false,
    scheduled_deletion_at: null,
    reason: null,
  },
};

const topOccupationsCompetitive = [
  ['351311', 'Chef', 11814],
  ['241111', 'Early Childhood (Pre-primary School) Teacher', 10476],
  ['261313', 'Software Engineer', 10224],
  ['233211', 'Civil Engineer', 9301],
  ['261111', 'ICT Business Analyst', 8282],
  ['221111', 'Accountant (General)', 8252],
  ['233512', 'Mechanical Engineer', 8108],
  ['254499', 'Registered Nurses nec', 7401],
  ['241411', 'Secondary School Teacher', 7349],
  ['272511', 'Social Worker', 7210],
].map((v, i) => ({
  rank: i + 1,
  occupation_code: v[0],
  occupation_name: v[1],
  total_eois: v[2],
}));

const topOccupationsInvited = [
  ['332211', 'Painting Trades Worker', 82],
  ['331212', 'Carpenter', 60],
  ['254499', 'Registered Nurses nec', 44],
  ['261313', 'Software Engineer', 31],
  ['233211', 'Civil Engineer', 31],
  ['341111', 'Electrician (General)', 28],
  ['261111', 'ICT Business Analyst', 23],
  ['241411', 'Secondary School Teacher', 23],
  ['272511', 'Social Worker', 22],
  ['233512', 'Mechanical Engineer', 19],
].map((v, i) => ({
  rank: i + 1,
  occupation_code: v[0],
  occupation_name: v[1],
  total_invites: v[2],
}));

const topOccupationsLodged = [
  ['254499', 'Registered Nurses nec', 952],
  ['331212', 'Carpenter', 573],
  ['351311', 'Chef', 470],
  ['241411', 'Secondary School Teacher', 397],
  ['241111', 'Early Childhood (Pre-primary School) Teacher', 371],
  ['233211', 'Civil Engineer', 348],
  ['312211', 'Civil Engineering Draftsperson', 345],
  ['272511', 'Social Worker', 310],
  ['261313', 'Software Engineer', 299],
  ['261111', 'ICT Business Analyst', 281],
].map((v, i) => ({
  rank: i + 1,
  occupation_code: v[0],
  occupation_name: v[1],
  total_lodged: v[2],
}));

const stateRankingRows = [
  ['NSW', 1, 4100, 82, 952],
  ['VIC', 2, 3700, 60, 573],
  ['QLD', 3, 2900, 44, 470],
  ['WA', 4, 1800, 31, 348],
  ['SA', 5, 1600, 28, 310],
  ['TAS', 6, 980, 23, 190],
  ['ACT', 7, 820, 22, 167],
  ['NT', 8, 640, 19, 120],
].map((v) => ({ state: v[0], rank: v[1], total_eois: v[2], total_invites: v[3], total_lodged: v[4] }));

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function text(res, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (_err) {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function normalizePathwayRecord(input) {
  const source = input && typeof input === 'object' ? input : {};
  const visaIds = Array.isArray(source.visa_ids)
    ? source.visa_ids
    : Array.isArray(source.path_nodes)
      ? source.path_nodes
      : [];

  return {
    id: source.id || `pathway-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: source.user_id || state.preferences.user_id || 'local-demo-user',
    name: source.name || 'My Pathway',
    description: source.description || '',
    visa_ids: visaIds,
    path_nodes: visaIds,
    created_at: source.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function savePathway(input) {
  const next = normalizePathwayRecord(input);
  state.workVisaPathways.push(next);
  return next;
}

function updatePathway(id, input) {
  const current = state.workVisaPathways.find((p) => p.id === id);
  if (!current) {
    return null;
  }

  const next = normalizePathwayRecord({
    ...current,
    ...(input && typeof input === 'object' ? input : {}),
    id,
    created_at: current.created_at,
  });

  state.workVisaPathways = state.workVisaPathways.map((p) => (p.id === id ? next : p));
  return next;
}

function mergePreferences(input) {
  if (!input || typeof input !== 'object') {
    return state.preferences;
  }
  const next = { ...state.preferences, ...input };
  if (input.purpose_details && typeof input.purpose_details === 'object') {
    next.purpose_details = { ...state.preferences.purpose_details, ...input.purpose_details };
  }
  if (input.work_visa_pathways && Array.isArray(input.work_visa_pathways)) {
    next.work_visa_pathways = input.work_visa_pathways;
  }
  next.updated_at = new Date().toISOString();
  state.preferences = next;
  return state.preferences;
}

function getCompetitivenessResponse(urlObj, visa) {
  const points = Number(urlObj.searchParams.get('points') || '90');
  const occupationCode = urlObj.searchParams.get('occupation_code') || state.preferences.purpose_details.occupation_code;
  const occupationName = occupations.find((x) => x.anzsco_code === occupationCode)?.occupation || 'Software Engineer';
  const nominatedState = urlObj.searchParams.get('nominated_state') || state.preferences.preferred_state || 'NSW';

  return {
    data_date: new Date('2026-03-01').toISOString(),
    filters: {
      visa_subclass: visa,
      occupation_code: occupationCode,
      occupation_name: occupationName,
      nominated_state: nominatedState,
      points,
    },
    current_month: {
      month: '2026-03-01',
      submitted_eois: {
        total: 10224,
        occupation: occupationName,
        percentile: 72,
        points_distribution: {
          '65-69': 980,
          '70-74': 2100,
          '75-79': 3020,
          '80-84': 1880,
          '85-89': 1390,
          '90+': 854,
        },
      },
      invitations: {
        total: 31,
        points_distribution: {
          '65-69': 1,
          '70-74': 4,
          '75-79': 7,
          '80-84': 9,
          '85-89': 6,
          '90+': 4,
        },
      },
      lodged_eois: {
        total: 470,
        points_distribution: {
          '65-69': 35,
          '70-74': 79,
          '75-79': 105,
          '80-84': 111,
          '85-89': 82,
          '90+': 58,
        },
      },
    },
    previous_month: {
      month: '2026-02-01',
      submitted_eois: {
        total: 9800,
        occupation: occupationName,
        percentile: 70,
        points_distribution: {
          '65-69': 960,
          '70-74': 2000,
          '75-79': 2900,
          '80-84': 1770,
          '85-89': 1320,
          '90+': 850,
        },
      },
      invitations: {
        total: 28,
        points_distribution: {
          '65-69': 1,
          '70-74': 3,
          '75-79': 7,
          '80-84': 8,
          '85-89': 5,
          '90+': 4,
        },
      },
      lodged_eois: {
        total: 440,
        points_distribution: {
          '65-69': 33,
          '70-74': 72,
          '75-79': 98,
          '80-84': 105,
          '85-89': 75,
          '90+': 57,
        },
      },
    },
    comparison: {
      submitted_eois_change: 424,
      invitations_change: 3,
      lodged_eois_change: 30,
      new_submitted_eois: 424,
      new_invitations: 3,
      new_lodged_eois: 30,
    },
  };
}

function eoiStateRanking(metric) {
  const rankings = stateRankingRows.map((x) => {
    if (metric === 'invites') {
      return { state: x.state, rank: x.rank, total_invites: x.total_invites, total_eois: x.total_eois, total_lodged: x.total_lodged };
    }
    if (metric === 'lodged') {
      return { state: x.state, rank: x.rank, total_lodged: x.total_lodged, total_eois: x.total_eois, total_invites: x.total_invites };
    }
    return { state: x.state, rank: x.rank, total_eois: x.total_eois, total_invites: x.total_invites, total_lodged: x.total_lodged };
  });

  return {
    data_date: new Date('2026-03-01').toISOString(),
    rankings,
  };
}

function matchPattern(pathname, pattern) {
  const left = pathname.split('/').filter(Boolean);
  const right = pattern.split('/').filter(Boolean);
  if (left.length !== right.length) {
    return null;
  }
  const params = {};
  for (let i = 0; i < right.length; i += 1) {
    const p = right[i];
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(left[i]);
      continue;
    }
    if (left[i] !== p) {
      return null;
    }
  }
  return params;
}

async function handleApi(req, res, urlObj) {
  const { pathname } = urlObj;
  const method = req.method || 'GET';

  if (pathname === '/api/broadcast' && method === 'POST') {
    json(res, 202, { accepted: true });
    return true;
  }

  if (pathname === '/api/occupations' && method === 'GET') {
    json(res, 200, occupations);
    return true;
  }

  if (pathname === '/api/universities' && method === 'GET') {
    json(res, 200, universities);
    return true;
  }

  if (pathname === '/api/universities/search' && method === 'GET') {
    const q = (urlObj.searchParams.get('q') || '').toLowerCase().trim();
    const data = !q
      ? universities
      : universities.filter((u) => `${u.name} ${u.city} ${u.state}`.toLowerCase().includes(q));
    json(res, 200, data.slice(0, 20));
    return true;
  }

  const uniById = matchPattern(pathname, '/api/universities/:id');
  if (uniById && method === 'GET') {
    const found = universities.find((u) => u.id === uniById.id);
    json(res, found ? 200 : 404, found || { error: 'University not found' });
    return true;
  }

  if (pathname === '/api/visas' && method === 'GET') {
    const category = urlObj.searchParams.get('category');
    const leadsToPr = urlObj.searchParams.get('leads_to_pr');
    let data = visaCatalog;
    if (category) {
      data = data.filter((v) => v.category === category);
    }
    if (leadsToPr === 'true' || leadsToPr === 'false') {
      const bool = leadsToPr === 'true';
      data = data.filter((v) => v.leads_to_pr === bool);
    }
    json(res, 200, data);
    return true;
  }

  const visaById = matchPattern(pathname, '/api/visas/:id');
  if (visaById && method === 'GET') {
    const found = visaCatalog.find((v) => v.id === visaById.id || v.subclass === visaById.id);
    json(res, found ? 200 : 404, found || { error: 'Visa not found' });
    return true;
  }

  if (pathname === '/api/visas/check-eligibility' && method === 'POST') {
    json(res, 200, {
      eligible: true,
      score: 78,
      recommendation: 'You currently look eligible for at least one pathway.',
      next_steps: ['Confirm skill assessment', 'Keep English score current', 'Track invitation rounds'],
    });
    return true;
  }

  if (pathname === '/api/user/preferences' && method === 'GET') {
    json(res, 200, state.preferences);
    return true;
  }

  if (pathname === '/api/user/preferences' && method === 'PUT') {
    const body = await parseBody(req);
    json(res, 200, mergePreferences(body));
    return true;
  }

  if (pathname === '/api/user/visa/history' && method === 'GET') {
    json(res, 200, state.visaHistory);
    return true;
  }

  const visaHistoryById = matchPattern(pathname, '/api/user/visa/history/:id');
  if (visaHistoryById && method === 'DELETE') {
    state.visaHistory = state.visaHistory.filter((v) => v.id !== visaHistoryById.id);
    json(res, 200, { success: true });
    return true;
  }

  if (pathname === '/api/user/work-visa-pathways' && method === 'GET') {
    json(res, 200, state.workVisaPathways);
    return true;
  }

  if (pathname === '/api/user/work-visa-pathways' && method === 'POST') {
    const body = (await parseBody(req)) || {};
    const item = savePathway(body);
    json(res, 200, item);
    return true;
  }

  const pathwayById = matchPattern(pathname, '/api/user/work-visa-pathways/:id');
  if (pathwayById && method === 'PUT') {
    const body = (await parseBody(req)) || {};
    const found = updatePathway(pathwayById.id, body);
    json(res, found ? 200 : 404, found || { error: 'Pathway not found' });
    return true;
  }

  if (pathwayById && method === 'DELETE') {
    state.workVisaPathways = state.workVisaPathways.filter((p) => p.id !== pathwayById.id);
    json(res, 200, { success: true });
    return true;
  }

  if (pathname === '/api/visa-pathways' && method === 'GET') {
    json(res, 200, state.workVisaPathways);
    return true;
  }

  if (pathname === '/api/visa-pathways' && method === 'POST') {
    const body = (await parseBody(req)) || {};
    const item = savePathway(body);
    json(res, 200, item);
    return true;
  }

  const legacyPathwayById = matchPattern(pathname, '/api/visa-pathways/:id');
  if (legacyPathwayById && method === 'PUT') {
    const body = (await parseBody(req)) || {};
    const found = updatePathway(legacyPathwayById.id, body);
    json(res, found ? 200 : 404, found || { error: 'Pathway not found' });
    return true;
  }

  if (legacyPathwayById && method === 'DELETE') {
    state.workVisaPathways = state.workVisaPathways.filter((p) => p.id !== legacyPathwayById.id);
    json(res, 200, { success: true });
    return true;
  }

  if (pathname === '/api/user/journey' && method === 'GET') {
    json(res, 200, state.journey);
    return true;
  }

  if (pathname === '/api/user/journey' && method === 'PUT') {
    const body = (await parseBody(req)) || {};
    state.journey = {
      ...state.journey,
      ...body,
      profile: {
        ...state.journey.profile,
        ...(body.profile || {}),
      },
      updated_at: new Date().toISOString(),
    };
    json(res, 200, state.journey);
    return true;
  }

  if (pathname === '/api/user/journey/tasks' && method === 'GET') {
    const category = urlObj.searchParams.get('category');
    const data = category
      ? state.journey.journeyTasks.filter((t) => (t.category || '').toLowerCase() === category.toLowerCase())
      : state.journey.journeyTasks;
    json(res, 200, data);
    return true;
  }

  if (pathname === '/api/user/journey/tasks' && method === 'POST') {
    const body = (await parseBody(req)) || {};
    const task = {
      id: `task-${Date.now()}`,
      title: body.title || 'New task',
      category: body.category || 'application',
      section: body.section || body.category || 'application',
      subcategory: body.subcategory || 'general',
      completed: Boolean(body.completed),
      description: body.description || '',
      due_date: body.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.journey.journeyTasks.push(task);
    state.journey.updated_at = new Date().toISOString();
    json(res, 200, task);
    return true;
  }

  const journeyTaskById = matchPattern(pathname, '/api/user/journey/tasks/:id');
  if (journeyTaskById && method === 'PUT') {
    const body = (await parseBody(req)) || {};
    state.journey.journeyTasks = state.journey.journeyTasks.map((t) =>
      t.id === journeyTaskById.id
        ? {
            ...t,
            ...body,
            updated_at: new Date().toISOString(),
          }
        : t,
    );
    const found = state.journey.journeyTasks.find((t) => t.id === journeyTaskById.id);
    json(res, found ? 200 : 404, found || { error: 'Task not found' });
    return true;
  }

  if (journeyTaskById && method === 'DELETE') {
    state.journey.journeyTasks = state.journey.journeyTasks.filter((t) => t.id !== journeyTaskById.id);
    state.journey.updated_at = new Date().toISOString();
    json(res, 200, { success: true });
    return true;
  }

  if (pathname === '/api/user/account/deletion-status' && method === 'GET') {
    json(res, 200, state.accountDeletion);
    return true;
  }

  if (pathname === '/api/user/account' && method === 'DELETE') {
    const body = (await parseBody(req)) || {};
    state.accountDeletion = {
      is_pending: true,
      can_cancel: true,
      scheduled_deletion_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      reason: body.reason || 'No reason provided',
    };
    json(res, 200, { deletion_status: state.accountDeletion });
    return true;
  }

  if (pathname === '/api/user/account/cancel-deletion' && method === 'POST') {
    state.accountDeletion = {
      is_pending: false,
      can_cancel: false,
      scheduled_deletion_at: null,
      reason: null,
    };
    json(res, 200, state.accountDeletion);
    return true;
  }

  if (pathname === '/api/subscription/status' && method === 'GET') {
    json(res, 200, state.subscription);
    return true;
  }

  if (pathname === '/api/subscription/update' && method === 'PUT') {
    const body = (await parseBody(req)) || {};
    state.subscription = { ...state.subscription, ...body };
    json(res, 200, state.subscription);
    return true;
  }

  if (pathname === '/api/subscription/cancel' && method === 'DELETE') {
    state.subscription = {
      ...state.subscription,
      status: 'cancelled',
      cancel_at_period_end: true,
      is_active: true,
    };
    json(res, 200, state.subscription);
    return true;
  }

  if (pathname === '/api/subscription/create-checkout-session' && method === 'POST') {
    json(res, 200, { url: '/subscription/success?session_id=local-session' });
    return true;
  }

  if (pathname === '/api/subscription/create-portal-session' && method === 'POST') {
    json(res, 200, { url: '/settings?returned_from_portal=true' });
    return true;
  }

  if (pathname === '/api/subscription/verify-session' && method === 'GET') {
    json(res, 200, { success: true, session_id: urlObj.searchParams.get('session_id') || 'local-session' });
    return true;
  }

  if (pathname === '/api/feedback' && method === 'GET') {
    json(res, 200, state.feedback);
    return true;
  }

  if (pathname === '/api/feedback/stats' && method === 'GET') {
    json(res, 200, { total: state.feedback.length, by_type: {} });
    return true;
  }

  if (pathname === '/api/feedback/status' && method === 'GET') {
    json(res, 200, { submitted: false });
    return true;
  }

  if (pathname === '/api/feedback' && method === 'POST') {
    const body = (await parseBody(req)) || {};
    const entry = { id: `feedback-${Date.now()}`, ...body, created_at: new Date().toISOString() };
    state.feedback.push(entry);
    json(res, 200, entry);
    return true;
  }

  if (pathname === '/api/feedback/bulk' && method === 'POST') {
    const body = (await parseBody(req)) || [];
    const entries = Array.isArray(body)
      ? body.map((item) => ({ id: `feedback-${Date.now()}-${Math.random()}`, ...item, created_at: new Date().toISOString() }))
      : [];
    state.feedback.push(...entries);
    json(res, 200, { inserted: entries.length });
    return true;
  }

  if (pathname === '/api/eoi/top-occupations' && method === 'GET') {
    json(res, 200, {
      data_date: new Date('2026-03-01').toISOString(),
      rankings: topOccupationsCompetitive,
    });
    return true;
  }

  if (pathname === '/api/eoi/top-occupations-by-invites' && method === 'GET') {
    json(res, 200, {
      data_date: new Date('2026-03-01').toISOString(),
      rankings: topOccupationsInvited,
    });
    return true;
  }

  if (pathname === '/api/eoi/top-occupations-by-lodged' && method === 'GET') {
    json(res, 200, {
      data_date: new Date('2026-03-01').toISOString(),
      rankings: topOccupationsLodged,
    });
    return true;
  }

  if (pathname === '/api/eoi/preview' && method === 'GET') {
    const visa = urlObj.searchParams.get('visa_subclass') || '189';
    json(res, 200, getCompetitivenessResponse(urlObj, visa));
    return true;
  }

  const competitivenessByVisa = matchPattern(pathname, '/api/eoi/competitiveness/visa/:visa');
  if (competitivenessByVisa && method === 'GET') {
    json(res, 200, getCompetitivenessResponse(urlObj, competitivenessByVisa.visa));
    return true;
  }

  const competitivenessLodgedByVisa = matchPattern(pathname, '/api/eoi/competitiveness/visa/:visa/lodged');
  if (competitivenessLodgedByVisa && method === 'GET') {
    json(res, 200, {
      data_date: new Date('2026-03-01').toISOString(),
      visa_subclass: competitivenessLodgedByVisa.visa,
      total_lodged: 470,
      points_distribution: {
        '65-69': 35,
        '70-74': 79,
        '75-79': 105,
        '80-84': 111,
        '85-89': 82,
        '90+': 58,
      },
    });
    return true;
  }

  const deepAnalysisByVisa = matchPattern(pathname, '/api/eoi/competitiveness/visa/:visa/deep-analysis');
  if (deepAnalysisByVisa && method === 'POST') {
    json(res, 200, {
      visa_subclass: deepAnalysisByVisa.visa,
      analysis_available: false,
      message: 'Deep analysis is mocked in local mode.',
    });
    return true;
  }

  if (pathname === '/api/eoi/deep-analysis/cohort-summary' && method === 'GET') {
    json(res, 200, {
      cohort_size: 1200,
      median_points: 80,
      recommendation: 'Local demo summary only',
    });
    return true;
  }

  const eoiState = matchPattern(pathname, '/api/eoi/occupation/:occupationCode/state-ranking');
  if (eoiState && method === 'GET') {
    json(res, 200, eoiStateRanking('eoi'));
    return true;
  }

  const eoiStateInvites = matchPattern(pathname, '/api/eoi/occupation/:occupationCode/state-ranking-by-invites');
  if (eoiStateInvites && method === 'GET') {
    json(res, 200, eoiStateRanking('invites'));
    return true;
  }

  const eoiStateLodged = matchPattern(pathname, '/api/eoi/occupation/:occupationCode/state-ranking-by-lodged');
  if (eoiStateLodged && method === 'GET') {
    json(res, 200, eoiStateRanking('lodged'));
    return true;
  }

  if (pathname === '/api/eoi/preview/state-ranking' && method === 'GET') {
    json(res, 200, eoiStateRanking('eoi'));
    return true;
  }

  if (pathname === '/api/eoi/preview/state-ranking-by-invites' && method === 'GET') {
    json(res, 200, eoiStateRanking('invites'));
    return true;
  }

  if (pathname === '/api/eoi/preview/state-ranking-by-lodged' && method === 'GET') {
    json(res, 200, eoiStateRanking('lodged'));
    return true;
  }

  json(res, 200, { success: true, note: `Mock endpoint for ${pathname}` });
  return true;
}

function safeResolve(base, targetPath) {
  const resolved = path.resolve(base, `.${targetPath}`);
  if (!resolved.startsWith(base)) {
    return null;
  }
  return resolved;
}

function serveStaticFile(res, absolutePath) {
  if (!absolutePath) {
    text(res, 403, 'Forbidden');
    return;
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    text(res, 404, 'Not Found');
    return;
  }
  const ext = path.extname(absolutePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  const data = fs.readFileSync(absolutePath);
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': ext === '.js' || ext === '.css' ? 'public, max-age=300' : 'no-store',
    'Content-Length': data.length,
  });
  res.end(data);
}

function isAssetLikePath(pathname) {
  return pathname.startsWith('/assets/') || pathname.startsWith('/_vercel/') || path.extname(pathname) !== '';
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `${HOST}:${PORT}`;
    const urlObj = new URL(req.url || '/', `http://${host}`);
    const pathname = urlObj.pathname;

    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, urlObj);
      return;
    }

    const spaPaths = new Set([
      '/',
      '/login',
      '/auth/callback',
      '/home',
      '/visa-advisor',
      '/top-occupations',
      '/settings',
      '/subscription',
      '/subscription/success',
      '/onboarding',
      '/pre-departure-checklist',
    ]);

    if (spaPaths.has(pathname)) {
      serveStaticFile(res, path.join(ROOT, 'local-entry.html'));
      return;
    }

    const staticCandidate = safeResolve(ROOT, pathname);
    if (staticCandidate && fs.existsSync(staticCandidate) && fs.statSync(staticCandidate).isFile()) {
      serveStaticFile(res, staticCandidate);
      return;
    }

    if (isAssetLikePath(pathname)) {
      text(res, 404, 'Not Found');
      return;
    }

    if (pathname === '/home.html') {
      serveStaticFile(res, path.join(ROOT, 'local-entry.html'));
      return;
    }

    serveStaticFile(res, path.join(ROOT, 'local-entry.html'));
  } catch (err) {
    text(res, 500, `Local clone server error: ${err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local clone running at http://${HOST}:${PORT}/home`);
  console.log('Serving:', ROOT);
});
