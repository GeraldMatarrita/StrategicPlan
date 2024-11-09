import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from './Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './Auth.component.html',
  styleUrl: './Auth.component.css',
})
export class AuthComponent {
  // Variables to store the forms
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;

  // Variable to store the response message
  responseMessage: string = '';

  // Variables to manage form states
  regiterActive: boolean = false;

  // Variable to store the active user
  activeUser: any = {};

  showResetPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Method that is executed when the component initializes
   */
  ngOnInit(): void {
    // Initialize login form with validation rules
    this.loginForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', [Validators.required]],
    });

    // Initialize registration form with validation rules
    this.registerForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        realName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordsMatchValidator, // Group validator to compare passwords
      }
    );

    this.loadData();
  }

  // Custom validator that compares the passwords
  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  /**
   * Method to load user data
   * - Load the active user
   */
  async loadData(): Promise<void> {
    try {
      this.activeUser = await this.authService.getActiveUser();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Method to handle login or registration based on the form state
   */
  sendData(): void {
    if (this.regiterActive) {
      this.register();
    } else {
      this.login();
    }
  }

  /**
   * Method to handle login
   * @returns A promise with the response message from SweetAlert
   */
  async login(): Promise<void> {
    try {
      const userOrEmail = this.loginForm.value.usernameOrEmail;
      const request = {
        name: userOrEmail,
        email: userOrEmail,
        password: this.loginForm.value.password,
      };
      // Call the login service and wait for the response
      const response = await this.authService.login(request);

      // Check if 'message' and 'userActive' are present in the response
      const message = response.message;
      const userActive = response.userActive;

      // Handle the response
      this.responseMessage = message;
      // Store the user data in localStorage
      localStorage.setItem('token', JSON.stringify(userActive));

      this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Method to register a new user
   * @returns A promise with a response message from SweetAlert
   */
  async register(): Promise<void> {
    try {
      const registerData = {
        name: this.registerForm.get('name')?.value,
        realName: this.registerForm.get('realName')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
      };

      this.responseMessage = await this.authService.createAccount(registerData);

      Swal.fire({
        icon: 'success',
        title: 'Registration',
        text: this.responseMessage,
      });

      // Automatic login after successful registration
      const loginResponse = await this.authService.login({
        email: registerData.email,
        password: registerData.password,
      });

      // Store user data in localStorage
      localStorage.setItem('token', JSON.stringify(loginResponse.userActive));

      Swal.fire({
        icon: 'success',
        title: 'Successful Registration',
        text: `Welcome! You have been successfully registered.`,
      });

      // Redirect the user to the home page
      this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Method to switch the active form (login or registration)
   */
  changeForm(): void {
    this.regiterActive = !this.regiterActive;
  }

  /**
   * Method to show the password reset form in a SweetAlert
   */
  toggleResetPassword(): void {
    const resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    Swal.fire({
      title: 'Reset Password',
      position: 'top',
      customClass: {
        popup: 'my-swal',
        title: 'my-swal-title',
        htmlContainer: 'my-swal-content',
        confirmButton: 'buttonReset',
        cancelButton: 'buttonCancelReset',
        input: 'inputReset',
      },
      html: `  
      <form id="reset-password-form">
        <div>
          <p>We will send you an email with a link to reset your password.</p>
          <br>
          <div class="form1-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Email">
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: 'Send Link',
      preConfirm: () => {
        const emailInput = (
          document.getElementById('email') as HTMLInputElement
        ).value;

        // Validate the form
        if (!resetPasswordForm.valid) {
          resetPasswordForm.get('email')?.setValue(emailInput);
          if (resetPasswordForm.invalid) {
            Swal.showValidationMessage(
              `<div class="my-validation-message">Please provide a valid email</div>`
            );
            return;
          }
        }
        return { email: emailInput };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const email = result.value?.email;

        if (email) {
          // Make a request to the password reset service
          this.authService.requestPasswordReset({ email }).subscribe(
            (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.message,
              });
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.error?.message || 'An error occurred',
              });
            }
          );
        }
      }
    });
  }
}
