import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

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
    this.router.navigate(['/notfound']);
  }
  navigateToHome() {
    this.router.navigate(['/']);
  }
  navigateToBasico() {
    this.router.navigate(['/basico']);
  }
  navigateToStrategicPlan() {
    this.router.navigate(['/StrategicPlan']);
  }
  navigateToInvitations() {
    this.router.navigate(['/Invitations']);
  }
  navigateToAuth() {
    this.router.navigate(['/Auth']);
  }
}
