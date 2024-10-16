import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Auth/Auth.service';
import { ProfileService } from './profile.service';
import Swal from 'sweetalert2';

interface StrategicPlan {
  startDate: string | number | Date;
  endDate: string | number | Date;
  name: string;
}

interface UserProfile {
  name: string;
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
      name: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
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
        name: profile.name,
        email: profile.email,
      });
      this.disableForm();  // Asegurarse de que el formulario esté deshabilitado al cargar
      this.isEditing = false;  // Inicialmente no estamos en modo edición
    });
  }

  async loadUserProfileId() {
    this.activeUserID = await this.authService.getActiveUserID();
    this.loadStrategicPlans();
  }

  // Habilitar los campos del formulario para edición
  enableEdit() {
    this.isEditing = true;
    this.profileForm.get('name')?.enable();
    this.profileForm.get('email')?.enable();
  }

  // Deshabilitar los campos del formulario
  disableForm() {
    this.profileForm.get('name')?.disable();
    this.profileForm.get('email')?.disable();
  }

  // Cancelar la edición, deshabilitar el formulario y restaurar los valores originales
  cancelEdit() {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.userProfile?.name,
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
      name: this.profileForm.get('name')?.value,
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
      }, (error) => {
        console.error('Error updating profile', error);
        
        Swal.fire({
          title: 'Error!',
          text: 'There was an issue updating your profile. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred.',
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

  navigateBack() {
    this.router.navigate([]);
  }
}

