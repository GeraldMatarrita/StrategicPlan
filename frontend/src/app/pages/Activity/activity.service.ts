import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
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
   * function to get an Activity by its ID
   * @param activityId of the activity to obtain
   * @returns observable with the activity data
   */
  getActivityById(activityId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Activity}/${activityId}`
    );
  }

  /**
   * function to create an Activity
   * @param data data of the activity to send
   * @returns promise with the response message
   */
  createActivity(data: any, goalId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Activity}/${goalId}`,
        data
      ).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.error('Error creating activity:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * function to update an Activity by its ID
   * @param activityId ID of the activity to update
   * @param data new data for the activity
   * @returns promise with the response message
   */
  updateActivity(activityId: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${API_ROUTES.BASE_URL}${API_ROUTES.Update_Activity}/${activityId}`,
          data
        )
        .subscribe(
          (response: any) => {
            resolve(response.message);
          },
          (error: any) => {
            console.error('Error updating activity:', error);
            reject(error);
          }
        );
    });
  }

  /**
   * function to delete an Activity by its ID
   * @param activityId ID of the activity to delete
   * @returns promise with the response message
   */
  deleteActivity(activityId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.deleteData(`${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Activity}/${activityId}`).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error deleting activity:', error);
          reject(error);
        }
      );
    });
  }
}
