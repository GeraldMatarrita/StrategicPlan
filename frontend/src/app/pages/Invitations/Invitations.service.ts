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

  // --------------------------------------------
  // Métodos para la API
  // --------------------------------------------

  /**
   * función para obtener todas las invitaciones de un usuario
   * @param userId del usuario
   * @returns promesa con los datos
   */
  getInvitationsForUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByUserID_Invitations}/${userId}`
    );
  }

  /**
   * funcion para obtener los planes estrategicos de un usuario por su id
   * @param userId del usuario
   * @returns promesa con los datos
   */
  getStrategicPlansForUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByUSerID_StrategicPlan}/${userId}`
    );
  }

  /**
   * función para obtener los usuarios a invitar que no sean el usuario activo ni estén ya invitados
   * @param planId del plan estratégico
   * @returns promesa con los datos
   */
  getUserToInvite(planId: String): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_UsersToInvite_Invitations}/${planId}`
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
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Invitation}`,
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
        `${API_ROUTES.BASE_URL}${API_ROUTES.Response_Invitation}`,
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