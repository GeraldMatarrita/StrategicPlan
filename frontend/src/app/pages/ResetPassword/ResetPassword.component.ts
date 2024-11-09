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
  token: string = ''; // Variable to store the token from the route
  tokenValid: boolean = false; // Boolean to check if the token is valid
  resetPasswordForm!: FormGroup; // Form group for handling the password reset form

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordFormService: ResetPasswordFormService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Retrieve token from URL
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    // Validate the token by calling the service
    this.validateToken();

    // Initialize the form with validation rules for password and confirm password
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6), // Password must have at least 6 characters
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/) // Password must contain at least one uppercase letter, a number, and a special character
          ]
        ],
        confirmPassword: ['', Validators.required] // Confirm password field
      },
      {
        validators: this.passwordsMatchValidator // Custom group validator for password matching
      }
    );
  }

  /**
   * Method to validate the token received in the URL
   * @returns void
   * @description Calls the service to validate the token and show an error if invalid.
   */
  validateToken() {
    this.resetPasswordFormService.validateToken(this.token).subscribe(
      (response) => {
        this.tokenValid = true; // If token is valid, set tokenValid to true
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Invalid or expired token',
          text: 'The link you followed is invalid or expired. Please try again.',
        });
        this.router.navigate([NAVIGATIONS_ROUTES.HOME]); // Navigate to home if the token is invalid
      }
    );
  }

  /**
   * Validator to ensure that the new password and confirm password fields match.
   * @param control AbstractControl - The control object containing the form values.
   * @returns {null | { passwordsMismatch: boolean }} Returns null if passwords match, else returns an error object.
   */
  passwordsMatchValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true }; // Set error if passwords do not match
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null; // No error if passwords match
    }
  }

  /**
   * Method to handle the password reset process
   * @returns void
   * @description If the form is valid, call the service to reset the password, otherwise show an error.
   */
  resetPassword() {
    if (this.resetPasswordForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
        text: 'Please ensure both passwords are the same.',
      });
      return; // If the form is invalid, stop the reset process
    }

    const newPassword = this.resetPasswordForm.value.newPassword; // Get the new password value

    this.resetPasswordFormService.resetPassword(this.token, newPassword)
      .subscribe(
        (response) => {
          // On success, show a success message and navigate to the login page
          Swal.fire({
            icon: 'success',
            title: 'Password changed',
            text: 'Your password has been successfully updated.',
          }).then(() => {
            this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
          });
        },
        (error) => {
          // Show an error message if the password reset fails
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an issue changing your password. Please try again later.',
          });
        }
      );
  }
}
