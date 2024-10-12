import { ApplicationRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class SwotService {
    // Cambia la URL según tu backend

  constructor(private http: HttpClient) {}

  getSwotAnalysis(id: any): Observable<any> {

    return this.http.get(`${API_ROUTES.BASE_URL}/swotAnalysis/allAnalisis/${id}`);
  }

  getCameAnalysis(id: any): Observable<any> {

    return this.http.get(`${API_ROUTES.BASE_URL}/cameAnalysis/allAnalisis/${id}`);
  }

  addSwotCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/swotAnalysis/${type}/addCardAnalysis/${id}`, card);
  }

  deleteSwotCard(type: string, id: any, card: any): Observable<any> {

    return this.http.post(`${API_ROUTES.BASE_URL}/swotAnalysis/${type}/deleteCard/${id}`, card);
  }

  addCameCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/cameAnalysis/${type}/addCardAnalysis/${id}`, card);
  }

  deleteCameCard(type: string, id: any, card: any): Observable<any> {

    return this.http.post(`${API_ROUTES.BASE_URL}/cameAnalysis/${type}/deleteCard/${id}`, card);
  }

  updateCard(card:any):Observable<any>{
    return this.http.put(`${API_ROUTES.BASE_URL}/cardAnalysis/updateCard/${card._id}`,card)
  }
}
