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
  // Métodos para la API
  // --------------------------------------------

  /**
   * función para obtener los goals de un planId
   * @param planId
   * @returns goals
   */
  getGoalsByPlanId(planId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByPlanID_Goals}/${planId}`
    );
  }

  /**
   * función para crear un goal y asociarlo a un objetivo
   * @param objectiveId objetivoId a asociar con el goal
   * @param data del goal
   * @returns promesa con el mensaje de respuesta
   */
  createGoal(data: any, objectiveId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Goals}/${objectiveId}`,
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
   * función para actualizar un goal
   * @param goalId id del goal a actualizar
   * @param data datos del goal a actualizar
   * @returns promesa con el mensaje de respuesta
   */
  updateGoal(goalId: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Update_Goals}`,
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
}
