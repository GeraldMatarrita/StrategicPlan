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
   * Function to send data to a specified URL via POST request
   * @param url The URL to post data to
   * @param data The data to be sent
   * @returns An observable containing the response
   */
  postData(url: string, data: any): Observable<any> {
    console.log('post Data', data);
    console.log('post url', url);
    return this.http.post<any>(url, data);
  }

  /**
   * Function to delete data at a specified URL
   * @param url The URL to send the DELETE request to
   * @returns An observable containing the response
   */
  deleteData(url: string): Observable<any> {
    console.log('delete url', url);
    return this.http.delete<any>(url);
  }

  // --------------------------------------------
  // Methods for the API
  // --------------------------------------------

  /**
   * Function to obtain all objectives for a given plan ID
   * @param planId The ID of the plan to fetch objectives for
   * @returns An observable containing the list of objectives
   */
  getObjectivesByPlanId(planId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_AllByPlanID_Objective}/${planId}`
    );
  }

  /**
   * Function to get a specific objective by its ID
   * @param objectiveId The ID of the objective to fetch
   * @returns An observable containing the objective data
   */
  getObjectiveById(objectiveId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Objective}/${objectiveId}`
    );
  }

  /**
   * Function to create a new objective for a specified plan
   * @param data The objective data to send
   * @param planId The ID of the plan the objective belongs to
   * @returns A promise with the response message
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

  /**
   * Function to delete an existing objective by its ID
   * @param objectiveId The ID of the objective to delete
   * @returns A promise with the response message
   */
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

  /**
   * Function to update an existing objective by its ID
   * @param objectiveId The ID of the objective to update
   * @param data The updated data for the objective
   * @returns A promise with the response message
   */
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

  /**
   * Function to obtain the goals associated with a specific objective
   * @param objectiveId The ID of the objective to get associated goals
   * @returns An observable containing the list of goals
   */
  getGoalsByObjectiveId(objectiveId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByObjectiveID_Goals}/${objectiveId}`
    );
  }
}
