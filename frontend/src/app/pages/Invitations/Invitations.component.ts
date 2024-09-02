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

interface User {
  id: string;
  name: string;
  email: string;
}

interface StrategicPlan {
  id: string;
  name: string;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './Invitations.component.html',
  styleUrl: './Invitations.component.css',
})
export class InvitationsComponent implements OnInit {
  public invitationForm!: FormGroup;
  usersToInvite: User[] = [];
  selectedUsers: User[] = [];
  strategicPlanData: StrategicPlan[] = [];
  showPlan: boolean = true;

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

  setFalseShowPlan(): void {
    this.showPlan = false;
  }

  invite(): void {
    if (this.invitationForm.valid) {
      console.log('Selected users:', this.invitationForm.get('users')?.value);
    }
  }
}
