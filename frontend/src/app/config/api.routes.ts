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
  Update_StrategicPlan: '/strategicPlan/update',
  // -------------------------------------------------------------
  // Para los analisis de FODA y MECA de cada plan estratégico
  // -------------------------------------------------------------

  //FODA
  Get_All_SWOT: '/swotAnalysis/allAnalisis',//Get + "/strategicPlanID"
  Get_All_CAME: '/cameAnalysis/allAnalisis',//Get + "/strategicPlanID"
  Add_New_Strength_Card: '/swotAnalysis/strengths/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Weaknes_Card: '/swotAnalysis/weaknesses/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Opportuniti_Card: '/swotAnalysis/opportunities/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Threat_Card: '/swotAnalysis/threats/addCardAnalysis',//Post + "strategicPlanID"
  Delete_Strength_Card: '/swotAnalysis/strengths/deleteCard',//Post + "strategicPlanID"
  Delete_Weaknes_Card: '/swotAnalysis/weaknesses/deleteCard',//Post + "strategicPlanID"
  Delete_Opportuniti_Card: '/swotAnalysis/opportunities/deleteCard',//Post + "strategicPlanID"
  Delete_Threat_Card: '/swotAnalysis/threatsdeleteCard',//Post + "strategicPlanID"

  //CAME
  Add_New_Correct_Card: '/cameAnalysis/correct/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Afront_Card: '/cameAnalysis/adapt/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Maintain_Card: '/cameAnalysis/maintain/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Explore_Card: '/cameAnalysis/explore/addCardAnalysis',//Post + "strategicPlanID"
  Delete_Correct_Card: '/cameAnalysis/correct/deleteCard',//Post + "strategicPlanID"
  Delete_Afront_Card: '/cameAnalysis/adapt/deleteCard',//Post + "strategicPlanID"
  Delete_Maintain_Card: '/cameAnalysis/maintain/deleteCard',//Post + "strategicPlanID"
  Delete_Explore_Card: '/cameAnalysis/explore/deleteCard',

  //CardAnalysis
  Get_CardAnalisis: '/cardAnalysis/getCard',//Get + "CardAnalysisID"
  Update_CardAnalisis: '/cardAnalysis/updateCard',//Post + "CardAnalysisID"
  
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // al finalizar borrar esta ya que es solo de pruebas
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  
  BASICA: '/basica',
};
