import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Auth/Auth.service';
import { ProfileService } from './profile.service';
import Swal from 'sweetalert2';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

interface StrategicPlan {
  startDate: string | number | Date;
  endDate: string | number | Date;
  name: string;
}

interface UserProfile {
  realName: string;
  email: string;
  strategicPlans: StrategicPlan[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  activeUserID: string = '';
  activeUser: any = {};
  userProfile: UserProfile | null = null;
  isEditing = false;  // Estado para controlar si estamos editando o no
  strategicPlans: StrategicPlan[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      realName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserProfileId();
  }

  // Cargar el perfil del usuario
  async loadUserProfile() {
    await this.authService.getActiveUser().then((profile) => {
      this.userProfile = profile;
      this.profileForm.patchValue({
        realName: profile.realName,
        email: profile.email,
        username: profile.name,
      });
      this.disableForm();  // Asegurarse de que el formulario esté deshabilitado al cargar
      this.isEditing = false;  // Inicialmente no estamos en modo edición
    });
  }

  async loadUserProfileId() {
    this.activeUser = await this.authService.getActiveUser();
    this.activeUserID = this.activeUser._id;
    this.loadStrategicPlans();
  }

  // Habilitar los campos del formulario para edición
  enableEdit() {
    this.isEditing = true;
    this.profileForm.get('realName')?.enable();
    this.profileForm.get('email')?.enable();
  }

  // Deshabilitar los campos del formulario
  disableForm() {
    this.profileForm.get('realName')?.disable();
    this.profileForm.get('email')?.disable();
  }

  // Cancelar la edición, deshabilitar el formulario y restaurar los valores originales
  cancelEdit() {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.userProfile?.realName,
      email: this.userProfile?.email,
    });
    this.disableForm();  // Volver a deshabilitar los campos
  }

  // Actualizar perfil del usuario
  async updateUserProfile() {
    if (this.profileForm.invalid) {
      return;  // Evitar la actualización si el formulario no es válido
    }

    const updatedProfile = {
      realName: this.profileForm.get('realName')?.value,
      email: this.profileForm.get('email')?.value,
    };

    try {
      // Llamar al servicio para actualizar el usuario en el backend
      await this.authService.updateUserInBackend(this.activeUserID, updatedProfile).then(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.loadUserProfile();  // Recargar el perfil para reflejar los cambios
        this.cancelEdit();  // Salir del modo de edición
      });
    } catch (error) {
      Swal.fire({
        title: 'An unexpected error occurred',
        text: (error as any).error.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  async loadStrategicPlans() {
    await this.profileService.getActivePlans(this.activeUserID).subscribe((plans) => {
      this.strategicPlans = plans;
    });
  }

  navigateStrategicPlans() {
    this.router.navigate([NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN]);
  }
}
