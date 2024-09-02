import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class Service {

  constructor(private http:HttpClient) { }

  /**
   * Funcion que recibe verificacion si el usuario existe para el login 
   * y retona el id del usuario
   * @param data
   * @returns id del usuario
   */

}
