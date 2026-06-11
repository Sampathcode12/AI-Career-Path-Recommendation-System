import { requireUser } from '../lib/requireUser.js';
import { readJsonBody, sendJson } from '../lib/http.js';
import { inferClusterFromBody } from '../lib/mlHeuristic.js';

export async function handleMlPredictInterest(req, res) {
  const claims = requireUser(req, res);
  if (!claims) return;

  const body = readJsonBody(req) ?? {};
  const interests = String(body.interests ?? '').trim();
  const skills = String(body.skills ?? '').trim();
  const ugSpec = String(body.ug_specialization ?? body.ugSpecialization ?? '').trim();
  const blob = [interests, skills, ugSpec, body.certificate_course_title, body.certificateCourseTitle, body.ug_course, body.ugCourse].join(' ');

  const category = inferClusterFromBody(blob);
  if (!category) {
    return sendJson(res, 200, {
      available: false,
      predicted_category: null,
      message: 'Python ML service is not deployed on Vercel. Keyword routing still works for recommendations.',
    });
  }

  sendJson(res, 200, {
    available: true,
    predicted_category: category,
    label_index: 0,
    top_predictions: [{ label: category, probability: 0.72 }],
    message: 'Heuristic prediction (Vercel serverless — no Python model).',
  });
}
