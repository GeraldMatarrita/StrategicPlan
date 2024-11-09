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
   * Function to get the active operational plan from the API.
   * @returns An observable containing the active operational plan data.
   */
   getActiveOperationalPlan(): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Active_OperationalPlan}`
    );
  }

  /**
   * Function to get all operational plans for a specific strategic plan.
   * @param strategicPlanId The ID of the strategic plan to get its operational plans.
   * @returns An observable containing the operational plans associated with the strategic plan.
   */
  getOperationalPlansByStrategicPlanId(strategicPlanId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_OperationalPlans_By_StrategicPlanId}/${strategicPlanId}`
    );
  }

  /**
   * Function to get all operational plans.
   * @returns An observable containing all operational plans.
   */
  GetOperationalPlans(): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_OperationalPlans}`
    );
  }

  /**
   * Function to create an operational plan associated with a strategic plan.
   * @param data The operational plan data to send to the API.
   * @param strategicPlanID The ID of the strategic plan to which the operational plan belongs.
   * @returns A promise containing a response message from the API.
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

  /**
   * Function to set an operational plan as inactive.
   * @param planId The ID of the operational plan to mark as inactive.
   * @returns A promise containing a response message from the API.
   */
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

  /**
   * Function to update an existing operational plan.
   * @param operationalPlanId The ID of the operational plan to update.
   * @param data The updated data for the operational plan.
   * @returns A promise containing a response message from the API.
   */
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
            console.error('Error updating the operational plan:', error);
            reject(error);
          }
        );
    });
  }
}
