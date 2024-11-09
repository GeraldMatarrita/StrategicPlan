import { ApplicationRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root'
})
export class SwotService {
  constructor(private http: HttpClient) {}

  /**
   * Method to get the SWOT analysis of a project
   * @param id ID of the project
   * @returns Observable with the SWOT analysis
   */
  getSwotAnalysis(id: any): Observable<any> {
    return this.http.get(`${API_ROUTES.BASE_URL}/swotAnalysis/allAnalisis/${id}`);
  }

  /**
   * Method to get the CAME analysis of a project
   * @param id ID of the project
   * @returns Observable with the CAME analysis
   */
  getCameAnalysis(id: any): Observable<any> {
    return this.http.get(`${API_ROUTES.BASE_URL}/cameAnalysis/allAnalisis/${id}`);
  }

  /**
   * Method to add a SWOT card to the analysis
   * @param type Type of the analysis (project or user)
   * @param id ID of the analysis
   * @param card Card to add
   * @returns Observable with the response
   */
  addSwotCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/swotAnalysis/${type}/addCardAnalysis/${id}`, card);
  }

  /**
   * Method to delete a SWOT card from the analysis
   * @param type type of the analysis (project or user)
   * @param id ID of the analysis
   * @param card Card to delete
   * @returns Observable with the response
   */
  deleteSwotCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/swotAnalysis/${type}/deleteCard/${id}`, card);
  }

  /**
   * Method to add a CAME card to the analysis
   * @param type Type of the analysis (project or user)
   * @param id ID of the analysis
   * @param card Card to add
   * @returns Observable with the response
   */
  addCameCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/cameAnalysis/${type}/addCardAnalysis/${id}`, card);
  }

  /**
   * Method to delete a CAME card from the analysis
   * @param type type of the analysis (project or user)
   * @param id ID of the analysis
   * @param card Card to delete
   * @returns Observable with the response
   */
  deleteCameCard(type: string, id: any, card: any): Observable<any> {
    return this.http.post(`${API_ROUTES.BASE_URL}/cameAnalysis/${type}/deleteCard/${id}`, card);
  }

  /**
   * Method to update a SWOT card
   * @param card Card to update
   * @returns Observable with the response
   */
  updateCard(card:any):Observable<any>{
    return this.http.put(`${API_ROUTES.BASE_URL}/cardAnalysis/updateCard/${card._id}`,card)
  }
}
