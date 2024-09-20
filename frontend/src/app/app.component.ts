import { RouterOutlet } from '@angular/router';
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

  constructor(private observer: BreakpointObserver) {}

  ngOnInit(): void {
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
}
