import { dispatch } from './router.js';

export default async function handler(req, res) {
  const pathParts = req.query.path;
  const subPath = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');
  return dispatch(req, res, subPath);
}
