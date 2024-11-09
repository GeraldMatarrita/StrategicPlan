import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
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
   * function to create a goal and associate it with an objective
   * @param objectiveId objectiveId to associate with the goal
   * @param data of the goal
   * @returns promise with the response message
   */
  createGoal(data: any, objectiveId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Goal}/${objectiveId}`,
        data
      ).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * function to update a goal
   * @param goalId id of the goal to update
   * @param data data of the goal to update
   * @returns promise with the response message
   */
  updateGoal(goalId: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Update_Goal}`,
        goalId,
        data
      ).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * function to delete a goal
   * @param goalId id of the goal to delete
   * @returns promise with the response message
   */

  deleteGoal(goalId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deleteData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Goal}/${goalId}`
      ).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
