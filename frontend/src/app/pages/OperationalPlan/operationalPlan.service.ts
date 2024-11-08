import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class OperationalPlanService {
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
   * @param url to delete data
   * @param data data to delete
   * @returns
   */
  deleteData(url: string): Observable<any> {
    console.log('delete url', url);
    return this.http.delete<any>(url);
  }

  // --------------------------------------------
  // Methods for the API
  // --------------------------------------------

  /**
   * function to obtain the objectives by planId
   * @param planId of the plan to obtain
   * @returns promise with the objectives
   */
  getActiveOperationalPlan(): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Active_OperationalPlan}`
    );
  }

  getOperationalPlansByStrategicPlanId(strategicPlanId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_OperationalPlans_By_StrategicPlanId}/${strategicPlanId}`
    );
  }

  GetOperationalPlans(): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_OperationalPlans}`
    );
  }

  /**
   * function to create an Objective
   * @param data data of the objective to send
   * @param planId id of the plan to which the objective belongs
   * @returns promise with the response message
   */
  createOperationalPlan(data: any, strategicPlanID: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_OperationalPlan}/${strategicPlanID}`,
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

  setInactiveOperationalPlan(planId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .patch(
          `${API_ROUTES.BASE_URL}${API_ROUTES.Inactivate_OperationalPlan}/${planId}`,
          {}
        )
        .subscribe(
          (response: any) => {
            resolve(response.message);
          },
          (error: any) => {
            console.error('Error inactivating the plan:', error);
            reject(error);
          }
        );
    });
  }

  updateOperationalPlan(operationalPlanId: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${API_ROUTES.BASE_URL}${API_ROUTES.Update_OperationalPlan}/${operationalPlanId}`,
          data
        )
        .subscribe(
          (response: any) => {
            resolve(response.message);
          },
          (error: any) => {
            console.error('Error updating the opeartional pLan:', error);
            reject(error);
          }
        );
    });
  }
}
