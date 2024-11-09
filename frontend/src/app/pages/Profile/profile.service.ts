import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
    // Change the URL according to your backend

  constructor(private http: HttpClient) {}
  
  /**
   * Method to get active plans of a user
   * @param userId User ID
   * @returns Observable with the data of active plans
   */
  getActivePlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Active_StrategicPlan}/${userId}`
    );
  }
  
  /**
   * Method to get finished plans of a user
   * @param userId User ID
   * @returns Observable with the data of finished plans
   */
  getFinishedPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_finishedByUserID_StrategicPlan}/${userId}`
    );
  }

  /**
   * Method to update user data
   * @param userId User ID
   * @param data User data
   * @returns Observable with the updated user data
   */
  updateUser(userId: string, data: any) {
    return this.http.put(`${API_ROUTES.BASE_URL}${API_ROUTES.Update_User}/${userId}`, data);
  }
}
