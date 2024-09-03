import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BasicService } from '../../service/basic.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { API_ROUTES } from '../../config/api.routes';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

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
  showPlan: boolean = true;
  strategicPlanId: string = '';
  responseMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private basicService: BasicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invitationForm = this.formBuilder.group({
      users: [null, Validators.required],
    });
    this.loadData();
  }

  loadData(): void {
    this.basicService
      .getData(`${API_ROUTES.BASE_URL}${API_ROUTES.GetAllUsers}`)
      .subscribe(
        (data: any[]) => {
          this.usersToInvite = data.map((item: any) => ({
            id: item._id,
            name: item.name,
            email: item.email,
          }));
        },
        (error: any) => {
          console.error('Error al obtener los datos:', error);
        }
      );

    this.basicService
      .getData(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`)
      .subscribe(
        (data: any[]) => {
          console.log(data);
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

  selectPlan(id: string): void {
    this.showPlan = false;
    this.strategicPlanId = id;
  }

  async createInvitation(userId: string, planId: string): Promise<void> {
    console.log('userId', userId);
    console.log('planID', planId);
    try {
      this.responseMessage = await this.basicService.createData(
        { userId, planId },
        `${API_ROUTES.BASE_URL}${API_ROUTES.SendInvitation}`
      );
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

  async sendInvitation(): Promise<void> {
    try {
      this.selectedUsers = this.invitationForm.get('users')?.value;
      console.log(this.selectedUsers);

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
}
