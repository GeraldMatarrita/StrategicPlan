import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../config/api.routes';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // BehaviorSubject para gestionar el estado de autenticación
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.isUserLoggedIn()
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private invitationCountSubject = new BehaviorSubject<number>(0);
  public invitationCount$ = this.invitationCountSubject.asObservable();

  private userNameSubject = new BehaviorSubject<string>('');
  userName$ = this.userNameSubject.asObservable();

  // Variables para almacenar el usuario activo
  private activeUserID: string = '';
  private activeUser: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

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
          this.isLoggedInSubject.next(true); // Actualiza el estado a "logged in"
          resolve();
        } catch (error) {
          this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
          reject(error);
        }
      } else {
        this.logout();
        this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
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
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_All_Users}`
    );
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_User_By_Id}/${userId}`
    );
  }

  /**
   * función para craer un usuario
   * @param data datos del usuario
   * @returns promesa con el mensaje de respuesta
   */
  createAccount(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_User}`,
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
   * Función para hacer login
   * @param data Datos a enviar para verificar el login
   * @returns Promesa con el mensaje de respuesta y el estado del usuario
   */
  login(data: any): Promise<{ message: string; userActive: any }> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Login_User}`,
        data
      ).subscribe(
        (response: { message: string; userActive: any }) => {
          localStorage.setItem('token', JSON.stringify(response.userActive));
          this.isLoggedInSubject.next(true); // Actualiza el estado a "logged in"
          this.userNameSubject.next(response.userActive.name);
          resolve(response);
        },
        (error: any) => {
          console.error('Error al enviar los datos:', error);
          reject(error);
        }
      );
    });
  }
    // Método para actualizar los datos del usuario activo
    updateActiveUser(updatedUser: any): void {
      this.activeUser = updatedUser;
      this.activeUserID = updatedUser._id;
  
      // Guardar los nuevos datos en localStorage
      localStorage.setItem('token', JSON.stringify(updatedUser));
  
      // Actualizar los observables si es necesario
      this.userNameSubject.next(updatedUser.realName);
    }
  
    // Método para manejar el update de los datos del usuario en el backend
    updateUserInBackend(userID: string, data: any): Promise<{ message: string; user: any }> {
      return new Promise((resolve, reject) => {
        this.http.put<{ message: string; user: any }>(`${API_ROUTES.BASE_URL}${API_ROUTES.Update_User}/${userID}`, data)
          .subscribe(
            (response) => {
              // Actualiza el usuario activo
              this.updateActiveUser(response.user);
              resolve(response);
            },
            (error) => {
              console.error('Error updating user in backend:', error);
              reject(error);
            }
          );
      });
    }

  async getActiveUserName(): Promise<{ realName: string }> {
    // Retornar el usuario activo desde tu lógica
    return { realName: this.userNameSubject.getValue() };
  }

  requestPasswordReset(data: { email: string }): Observable<any> {
    return this.http.post(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Forgot_Password}`,
      data
    );
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false); // Actualiza el estado de logged out
    this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
  }

  goToHome(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
  }
}
