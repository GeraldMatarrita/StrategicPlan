import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class StrategicPlanService {
  constructor(private http: HttpClient) {}

  /**
   * @param url to post data
   * @param data data to post
   * @returns
   */
  postData(url: string, data: any): Observable<any> {
    console.log('post Data', data);
    console.log('post url', url);
    return this.http.post<any>(url, data);
  }

  /**
   * @param url to update data
   * @param id id data to update
   * @param data data to update
   * @returns
   */
  updateData(url: string, id: string, data: any): Observable<any> {
    console.log('update id', id);
    console.log('update data', data);
    console.log('update url', url);
    return this.http.put<any>(`${url}/${id}`, data);
  }

  // --------------------------------------------
  // API Methods
  // --------------------------------------------

  /**
   * Function to create StrategicPlan data
   * @param data data to send
   * @param userId user ID 
   * @returns promise with the response message
   */
  createStrategicPlan(data: any, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_StrategicPlan}/${userId}`,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error sending data:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to leave a StrategicPlan with a user
   * @param planId plan ID to remove
   * @param userId user ID to remove
   * @returns promise with the response message
   */
  outStrategicPlan(planId: string, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(`${API_ROUTES.BASE_URL}${API_ROUTES.Out_StrategicPlan}`, {
        planId,
        userId,
      }).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error sending data:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to update StrategicPlan data
   * @param id ID of the data to update
   * @param data data to send for update
   * @returns promise with the response message
   */
  updateObjectivesStrategicPlan(id: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.UpdateObjective_StrategicPlan}`,
        id,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error updating Strategic Plan:', error);
          reject(error);
        }
      );
    });
  }

  updateStrategicPlan(id: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Update_StrategicPlan}`,
        id,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error updating Strategic Plan:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to get StrategicPlan data by ID
   * @param planId StrategicPlan ID to retrieve
   * @returns Observable with active plan data
   */
  getPlanByID(planId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ById_StrategicPlan}/${planId}`
    );
  }

  /**
   * Function to get all StrategicPlans
   * @returns Observable with StrategicPlan data
   */
  getStrategicPlans(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_All_StrategicPlans}`
    );
  }

  /**
   * Method to get active plans for a user
   * @param userId user ID
   * @returns Observable with active plan data
   */
  getActivePlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Active_StrategicPlan}/${userId}`
    );
  }

  /**
   * Method to get finished plans for a user
   * @param userId user ID
   * @returns Observable with finished plan data
   */
  getFinishedPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_finishedByUserID_StrategicPlan}/${userId}`
    );
  }
}
