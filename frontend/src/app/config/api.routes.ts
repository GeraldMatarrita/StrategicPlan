import { environment } from '../../environments/environment';
export const API_ROUTES = {
  BASE_URL: environment.API_BASE_URL,
  BASICA: '/basica',
  STRATEGIC_PLAN: '/strategicPlan',
  STRATEGIC_PLAN_FOR_USER: '/strategicPlan/plans-to-user',
  STRATEGIC_PLAN_OUT: '/strategicPlan/out',
  AUTH: '/auth',
  LOGIN: '/auth/login',
  GetAllUsers: '/auth/All-users',
  INVITATION: '/invitations',
  RESPONSE_INVITATION: '/invitations/response',
};
