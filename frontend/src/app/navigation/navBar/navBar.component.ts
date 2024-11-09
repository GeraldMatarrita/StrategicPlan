import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../pages/Auth/Auth.service';
import { InvitationsService } from '../../pages/Invitations/Invitations.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';
import { AppComponent } from '../../app.component';

/**
 * Component representing the navigation bar in the application.
 */
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    LayoutModule,
  ],
  templateUrl: './navBar.component.html',
  styleUrl: './navBar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false; // Tracks user's login status
  pendingInvitations: number = 0; // Tracks pending invitations count
  activeUserName: any = ''; // Stores the active user's name
  private subscription: Subscription = new Subscription(); // Manages component subscriptions

  // Variable to store response message
  responseMessage: string = '';

  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private authService: AuthService,
    private invitationsService: InvitationsService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Sets up subscriptions for login status, username, and navigation events.
   */
  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((loggedInStatus) => {
      this.isLoggedIn = loggedInStatus;
      this.cdr.detectChanges(); // Forces change detection
    });

    if (this.isLoggedIn) {
      this.loadPendingInvitations(); // Load pending invitations if user is logged in
      this.loadActiveUserName(); // Load the active user's name
    }

    this.authService.userName$.subscribe((userName) => {
      this.activeUserName = userName; // Updates the active user's name
      this.cdr.detectChanges(); // Forces change detection
    });

    // Subscribe to navigation events
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if (this.isLoggedIn) {
            this.loadPendingInvitations(); // Load pending invitations on route change
          }
        }
      })
    );

    // Subscribe to pending invitations count changes
    this.subscription.add(
      this.invitationsService
        .getPendingInvitationsCountObservable()
        .subscribe((count) => {
          this.pendingInvitations = count; // Updates invitation count
          this.cdr.detectChanges(); // Forces change detection
        })
    );
  }

  /**
   * Asynchronous function to load the active user's name.
   * Fetches the username from AuthService and updates the component.
   */
  private async loadActiveUserName(): Promise<void> {
    const userName = await this.authService.getActiveUserName();
    if (userName) {
      this.activeUserName = userName; // Assigns the active user's name
      this.cdr.detectChanges(); // Forces change detection
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Asynchronous function to load the number of pending invitations for the active user.
   * Retrieves user ID and subscribes to the invitations count service.
   */
  async loadPendingInvitations(): Promise<void> {
    try {
      const userId = await this.authService.getActiveUserID(); // Gets the active user's ID
      const invitationSub = this.invitationsService
        .getPendingInvitationsCount(userId)
        .subscribe((count) => {
          this.pendingInvitations = count; // Updates invitation count
          this.cdr.detectChanges(); // Forces change detection
        });
      this.subscription.add(invitationSub); // Adds subscription to the subscription manager
    } catch (error) {
      console.error('Error loading pending invitations', error);
    }
  }

  /**
   * Method to handle user logout.
   * Prompts user for confirmation and, if confirmed, removes local storage item and logs out.
   */
  async logout(): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      localStorage.removeItem('selectedPlan'); // Removes token from local storage
      this.authService.logout(); // Calls logout method from AuthService
    }
  }

  /**
   * Toggles the sidenav component by calling toggleSidenav from AppComponent.
   */
  toggleSidenav() {
    this.appComponent.toggleSidenav();
  }

  /**
   * Navigates to the 'Not Found' page.
   */
  navigateToNotFound() {
    this.router.navigate([NAVIGATIONS_ROUTES.NOT_FOUND]);
  }

  /**
   * Navigates to the 'Home' page.
   */
  navigateToHome() {
    this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
  }

  /**
   * Navigates to the 'Select Strategic Plan' page.
   */
  navigateToStrategicPlan() {
    this.router.navigate([NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN]);
  }

  /**
   * Navigates to the 'Invitations' page.
   */
  navigateToInvitations() {
    this.router.navigate([NAVIGATIONS_ROUTES.INVITATIONS]);
  }

  /**
   * Navigates to the 'Authentication' page.
   */
  navigateToAuth() {
    this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
  }

  /**
   * Navigates to the 'Profile' page.
   */
  navigateToProfile() {
    this.router.navigate([NAVIGATIONS_ROUTES.PROFILE]);
  }
}
