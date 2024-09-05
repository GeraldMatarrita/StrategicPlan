import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../navigations.routes';

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
  navigateToBasico() {
    this.router.navigate([NAVIGATIONS_ROUTES.BASICO]);
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
}
