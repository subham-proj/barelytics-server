/**
 * Health check endpoint to verify API is running.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const healthCheck = (req, res) => {
  res.json({ status: 'ok', message: 'API is healthy' });
}; 