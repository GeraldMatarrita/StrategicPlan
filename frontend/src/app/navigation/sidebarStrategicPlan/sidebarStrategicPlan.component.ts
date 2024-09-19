import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-strategic-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebarStrategicPlan.component.html',
  styleUrl: './sidebarStrategicPlan.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarStrategicPlanComponent {
  constructor(private router: Router) {}
  navigateToObjective() {
    this.router.navigate(['/objective']);
  }
}
