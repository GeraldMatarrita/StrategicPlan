import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';
import { AppComponent } from '../../app.component';

/**
 * Component representing the side navigation bar in the application.
 */
@Component({
  selector: 'app-site-nav',
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
  templateUrl: './sideNav.component.html',
  styleUrl: './sideNav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  constructor(private router: Router, private appComponent: AppComponent) {}

  // Toggles the side navigation bar
  toggleSidenav() {
    this.appComponent.toggleSidenav();
  }

  // Navigates to the Strategic Plan page
  navigateToStrategicPlan() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
  }

  // Navigates to the objective page
  navigateToObjective() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.OBJECTIVE]);
  }

  // Navigates to the Goals page
  navigateToGoals() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  // Navigates to the Profile page
  navigateToProfile() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.PROFILE]);
  }

  // Navigates to the Not Found page
  navigateToNotFound() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.NOT_FOUND]);
  }

  // Navigates to the Operational page
  navigateToOperational() {
    this.toggleSidenav();
    this.router.navigate([NAVIGATIONS_ROUTES.OPERATIONAL]);
  }
}
