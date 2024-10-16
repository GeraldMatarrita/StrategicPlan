import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Import AbstractControl
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

    // Initialize the form
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            // Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordsMatchValidator // Group validator
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

  // Validator to compare both fields directly
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
        title: 'Passwords do not match',
        text: 'Please ensure both passwords are the same.',
      });
      return;
    }

    const newPassword = this.resetPasswordForm.value.newPassword;

    this.resetPasswordFormService.resetPassword(this.token, newPassword)
      .subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Password changed',
            text: 'Your password has been successfully updated.',
          }).then(() => {
            this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an issue changing your password. Please try again later.',
          });
        }
      );
  }
}
