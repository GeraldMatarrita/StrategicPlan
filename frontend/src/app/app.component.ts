import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './navigation/navBar/navBar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { LayoutModule } from '@angular/cdk/layout';
import { SideNavComponent } from './navigation/sideNav/sideNav.component';
import { NAVIGATIONS_ROUTES } from './config/navigations.routes';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavBarComponent,
    SideNavComponent,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    LayoutModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  @ViewChild(MatSidenav, { static: true })
  public sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver, private router: Router) {}

  ngOnInit(): void {
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            // Detecta cuando la navegación termina
            this.checkRouteAndToggleSidenav(event.urlAfterRedirects); // Usa la URL final
          }
        });
      }
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  checkRouteAndToggleSidenav(url: string): void {
    console.log('ruta', url); // Imprime la ruta actual
    if (
      url.includes(NAVIGATIONS_ROUTES.OBJECTIVE) ||
      url.includes(NAVIGATIONS_ROUTES.GOALS)
    ) {
      this.sidenav.open(); // Abre el sidenav si la ruta es una pensada para dejarlo abierto
    } else {
      this.sidenav.close();
    }
  }
}
