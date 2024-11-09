import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordFormService {
  constructor(private http: HttpClient) {}

  /**
   * Function to validate the token received in the email
   * @param token 
   * @returns 
   */
  validateToken(token: string): Observable<any> {
    return this.http.get(`${API_ROUTES.BASE_URL}${API_ROUTES.Reset_Password}/${token}`);
  }

  /**
   * Function to reset the password with the token and the new password
   * @param token 
   * @param newPassword 
   * @returns 
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}${API_ROUTES.Reset_Password}/${token}`, {
      newPassword,
    });
  }
}
