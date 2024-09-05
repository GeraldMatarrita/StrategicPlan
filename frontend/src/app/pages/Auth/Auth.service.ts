import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../config/api.routes';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Variables para almacenar el usuario activo
  private activeUserID: string = '';
  private activeUser: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Función que se usará para obtener el token del usuario activo.
   * @returns Promesa que se resuelve cuando el token es procesado.
   */
  private getUserToken(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tokenString = localStorage.getItem('token');

      if (tokenString) {
        try {
          const token = JSON.parse(tokenString);
          this.activeUserID = token._id;
          this.activeUser = token;
          resolve();
        } catch (error) {
          this.router.navigate(['/Auth']);
          reject(error);
        }
      } else {
        this.router.navigate(['/Auth']);
        reject(new Error('No token found'));
      }
    });
  }

  /**
   * Función que se usará de manera global para obtener el ID del usuario activo.
   * @returns ID del usuario activo.
   */
  async getActiveUserID(): Promise<string> {
    await this.getUserToken();
    return this.activeUserID;
  }

  /**
   * Función que se usará de manera global para obtener el usuario activo.
   * @returns Usuario activo.
   */
  async getActiveUser(): Promise<any> {
    await this.getUserToken();
    return this.activeUser;
  }

  // --------------------------------------------
  // Métodos generales
  // --------------------------------------------
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
   * funcion to get all users
   * @returns
   */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.GetAllUsers}`
    );
  }

  /**
   * función para craer un usuario
   * @param data datos del usuario
   * @returns promesa con el mensaje de respuesta
   */
  createAccount(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(`${API_ROUTES.BASE_URL}${API_ROUTES.AUTH}`, data).subscribe(
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
   * Función para hacer login
   * @param data Datos a enviar para verificar el login
   * @returns Promesa con el mensaje de respuesta y el estado del usuario
   */
  login(data: any): Promise<{ message: string; userActive: any }> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.LOGIN}`,
        data
      ).subscribe(
        (response: { message: string; userActive: any }) => {
          resolve(response);
        },
        (error: any) => {
          console.error('Error al enviar los datos:', error);
          reject(error);
        }
      );
    });
  }
}
