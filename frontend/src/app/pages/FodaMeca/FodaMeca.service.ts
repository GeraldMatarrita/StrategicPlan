import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class SwotService {
  private apiUrl = API_ROUTES.BASE_URL;  // Cambia la URL según tu backend

  constructor(private http: HttpClient) {}

  getSwotAnalysis(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/swotAnalysis/allAnalisis/${id}`);
  }

  addSwotCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/swotAnalysis/${type}/addCardAnalysis/${id}`, card);
  }

  deleteSwotCard(type: string, id: any, cardId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/swotAnalysis/${type}/deleteCard/${id}`, { idCard: cardId });
  }
}
