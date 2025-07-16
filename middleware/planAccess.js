// Middleware to enforce access control based on user plan
import { PLANS } from '../constants.js';

// Helper to get plan order for comparison
const planOrder = ['free', 'pro', 'business'];

export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    const userPlanIndex = planOrder.indexOf(userPlan);
    const requiredPlanIndex = planOrder.indexOf(requiredPlan);
    if (userPlanIndex === -1) return res.status(400).json({ error: 'Invalid user plan.' });
    if (userPlanIndex >= requiredPlanIndex) {
      return next();
    }
    return res.status(403).json({ error: `This feature requires the ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan.` });
  };
}

