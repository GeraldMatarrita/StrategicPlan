import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';


@Injectable({
    providedIn: 'root',
  })
  export class FodaMecaService {
    constructor(private http: HttpClient) {}
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
      return this.http.put<any>(`${API_ROUTES.BASE_URL}${API_ROUTES.FODAMECA_UPDATE}/${id}`, data);
    }
  }