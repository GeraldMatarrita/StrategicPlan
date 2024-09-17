import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  // Variables para almacenar los formularios
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar el estado de los formularios
  regiterActive: boolean = false;

  // Variable para almacenar el usuario activo
  activeUser: any = {};

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
      password: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', Validators.required],
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

  navigateToStrategicPlan(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
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
      this.navigateToStrategicPlan();
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
}
