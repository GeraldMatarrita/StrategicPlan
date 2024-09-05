import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class InvitationsService {
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
   * función para obtener todas las invitaciones de un usuario
   * @param id del usuario
   * @returns promesa con los datos
   */
  getInvitationsForUser(id: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.INVITATION}/${id}`
    );
  }

  /**
   * funcion para obtener los planes estrategicos de un usuario
   * @param id del usuario
   * @returns promesa con los datos
   */
  getStrategicPlansForUser(id: string): Observable<any[]> {
    console.log(
      `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN_FOR_USER}/${id}`
    );
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN_FOR_USER}/${id}`
    );
  }

  /**
   * función para craer los datos de invitación
   * @param data datos a enviar
   * @returns promesa con el mensaje de respuesta
   */
  createInvitation(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.INVITATION}`,
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
   * funcion para responder una invitación
   * @param data aceptar o rechazar la invitación, a cual plan estratégico y el usuario que responde
   * @returns
   */
  responseInvitation(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.RESPONSE_INVITATION}`,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error al responder la invitación:', error);
          reject(error);
        }
      );
    });
  }
}
