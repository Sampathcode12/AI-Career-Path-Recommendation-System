/**
 * Vercel-native API router (MongoDB). Full app on Vercel — no .NET required when MONGODB_URI is set.
 */
import { routeKey } from './lib/http.js';
import { isMongoConfigured } from './lib/mongodb.js';
import { isLegacyProxyConfigured, proxyToLegacy } from './lib/proxy.js';
import { handleHealthDb } from './handlers/health.js';
import {
  handleAuthSignup,
  handleAuthLoginJson,
  handleAuthMe,
} from './handlers/auth.js';
import {
  handleProfileGet,
  handleProfileCreate,
  handleProfileUpdate,
} from './handlers/profile.js';
import {
  handleAssessmentGet,
  handleAssessmentCreate,
} from './handlers/assessment.js';
import {
  handleIntakeSpecializations,
  handleIntakeCareerPaths,
} from './handlers/intake.js';
import {
  handleRecommendationsAiSetupStatus,
  handleRecommendationsGenerate,
  handleRecommendationsGetAll,
  handleRecommendationSave,
  handleRecommendationsChat,
} from './handlers/recommendations.js';
import {
  handleJobsCategories,
  handleJobsSearch,
  handleJobsTop,
  handleJobsTitleSuggestions,
  handleJobsRoleSearch,
  handleJobsSkillsByLevel,
  handleJobsRoleInsights,
  handleJobsSavedGet,
  handleJobsSave,
} from './handlers/jobs.js';
import { handleSkillGapGetAll } from './handlers/skillGap.js';
import { handleMarketTrendsGet } from './handlers/marketTrends.js';
import { handleMlPredictInterest } from './handlers/ml.js';

const nativeHandlers = {
  'GET health/db': handleHealthDb,
  'POST auth/signup': handleAuthSignup,
  'POST auth/login-json': handleAuthLoginJson,
  'GET auth/me': handleAuthMe,
  'GET profile': handleProfileGet,
  'POST profile': handleProfileCreate,
  'PUT profile': handleProfileUpdate,
  'GET assessment': handleAssessmentGet,
  'POST assessment': handleAssessmentCreate,
  'GET intake/specializations': handleIntakeSpecializations,
  'GET intake/career-paths': handleIntakeCareerPaths,
  'GET recommendations/ai-setup-status': handleRecommendationsAiSetupStatus,
  'POST recommendations/generate': handleRecommendationsGenerate,
  'GET recommendations': handleRecommendationsGetAll,
  'POST recommendations/chat': handleRecommendationsChat,
  'GET jobs/categories': handleJobsCategories,
  'POST jobs/search': handleJobsSearch,
  'GET jobs/top': handleJobsTop,
  'GET jobs/title-suggestions': handleJobsTitleSuggestions,
  'GET jobs/role-search': handleJobsRoleSearch,
  'GET jobs/skills-by-level': handleJobsSkillsByLevel,
  'GET jobs/role-insights': handleJobsRoleInsights,
  'GET jobs/saved': handleJobsSavedGet,
  'POST jobs/save': handleJobsSave,
  'GET skill-gap': handleSkillGapGetAll,
  'GET market-trends': handleMarketTrendsGet,
  'POST ml/predict-interest': handleMlPredictInterest,
};

function resolveDynamicRoute(method, subPath) {
  const saveMatch = String(subPath).match(/^recommendations\/(\d+)\/save$/i);
  if (method === 'PUT' && saveMatch) {
    return { handler: handleRecommendationSave, params: { id: saveMatch[1] } };
  }
  return null;
}

export async function dispatch(req, res, subPath) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const method = String(req.method || 'GET').toUpperCase();
  const key = routeKey(method, subPath);
  const dynamic = resolveDynamicRoute(method, subPath);
  const handler = dynamic?.handler ?? nativeHandlers[key];

  if (handler && isMongoConfigured()) {
    if (dynamic?.params) return handler(req, res, dynamic.params);
    return handler(req, res);
  }

  if (isLegacyProxyConfigured()) {
    return proxyToLegacy(req, res, subPath);
  }

  if (handler && !isMongoConfigured()) {
    return res.status(503).json({
      detail:
        'MONGODB_URI is not configured. Add a MongoDB Atlas connection string in Vercel Environment Variables, then redeploy.',
    });
  }

  return res.status(501).json({
    detail: `Not implemented on Vercel yet: ${key}.`,
  });
}

export function listNativeRoutes() {
  return Object.keys(nativeHandlers);
}
