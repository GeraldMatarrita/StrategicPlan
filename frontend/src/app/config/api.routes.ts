import { environment } from './environments/environment';
export const API_ROUTES = {
  BASE_URL: environment.API_BASE_URL,
  // -------------------------------------------------------------
  // Para las invitaciones
  // -------------------------------------------------------------
  Get_ByUserID_Invitations: '/invitations/UserInvitations', // GET + "/userId"
  Get_UsersToInvite_Invitations: '/invitations/getUsersNotInPlan', // GET + "/StrategicPlanId"
  Create_Invitation: '/invitations/create', // POST
  Response_Invitation: '/invitations/response', // POST

  // -------------------------------------------------------------
  // Para los usuarios
  // -------------------------------------------------------------
  Get_All_Users: '/auth/AllUsers', // GET
  Create_User: '/auth/create', // POST
  Login_User: '/auth/login', // POST

  // -------------------------------------------------------------
  // Para los planes estratégicos
  // -------------------------------------------------------------
  Get_All_StrategicPlans: '/strategicPlan/AllStrategicPlans', // GET
  Get_ById_StrategicPlan: '/strategicPlan/ById', // GET + "/StrategicPlanId"
  Get_ByUSerID_StrategicPlan: '/strategicPlan/ByUserID', // GET + "/userId"
  Get_Active_StrategicPlan: '/strategicPlan/active', // GET + "/userId"
  Get_finishedByUserID_StrategicPlan: '/strategicPlan/finished', // GET + "/userId"
  Out_StrategicPlan: '/strategicPlan/out', // POST
  Create_StrategicPlan: '/strategicPlan/create', // POST + "/userId"
  Update_StrategicPlan: '/strategicPlan/update', // PUT
  Update_FodaMeca_StrategicPlan: '/strategicPlan/FodaMeca', // PUT + "/StrategicPlanId"

  // -------------------------------------------------------------
  // Para los Objetivos
  // -------------------------------------------------------------
  Get_AllByPlanID_Objective: '/objective/getPlanObjectives', // GET + "/StrategicPlanId"
  Create_Objective: '/objective/create', // POST
  Update_Objective: '/objective/update', // PUT + "/StrategicPlanId"
  Delete_Objective: '/objective/delete', // DELETE + "/StrategicPlanId"
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // al finalizar borrar esta ya que es solo de pruebas
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  BASICA: '/basica',
};
