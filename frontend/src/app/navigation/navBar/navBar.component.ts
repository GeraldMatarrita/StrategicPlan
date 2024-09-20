import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { LayoutModule } from '@angular/cdk/layout';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    AppComponent,
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
export class NavBarComponent {
  constructor(private router: Router, private appComponent: AppComponent) {}

  toggleSidenav() {
    this.appComponent.toggleSidenav();
  }

  navigateToNotFound() {
    this.router.navigate([NAVIGATIONS_ROUTES.NOT_FOUND]);
  }
  navigateToHome() {
    this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
  }

  navigateToStrategicPlan() {
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
  }
  navigateToInvitations() {
    this.router.navigate([NAVIGATIONS_ROUTES.INVITATIONS]);
  }
  navigateToAuth() {
    this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
  }

  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // al finalizar borrar esto para abajo ya que es solo de pruebas
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  navigateToBasico() {
    this.router.navigate([NAVIGATIONS_ROUTES.BASICO]);
  }
}
