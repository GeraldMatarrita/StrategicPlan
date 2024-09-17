import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class ObjectivesService {
  constructor(private http: HttpClient) {}
}
