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
  // BehaviorSubject to manage the authentication status
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.isUserLoggedIn()
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // BehaviorSubject to manage the invitation count
  private invitationCountSubject = new BehaviorSubject<number>(0);
  public invitationCount$ = this.invitationCountSubject.asObservable();

  // BehaviorSubject to store the username of the active user
  private userNameSubject = new BehaviorSubject<string>('');
  userName$ = this.userNameSubject.asObservable();

  // Variables to store the active user details
  private activeUserID: string = '';
  private activeUser: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  // Function to check if the user is logged in by verifying the presence of a token in localStorage
  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Function to get the active user's token.
   * @returns Promise that resolves when the token is processed.
   */
  private getUserToken(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tokenString = localStorage.getItem('token');

      if (tokenString) {
        try {
          const token = JSON.parse(tokenString);
          this.activeUserID = token._id;
          this.activeUser = token;
          this.isLoggedInSubject.next(true); // Update the state to "logged in"
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
   * Function to get the active user's ID globally.
   * @returns Active user's ID.
   */
  async getActiveUserID(): Promise<string> {
    await this.getUserToken();
    return this.activeUserID;
  }

  /**
   * Function to get the active user globally.
   * @returns Active user.
   */
  async getActiveUser(): Promise<any> {
    await this.getUserToken();
    return this.activeUser;
  }

  // --------------------------------------------
  // General Methods
  // --------------------------------------------

  /**
   * Function to send POST data to a given URL.
   * @param url URL to post data
   * @param data Data to post
   * @returns Observable of the response
   */
  postData(url: string, data: any): Observable<any> {
    console.log('post Data', data);
    console.log('post url', url);
    return this.http.post<any>(url, data);
  }

  /**
   * Function to delete data by its ID at a given URL.
   * @param url URL to delete data
   * @param id ID of the data to delete
   * @returns Observable of the response
   */
  deleteById(url: string, id: string): Observable<any> {
    console.log('delete url', url);
    console.log('delete id', id);
    return this.http.delete<any>(`${url}/${id}`);
  }

  /**
   * Function to update data at a given URL by its ID.
   * @param url URL to update data
   * @param id ID of the data to update
   * @param data Data to update
   * @returns Observable of the response
   */
  updateData(url: string, id: string, data: any): Observable<any> {
    console.log('update id', id);
    console.log('update data', data);
    console.log('update url', url);
    return this.http.put<any>(`${url}/${id}`, data);
  }

  // --------------------------------------------
  // API Methods
  // --------------------------------------------

  /**
   * Function to get all users.
   * @returns Observable of the users list
   */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_All_Users}`
    );
  }

  /**
   * Function to get a user by their ID.
   * @param userId ID of the user
   * @returns Observable of the user object
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_User_By_Id}/${userId}`
    );
  }

  /**
   * Function to create a new user.
   * @param data User data
   * @returns Promise with the response message
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
          console.error('Error sending data:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to log in the user.
   * @param data Login data
   * @returns Promise with the response message and active user status
   */
  login(data: any): Promise<{ message: string; userActive: any }> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Login_User}`,
        data
      ).subscribe(
        (response: { message: string; userActive: any }) => {
          localStorage.setItem('token', JSON.stringify(response.userActive));
          this.isLoggedInSubject.next(true); // Update the state to "logged in"
          this.userNameSubject.next(response.userActive.name);
          resolve(response);
        },
        (error: any) => {
          console.error('Error sending data:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to update the active user.
   * @param updatedUser Updated user data
   * @returns void
   */
  updateActiveUser(updatedUser: any): void {
    this.activeUser = updatedUser;
    this.activeUserID = updatedUser._id;

    // Save the updated user data in localStorage
    localStorage.setItem('token', JSON.stringify(updatedUser));

    // Update the observables if necessary
    this.userNameSubject.next(updatedUser.realName);
  }

  /**
   * Function to update a user in the backend.
   * @param userID ID of the user to update
   * @param data User data to update
   * @returns Promise with the response message and user data
   */
  updateUserInBackend(
    userID: string,
    data: any
  ): Promise<{ message: string; user: any }> {
    return new Promise((resolve, reject) => {
      this.http
        .put<{ message: string; user: any }>(
          `${API_ROUTES.BASE_URL}${API_ROUTES.Update_User}/${userID}`,
          data
        )
        .subscribe(
          (response) => {
            // Update the active user
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

  /**
   * Function to get the active user's name.
   * @returns Promise with the active user's name
   */
  async getActiveUserName(): Promise<{ realName: string }> {
    // Return the active user's name
    return { realName: this.userNameSubject.getValue() };
  }

  /**
   * Function to request a password reset.
   * @param data Email to send the reset request
   * @returns Observable with the response
   */
  requestPasswordReset(data: { email: string }): Observable<any> {
    return this.http.post(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Forgot_Password}`,
      data
    );
  }

  /**
   * Function to log out the user.
   * @returns Promise that resolves when the user is logged out
   */
  async logout(): Promise<void> {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false); // Update the state to "logged out"
    this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
  }

  /**
   * Function to navigate back to the home page.
   * @returns void
   */
  goToHome(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
  }
}
