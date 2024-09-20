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
  // Métodos para la API
  // --------------------------------------------

  /**
   * función para obtener los objetivos por planId
   * @param planId del plan a obtener
   * @returns promesa con los objetivos
   */
  getObjectivesByPlanId(planId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_AllByPlanID_Objective}/${planId}`
    );
  }

  /**
   * función para crear un Objetivo
   * @param data datos del objetivo a enviar
   * @param planId id del plan al que pertenece el objetivo
   * @returns promesa con el mensaje de respuesta
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
          console.error('Error al enviar los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * función para actualizar un Objetivo
   * @param data datos del objetivo a enviar
   * @param objectiveId id del objetivo a actualizar
   * @returns promesa con el mensaje de respuesta
   */
  updateObjective(data: any, objectiveId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Update_Objective}`,
        objectiveId,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al enviar los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * función para eliminar un Objetivo
   * @param objectiveId id del objetivo a eliminar
   * @param planId id del plan al que pertenece el objetivo
   */
  deleteObjective(objectiveId: string, planId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Objective}/${planId}`,
        { objectiveId }
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al enviar los datos:', error);
          reject(error);
        }
      );
    });
  }
}
