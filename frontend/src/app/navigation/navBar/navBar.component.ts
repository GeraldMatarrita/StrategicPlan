import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navBar.component.html',
  styleUrl: './navBar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
  constructor(private router: Router) {}

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
