import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class ObjectivesService {
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
  getObjectivesByPlanId(planId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_AllByPlanID_Objective}/${planId}`
    );
  }

  getObjectiveById(objectiveId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Objective}/${objectiveId}`
    );
  }

  /**
   * function to create an Objective
   * @param data data of the objective to send
   * @param planId id of the plan to which the objective belongs
   * @returns promise with the response message
   */
  createObjective(data: any, planId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Objective}/${planId}`,
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

  deleteObjective(objectiveId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Objective}/${objectiveId}`).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error deleting the objective:', error);
          reject(error);
        }
      );
    });
  }

  updateObjective(objectiveId: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('data', data);
      this.http.put(`${API_ROUTES.BASE_URL}${API_ROUTES.Update_Objective}/${objectiveId}`, data).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error updating the objective:', error);
          reject(error);
        }
      );
    });
  }

  getGoalsByObjectiveId(objectiveId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByObjectiveID_Goals}/${objectiveId}`
    );
  }
}
