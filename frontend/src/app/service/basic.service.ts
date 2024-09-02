import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BasicService {
  /**
   *
   * @param http servicio de HttpClient
   *
   */
  constructor(private http: HttpClient) {}

  getData(url: string): Observable<any[]> {
    return this.http.get<any[]>(url);
  }

  postData(data: any, url: string): Observable<any> {
    console.log('post Data', data);
    console.log('post url', url);
    return this.http.post<any>(url, data);
  }

  deleteData(id: string, url: string): Observable<any> {
    console.log('delete url', url);
    return this.http.delete<any>(`${url}/${id}`);
  }

  updateData(id: string, data: any, url: string): Observable<any> {
    console.log('update id', id);
    console.log('update data', data);
    console.log('update url', url);
    return this.http.put<any>(`${url}/${id}`, data);
  }

  /**
   *
   * @param data datos a enviar
   * @param url dirección de la API del backend
   * @returns promesa con el mensaje de respuesta
   */
  createData(data: any, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(data, url).subscribe(
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
   *
   * @param id del dato a eliminar
   * @param url dirección de la API del backend
   * @returns promesa con el mensaje de respuesta
   */
  deleteDataByID(id: string, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.deleteData(id, url).subscribe(
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
}
