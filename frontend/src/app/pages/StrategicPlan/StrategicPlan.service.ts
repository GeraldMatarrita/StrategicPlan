import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class StrategicPlanService {
  /**
   *
   * @param http servicio de HttpClient
   *
   */
  constructor(private http: HttpClient) {}

  /**
   * @param url to get data
   * @returns
   */
  getAllData(url: string): Observable<any[]> {
    return this.http.get<any[]>(url);
  }

  /**
   * @param url to get data
   * @param id data id
   * @returns
   */
  getDataByID(url: string, id: string): Observable<any> {
    return this.http.get<any>(`${url}/${id}`);
  }

  /**
   *
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
   *
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
   *
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
      this.postData(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`, data).subscribe(
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
   * función para eliminar los datos de StrategicPlan por ID
   * @param id del dato a eliminar
   * @returns promesa con el mensaje de respuesta
   */
  deleteStrategicPlanByID(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.deleteById(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`, id).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al eliminar los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * función para actualizar los datos de StrategicPlan
   * @param id del dato a actualizar
   * @param data datos a enviar
   * @returns promesa con el mensaje de respuesta
   */
  updateStrategicPlan(id: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.updateData(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`, id, data).subscribe(
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
   * función para obtener todos los datos de StrategicPlan
   * @returns promesa con los datos
   */
  getStrategicPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`);
  }
}
