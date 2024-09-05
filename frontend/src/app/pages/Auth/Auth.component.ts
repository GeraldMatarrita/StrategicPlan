import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_ROUTES } from '../../config/api.routes';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AuthService } from './Auth.service';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './Auth.component.html',
  styleUrl: './Auth.component.css',
})
export class AuthComponent {
  public loginForm!: FormGroup;
  responseMessage: string = '';
  public registerForm!: FormGroup;
  regiterActive: boolean = false;
  userActive: string = '';
  activeUser: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  getUserActive(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tokenString = localStorage.getItem('token');

      if (tokenString) {
        try {
          const token = JSON.parse(tokenString);
          this.activeUser = token;
          console.log('usuario activo  en este momento', this.activeUser);
          resolve();
        } catch (error) {
          this.router.navigate(['/Auth']);
          reject();
        }
      } else {
        this.router.navigate(['/Auth']);
        reject();
      }
    });
  }

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

    this.getUserActive();
  }

  sendData(): void {
    if (this.regiterActive) {
      this.register();
    } else {
      this.login();
    }
  }

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

  changeForm(): void {
    this.regiterActive = !this.regiterActive;
  }
}
