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

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './Invitations.component.html',
  styleUrl: './Invitations.component.css',
})
export class InvitationsComponent implements OnInit {
  public invitationForm!: FormGroup;
  usersToInvite: any[] = [];
  selectedUsers: any[] = [];
  strategicPlanData: any[] = [];
  showPlans: boolean = true;
  strategicPlanId: string = '';
  responseMessage: string = '';
  invitationData: any[] = [];
  activeUserID: string = '66d753b1a1514176bb2ffe08';

  constructor(
    private formBuilder: FormBuilder,
    private invitationsService: InvitationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invitationForm = this.formBuilder.group({
      users: [null, Validators.required],
    });
    this.loadData();
  }

  loadData(): void {
    this.loadStrategicPlans();
    this.getInvitations();
    this.loadUserToInvite();
  }

  loadStrategicPlans(): void {
    this.invitationsService.getStrategicPlans().subscribe(
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

  loadUserToInvite(): void {
    this.invitationsService.getAllUsers().subscribe(
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

  getInvitations(): void {
    this.invitationsService.getInvitationsForUser(this.activeUserID).subscribe(
      (data: any) => {
        this.invitationData = data.invitations;
      },
      (error: any) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  selectPlan(id: string): void {
    this.showPlans = false;
    this.strategicPlanId = id;
  }

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
