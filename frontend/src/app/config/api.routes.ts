import { environment } from './environments/environment';
export const API_ROUTES = {

  // Base URL for the API
  BASE_URL: environment.API_BASE_URL,

  // -------------------------------------------------------------
  // Rutes for the invitations
  // -------------------------------------------------------------
  Get_ByUserID_Invitations: '/invitations/UserInvitations', // GET + "/userId"
  Get_UsersToInvite_Invitations: '/invitations/getUsersNotInPlan', // GET + "/StrategicPlanId"
  Get_Amount_Pending_Invitations: '/invitations/pendingCount', // GET + "/userId"
  Create_Invitation: '/invitations/create', // POST
  Response_Invitation: '/invitations/response', // POST
  Delete_Invitation: '/invitations/deleteInvitation', // DELETE

  // -------------------------------------------------------------
  // Rutes for the Users
  // -------------------------------------------------------------
  Get_All_Users: '/auth/AllUsers', // GET
  Create_User: '/auth/create', // POST
  Login_User: '/auth/login', // POST
  Forgot_Password: '/auth/forgot-password', // POST
  Reset_Password: '/auth/reset-password', // POST
  Update_User: '/auth/update',
  Get_User_By_Id: '/auth/getUserById', // GET + "/userId"
  
  // -------------------------------------------------------------
  // Rutes for The Strategic Plans
  // -------------------------------------------------------------
  Get_All_StrategicPlans: '/strategicPlan/AllStrategicPlans', // GET
  Get_ById_StrategicPlan: '/strategicPlan/ById', // GET + "/StrategicPlanId"
  Get_ByUSerID_StrategicPlan: '/strategicPlan/ByUserID', // GET + "/userId"
  Get_Active_StrategicPlan: '/strategicPlan/active', // GET + "/userId"
  Get_finishedByUserID_StrategicPlan: '/strategicPlan/finished', // GET + "/userId"
  Out_StrategicPlan: '/strategicPlan/out', // POST
  Create_StrategicPlan: '/strategicPlan/create', // POST + "/userId"
  UpdateObjective_StrategicPlan: '/strategicPlan/updateObjectives',
  Update_StrategicPlan: '/strategicPlan/update',

  // -------------------------------------------------------------
  // Rutes for the SWOT and CAME Analysis
  // -------------------------------------------------------------
  //SWOT
  Get_All_SWOT: '/swotAnalysis/allAnalisis',//Get + "/strategicPlanID"
  Add_New_Strength_Card: '/swotAnalysis/strengths/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Weaknes_Card: '/swotAnalysis/weaknesses/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Opportuniti_Card: '/swotAnalysis/opportunities/addCardAnalysis',//Post + "strategicPlanID"
  Add_New_Threat_Card: '/swotAnalysis/threats/addCardAnalysis',//Post + "strategicPlanID"
  Delete_Strength_Card: '/swotAnalysis/strengths/deleteCard',//Post + "strategicPlanID"
  Delete_Weaknes_Card: '/swotAnalysis/weaknesses/deleteCard',//Post + "strategicPlanID"
  Delete_Opportuniti_Card: '/swotAnalysis/opportunities/deleteCard',//Post + "strategicPlanID"
  Delete_Threat_Card: '/swotAnalysis/threatsdeleteCard',//Post + "strategicPlanID"

  //CAME
  Get_All_CAME: '/cameAnalysis/allAnalisis',//Get + "/strategicPlanID"
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
  
  // -------------------------------------------------------------
  // Rutes for the Objectives
  // -------------------------------------------------------------
  Get_AllByPlanID_Objective: '/objective/getPlanObjectives', // GET + "/StrategicPlanId"
  Create_Objective: '/objective/create', // POST
  Update_Objective: '/objective/update', // PUT + "/StrategicPlanId"
  Delete_Objective: '/objective/delete', // DELETE + "/StrategicPlanId"
  Get_Objective: '/objective/getObjective', // GET + "/ObjectiveId"

  // -------------------------------------------------------------
  // Rutes for the Goals
  // -------------------------------------------------------------
  Get_ByPlanID_Goals: '/goals/getPlanGoals', // GET + "/StrategicPlanId"
  Get_ByObjectiveID_Goals: '/goals/getObjectiveGoals', // GET + "/ObjectiveId"
  Create_Goal: '/goals/create', // POST + "/ObjectiveId"
  Update_Goal: '/goals/update', // PUT
  Delete_Goal: '/goals/delete', // DELETE + "/GoalId"

  // -------------------------------------------------------------
  // Rutes for the Operational Plans
  // -------------------------------------------------------------
  Get_Active_OperationalPlan: '/operationalPlan/active', // GET 
  Get_OperationalPlans: '/operationalPlan/getOperationalPlans', // GET 
  Create_OperationalPlan: '/operationalPlan/create', // POST + /StrategicPlanId
  Inactivate_OperationalPlan: '/operationalPlan/inactivate', // PUT
  Update_OperationalPlan: '/operationalPlan/update', // PUT
  Get_OperationalPlans_By_StrategicPlanId: '/operationalPlan/getOperationalPlansByStrategicPlanId', // GET + /StrategicPlanId

  // -------------------------------------------------------------
  // Rutes for the Activities
  // -------------------------------------------------------------
  Get_Activity: '/activity/getActivity', // GET + /:id
  Create_Activity: '/activity/create', // POST + /:goalId
  Update_Activity: '/activity/update', // PUT + /:id
  Delete_Activity: '/activity/delete', // DELETE + /:id

  // -------------------------------------------------------------
  // Rutes for the Indicators
  // -------------------------------------------------------------
  Get_Indicator: '/indicator/getIndicator', // GET + /:id
  Get_Indicators_By_OperationalPlan: '/indicator/getIndicatorsByPlan', // GET + /:operationalPlanId
  Create_Indicator: '/indicator/create', // POST
  Update_Indicator: '/indicator/update', // PUT + /:id
  Delete_Indicator: '/indicator/delete', // DELETE + /:id

};
