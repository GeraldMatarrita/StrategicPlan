import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importar FormBuilder y Validators
import { ResetPasswordFormService } from './ResetPassword.service';
import Swal from 'sweetalert2';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-reset-password-form',
  templateUrl: './ResetPassword.component.html',
  styleUrls: ['./ResetPassword.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  tokenValid: boolean = false;
  resetPasswordForm!: FormGroup; // Añadir '!' para indicar que se inicializará

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordFormService: ResetPasswordFormService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.validateToken();

    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.passwordsMatchValidator, // Añadir la validación personalizada
      }
    );
  }

  validateToken() {
    this.resetPasswordFormService.validateToken(this.token).subscribe(
      (response) => {
        this.tokenValid = true;
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Token inválido o expirado',
          text: 'El enlace que has utilizado no es válido.',
        });
        this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
      }
    );
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor, verifica que ambas contraseñas son iguales.',
      });
      return;
    }

    const newPassword = this.resetPasswordForm.value.newPassword;

    this.resetPasswordFormService.resetPassword(this.token, newPassword)
      .subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido actualizada correctamente.',
          }).then(() => {
            this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cambiar tu contraseña. Inténtalo de nuevo más tarde.',
          });
        }
      );
  }
}
