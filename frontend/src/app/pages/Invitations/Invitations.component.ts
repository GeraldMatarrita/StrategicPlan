import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { InvitationsService } from './Invitations.service';
import { AuthService } from '../Auth/Auth.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './Invitations.component.html',
  styleUrl: './Invitations.component.css',
})
export class InvitationsComponent implements OnInit {
  // Variables para almacenar los form
  public invitationForm!: FormGroup;

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables enviar las invitaciones
  usersToInvite: any[] = [];
  selectedUsers: any[] = [];
  strategicPlanId: string = '';

  // Variables para las invitaciones pendientes del usuario
  invitationData: any[] = [];

  // Variables para los planes estratégicos
  strategicPlanData: any[] = [];
  showPlans: boolean = true;

  // Variable para almacenar el usuario activo
  activeUserID: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private invitationsService: InvitationsService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Método que se ejecuta al iniciar el componente
   * - Inicializar el formulario de invitaciones
   * - Cargar los datos necesarios
   */
  ngOnInit(): void {
    // Inicializar el formulario de invitaciones
    this.invitationForm = this.formBuilder.group({
      users: [null, Validators.required],
    });

    // Cargar los datos necesarios
    this.loadData();
  }

  /**
   * Método para cargar los datos
   *  - usuario activo el ID
   *  - planes estratégicos del usuario
   *  - usuarios a invitar (excluyendo al usuario activo)
   *  - invitaciones pendientes del usuario
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
      this.loadStrategicPlansForActiveUser();
      this.getPendingInvitations();
      this.loadUserToInvite();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  /**
   * Método para cargar los planes estratégicos del usuario activo
   */
  loadStrategicPlansForActiveUser(): void {
    this.invitationsService
      .getStrategicPlansForUser(this.activeUserID)
      .subscribe(
        (data: any[]) => {
          this.strategicPlanData = data.map((item: any) => ({
            id: item._id,
            name: item.name,
          }));
        },
        (error: any) => {
          console.error('Error al obtener los datos:', error);
        }
      );
  }

  /**
   * Método para cargar los usuarios a invitar (excluyendo al usuario activo)
   */
  loadUserToInvite(): void {
    this.authService.getAllUsers().subscribe(
      (data: any[]) => {
        // Filtrar los usuarios para excluir al que coincide con activeUserID
        this.usersToInvite = data
          .filter((item: any) => item._id !== this.activeUserID)
          .map((item: any) => ({
            id: item._id,
            name: item.name,
            email: item.email,
          }));
      },
      (error: any) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  /**
   * Método para obtener las invitaciones pendientes del usuario activo
   */
  getPendingInvitations(): void {
    this.invitationsService.getInvitationsForUser(this.activeUserID).subscribe(
      (data: any) => {
        this.invitationData = data.invitations.filter(
          (invitation: any) => invitation.status === 'pending'
        );
      },
      (error: any) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  /**
   * Método para seleccionar un plan estratégico y cargarlo en la variable `strategicPlanId`
   * @param id ID del plan estratégico seleccionado
   */
  onSelectPlan(id: string): void {
    this.showPlans = false;
    this.strategicPlanId = id;
  }

  /**
   * Método para enviar una invitación
   * @param userId ID del usuario a invitar
   * @param planId ID del plan estratégico al que se invita al usuario
   */
  async createInvitation(userId: string, planId: string): Promise<void> {
    try {
      this.responseMessage = await this.invitationsService.createInvitation({
        userId,
        planId,
      });
      Swal.fire({
        icon: 'success',
        title: 'Invitaciones enviadas',
        text: 'Todas las invitaciones se enviaron correctamente.',
      });
    } catch (error) {
      this.responseMessage =
        (error as any)?.error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Método para enviar las invitaciones utiliza createInvitation para enviar
   * las invitaciones a todos los usuarios seleccionados
   */
  async sendInvitations(): Promise<void> {
    try {
      this.selectedUsers = this.invitationForm.get('users')?.value;

      // Usar Promise.all para ejecutar todas las promesas y manejar errores
      await Promise.all(
        this.selectedUsers.map((user) =>
          this.createInvitation(user, this.strategicPlanId)
        )
      );
    } catch (error) {
      // Si ocurre un error inesperado fuera de `createInvitation`
      Swal.fire({
        icon: 'error',
        title: 'Error en el envío de invitaciones',
        text: 'Ocurrió un error al enviar las invitaciones.',
      });
    }
  }

  /**
   * función para responder una invitación a un plan estratégico
   * @param decision aceptar o rechazar la invitación
   * @param planId id del plan estratégico al que se responde
   */
  async responseInvitation(decision: boolean, planId: string): Promise<void> {
    try {
      const responseMessage = await this.invitationsService.responseInvitation({
        decision: decision,
        planId: planId,
        userId: this.activeUserID,
      });
      Swal.fire({
        icon: 'success',
        title: 'Respuesta enviada',
        text: responseMessage,
      });
      this.loadData();
    } catch (error) {
      this.responseMessage =
        (error as any)?.error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }
}
