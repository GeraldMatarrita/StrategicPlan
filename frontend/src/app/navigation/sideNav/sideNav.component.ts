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

@Component({
  selector: 'app-site-nav',
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
  templateUrl: './sideNav.component.html',
  styleUrl: './sideNav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  constructor(private router: Router, private appComponent: AppComponent) {}

  toggleSidenav() {
    this.appComponent.toggleSidenav();
  }

  navigateToNotFound() {
    this.router.navigate([NAVIGATIONS_ROUTES.NOT_FOUND]);
  }

  navigateToObjective() {
    this.router.navigate([NAVIGATIONS_ROUTES.OBJECTIVE]);
  }
}
