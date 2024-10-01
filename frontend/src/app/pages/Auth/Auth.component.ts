import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from './Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { Router } from '@angular/router';
// import { ResetPasswordComponent } from '../reset-password/reset.password.component';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './Auth.component.html',
  styleUrl: './Auth.component.css',
})
export class AuthComponent {
  // Variables para almacenar los formularios
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar el estado de los formularios
  regiterActive: boolean = false;

  // Variable para almacenar el usuario activo
  activeUser: any = {};

  showResetPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Método que se ejecuta al iniciar el componente
   */
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      password: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loadData();
  }

  /**
   * Método para cargar los datos
   *  - usuario activo
   */
  async loadData(): Promise<void> {
    try {
      this.activeUser = await this.authService.getActiveUser();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  /**
   * Método para login o registro según el estado del formulario
   */
  sendData(): void {
    if (this.regiterActive) {
      this.register();
    } else {
      this.login();
    }
  }

  /**
   * Método para hacer login
   * @returns Promesa y un mensaje de respuesta de SweetAlert
   */
  async login(): Promise<void> {
    try {
      const userOrEmail = this.loginForm.value.usernameOrEmail;
      const request = {
        name: userOrEmail,
        email: userOrEmail,
        password: this.loginForm.value.password,
      };
      // Llamar al servicio de login y esperar la respuesta
      const response = await this.authService.login(request);

      // Verifica si 'message' y 'userActive' están presentes
      const message = response.message;
      const userActive = response.userActive;

      // Manejar la respuesta
      this.responseMessage = message;
      // Almacenar los datos en localStorage
      localStorage.setItem('token', JSON.stringify(userActive));

      Swal.fire({
        icon: 'success',
        title: 'Login',
        text: this.responseMessage,
      });
      this.router.navigate([NAVIGATIONS_ROUTES.HOME]);
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Método para registrar un usuario
   * @returns Promesa con un mensaje de respuesta de SweetAlert
   */
  async register(): Promise<void> {
    try {
      this.responseMessage = await this.authService.createAccount(
        this.registerForm.value
      );
      Swal.fire({
        icon: 'success',
        title: 'Registro',
        text: this.responseMessage,
      });
      // Login automático después de un registro exitoso
      const request = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      };

      const loginResponse = await this.authService.login(request);

      // Almacenar los datos en localStorage
      localStorage.setItem('token', JSON.stringify(loginResponse.userActive));

      Swal.fire({
        icon: 'success',
        title: 'Successfull Registration',
        text: `Welcome ${this.activeUser.name}! You have been successfully registered.`,
      });

      // Redirigir al usuario a la página de inicio
      this.router.navigate([NAVIGATIONS_ROUTES.HOME]);

    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Método para cambiar el formulario activo
   */
  changeForm(): void {
    this.regiterActive = !this.regiterActive;
  }

  /**
   * Método para mostrar el formulario de restablecimiento de contraseña en un SweetAlert
   */
  toggleResetPassword(): void {
    const resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    Swal.fire({
      title: 'Reset Password',
      position: 'top', // Cambia la posición a 'top', 'top-start', 'top-end', etc.
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
          <label style="margin-bottom:6px" for="email">Email:</label>
          <br>
          <input class="inputReset" id="email" type="email" placeholder="Enter your email" class="swal2-input" />
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: 'Send Link',
      preConfirm: () => {
        const emailInput = (
          document.getElementById('email') as HTMLInputElement
        ).value;

        // Validar el formulario
        if (!resetPasswordForm.valid) {
          resetPasswordForm.get('email')?.setValue(emailInput);
          if (resetPasswordForm.invalid) {
            Swal.showValidationMessage('Please provide a valid email');
            return;
          }
        }
        return { email: emailInput };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const email = result.value?.email;

        if (email) {
          // Hacer la solicitud al servicio de restablecimiento de contraseña
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
