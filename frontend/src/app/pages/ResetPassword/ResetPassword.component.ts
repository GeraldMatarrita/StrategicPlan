import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Importar AbstractControl
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
  resetPasswordForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordFormService: ResetPasswordFormService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.validateToken();

    // Inicializar el formulario
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordsMatchValidator // Validador de grupo
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
          title: 'Invalid or expired token',
          text: 'The link you followed is invalid or expired. Please try again.',
        });
        this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
      }
    );
  }

  // Cambiar el validador para que compare ambos campos directamente
  passwordsMatchValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }
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
