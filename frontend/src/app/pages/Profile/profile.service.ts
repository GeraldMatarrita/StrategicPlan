import { ApplicationRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
    // Cambia la URL según tu backend

  constructor(private http: HttpClient) {}
    /**
     * Método para obtener planes activos de un usuario
     * @param userId ID del usuario
     * @returns Observable con los datos de los planes finalizados
     */
  getActivePlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Active_StrategicPlan}/${userId}`
    );
  }
  /**
   * Método para obtener planes finalizados de un usuario
   * @param userId ID del usuario
   * @returns Observable con los datos de los planes finalizados
   */
  getFinishedPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_finishedByUserID_StrategicPlan}/${userId}`
    );
  }
  updateUser(userId:string, data:any){
    return this.http.put(`${API_ROUTES.BASE_URL}${API_ROUTES.Update_User}/${userId}`,data);
  }
}