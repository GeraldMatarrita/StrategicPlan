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
   * @param url to delete data
   * @param id id data to delete
   * @returns
   */
  deleteById(url: string, id: string): Observable<any> {
    console.log('delete url', url);
    console.log('delete id', id);
    return this.http.delete<any>(`${url}/${id}`);
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
   * función para craer los datos de StrategicPlan
   * @param data datos a enviar
   * @returns promesa con el mensaje de respuesta
   */
  createStrategicPlan(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`,
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
   * función para salir de un StrategicPlan con un usuario
   * @param planId del plan a eliminar
   * @param userId del user a eliminar
   * @returns promesa con el mensaje de respuesta
   */
  outStrategicPlan(planId: string, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN_OUT}`, {
        planId,
        userId,
      }).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al  los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * función para actualizar los datos de StrategicPlan
   * @param id del dato a actualizar
   * @param data datos a enviar para actualizar
   * @returns promesa con el mensaje de respuesta
   */
  updateStrategicPlan(id: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.updateData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`,
        id,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al actualizar los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * función para obtener todos los StrategicPlan
   * @returns promesa con los datos de StrategicPlan
   */
  getStrategicPlans(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`
    );
  }

  /**
   * Método para obtener planes activos de un usuario
   * @param userId ID del usuario
   * @returns Observable con los datos de los planes activos
   */
  getActivePlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN_ACTIVE}/${userId}`
    );
  }

  /**
   * Método para obtener planes finalizados de un usuario
   * @param userId ID del usuario
   * @returns Observable con los datos de los planes finalizados
   */
  getFinishedPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN_FINISHED}/${userId}`
    );
  }
}
