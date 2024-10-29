import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component, ViewChild,
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
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  pendingInvitations: number = 0;
  activeUserName: any = '';
  private subscription: Subscription = new Subscription();

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  constructor(
    private router: Router, private appComponent: AppComponent,
    private authService: AuthService,
    private invitationsService: InvitationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((loggedInStatus) => {
      this.isLoggedIn = loggedInStatus;
      this.cdr.detectChanges(); // Fuerza la detección de cambios
    });

    if (this.isLoggedIn) {
      this.loadPendingInvitations(); // Cargar invitaciones pendientes cuando el usuario esté logueado
      this.loadActiveUserName(); // Cargar el nombre del usuario
    }

    this.authService.userName$.subscribe((userName) => {
      this.activeUserName = userName; // Actualiza el nombre del usuario activo
      this.cdr.detectChanges(); // Fuerza la detección de cambios
    });

    // Suscribirse a los eventos de navegación
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if (this.isLoggedIn) {
            this.loadPendingInvitations(); // Cargar invitaciones pendientes en cada cambio de ruta
          }
        }
      })
    );

    // Suscribirse a los cambios en el contador de invitaciones
    this.subscription.add(
      this.invitationsService
        .getPendingInvitationsCountObservable()
        .subscribe((count) => {
          this.pendingInvitations = count; // Actualiza el conteo de invitaciones
          this.cdr.detectChanges(); // Fuerza la detección de cambios
        })
    );
  }

  private async loadActiveUserName(): Promise<void> {
    const userName = await this.authService.getActiveUserName();
    if (userName) {
      this.activeUserName = userName; // Asigna el nombre del usuario
      this.cdr.detectChanges(); // Fuerza la detección de cambios
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async loadPendingInvitations(): Promise<void> {
    try {
      const userId = await this.authService.getActiveUserID(); // Obtén el ID del usuario autenticado
      const invitationSub = this.invitationsService
        .getPendingInvitationsCount(userId)
        .subscribe((count) => {
          this.pendingInvitations = count; // Actualiza el conteo de invitaciones
          this.cdr.detectChanges(); // Fuerza la detección de cambios
        });
      this.subscription.add(invitationSub); // Añade la suscripción para poder limpiar en ngOnDestroy
    } catch (error) {
      console.error('Error al cargar las invitaciones pendientes', error);
    }
  }

  /**
   * Método para cerrar sesión
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
      localStorage.removeItem('selectedPlan'); // Elimina el token del localStorage
      this.authService.logout(); // Llama al método de logout del servicio
    }
  }

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
    this.router.navigate([NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN]);
  }

  navigateToInvitations() {
    this.router.navigate([NAVIGATIONS_ROUTES.INVITATIONS]);
  }
  
  navigateToAuth() {
    this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
  }

  navigateToProfile() {
    this.router.navigate([NAVIGATIONS_ROUTES.PROFILE]);
  }
}
