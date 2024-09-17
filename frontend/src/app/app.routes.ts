import { Routes } from '@angular/router';
import { BasicoComponent } from './pages/basico/basico.component';
import { NotFoundComponent } from './pages/NotFound/NotFound.component';
import { StrategicPlanComponent } from './pages/StrategicPlan/StrategicPlan.component';
import { FodaMecaComponent } from './pages/FodaMeca/FodaMeca.component';
import { InvitationsComponent } from './pages/Invitations/Invitations.component';
import { AuthComponent } from './pages/Auth/Auth.component';
import { StrategicPlanToSelect } from './pages/StrategicPlanToSelect/StrategicPlanToSelect.component';
import { ObjectivesComponent } from './pages/Objectives/Objectives.component';

export const routes: Routes = [
  { path: 'Basico', component: BasicoComponent },
  { path: 'NotFound', component: NotFoundComponent },
  { path: 'StrategicPlan', component: StrategicPlanComponent },
  { path: 'SelectStrategicPlan', component: StrategicPlanToSelect },
  { path: 'FodaMeca', component: FodaMecaComponent },
  { path: 'Invitations', component: InvitationsComponent },
  { path: 'Auth', component: AuthComponent },
  { path: 'Objectives', component: ObjectivesComponent },
  { path: '', component: StrategicPlanToSelect }, // Redirige la ruta si no hay nada
  { path: '**', component: NotFoundComponent }, // Redirige cualquier otra ruta a /notfound
];
