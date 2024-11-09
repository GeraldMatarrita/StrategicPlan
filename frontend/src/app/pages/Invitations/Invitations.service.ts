import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, BehaviorSubject } from 'rxjs';
import { API_ROUTES } from '../../config/api.routes';

@Injectable({
  providedIn: 'root',
})
export class InvitationsService {
  private pendingInvitationsCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * @param url to post data
   * @param data data to post
   * @returns
   */
  postData(url: string, data: any): Observable<any> {
    console.log('post Data', data);
    console.log('post url', url);
    return this.http.post<any>(url, data);
  }

  // --------------------------------------------
  // Methods for the API
  // --------------------------------------------

  /**
   * Function to get all invitations for a user
   * @param userId of the user
   * @returns promise with the data
   */
  getInvitationsForUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByUserID_Invitations}/${userId}`
    );
  }

  /**
   * Function to get the count of pending invitations for a user
   * @param userId of the user
   * @returns promise with the pending invitations count
   */
  getPendingInvitationsCount(userId: string): Observable<number> {
    return this.http.get<{ pendingCount: number }>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_Amount_Pending_Invitations}/${userId}`
    ).pipe(map(response => response.pendingCount));
  }

  // Method to get the observable of the count
  getPendingInvitationsCountObservable(): Observable<number> {
    return this.pendingInvitationsCount.asObservable();
  }

  // Method to update the invitations count
  updatePendingInvitationsCount(count: number) {
    this.pendingInvitationsCount.next(count);
  }

  /**
   * Function to get the strategic plans for a user by their id
   * @param userId of the user
   * @returns promise with the data
   */
  getStrategicPlansForUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_ByUSerID_StrategicPlan}/${userId}`
    );
  }

  /**
   * Function to get users to invite who are neither the active user nor already invited
   * @param planId of the strategic plan
   * @returns promise with the data
   */
  getUserToInvite(planId: String): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_ROUTES.BASE_URL}${API_ROUTES.Get_UsersToInvite_Invitations}/${planId}`
    );
  }

  /**
   * Function to create invitation data
   * @param data data to send
   * @returns promise with the response message
   */
  createInvitation(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Create_Invitation}`,
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
   * Function to respond to an invitation
   * @param data accept or reject the invitation, the strategic plan, and the responding user
   * @returns
   */
  responseInvitation(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.postData(
        `${API_ROUTES.BASE_URL}${API_ROUTES.Response_Invitation}`,
        data
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error responding to the invitation:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Function to delete an invitation
   * @param userId of the user
   * @param planId of the strategic plan
   * @returns promise with the response message
   */
  deleteInvitation(userId: string, planId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${API_ROUTES.BASE_URL}${API_ROUTES.Delete_Invitation}/${userId}/${planId}`
      ).subscribe(
        (response: any) => {
          resolve(response.message);
        },
        (error: any) => {
          console.error('Error deleting the invitation:', error);
          reject(error);
        }
      );
    });
  }
}
