import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordFormService {
  constructor(private http: HttpClient) {}

  // Método para validar el token
  validateToken(token: string): Observable<any> {
    return this.http.get(`${API_ROUTES.BASE_URL}${API_ROUTES.Reset_Password}/${token}`);
  }

  // Método para enviar la nueva contraseña
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}${API_ROUTES.Reset_Password}/${token}`, {
      newPassword,
    });
  }
}
