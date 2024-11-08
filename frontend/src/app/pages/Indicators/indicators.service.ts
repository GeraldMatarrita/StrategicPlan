import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class IndicatorService {
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
   * function to get an Indicator by its ID
   * @param indicatorId of the indicator to obtain
   * @returns observable with the indicator data
   */
  getIndicatorById(indicatorId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Indicator}/${indicatorId}`
    );
  }

  /**
   * function to get indicators by OperationalPlanId
   * @param operationalPlanId of the plan to obtain indicators
   * @returns observable with the list of indicators
   */
  getIndicatorsByOperationalPlan(operationalPlanId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Indicators_By_OperationalPlan}/${operationalPlanId}`
    );
  }

  /**
   * function to create an Indicator
   * @param data data of the indicator to send
   * @returns promise with the response message
   */
  createIndicator(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postData(`${API_ROUTES.BASE_URL}${API_ROUTES.Create_Indicator}`, data).subscribe(
        (response: any) => {
          Swal.fire('Success', 'Indicator created successfully', 'success');
          resolve(response); // Resuelve la promesa con la respuesta
        },
        (error: any) => {
          console.error('Error creating indicator:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

  /**
   * function to update an Indicator by its ID
   * @param indicatorId ID of the indicator to update
   * @param data new data for the indicator
   * @returns promise with the response message
   */
  updateIndicator(indicatorId: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${API_ROUTES.BASE_URL}${API_ROUTES.Update_Indicator}/${indicatorId}`,
          data
        )
        .subscribe(
          (response: any) => {
            resolve(response.message);
          },
          (error: any) => {
            console.error('Error updating indicator:', error);
            reject(error);
          }
        );
    });
  }

  /**
   * function to delete an Indicator by its ID
   * @param indicatorId ID of the indicator to delete
   * @returns promise with the response message
   */
  deleteIndicator(indicatorId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.deleteData(`${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Indicator}/${indicatorId}`).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error deleting indicator:', error);
          reject(error);
        }
      );
    });
  }
}
