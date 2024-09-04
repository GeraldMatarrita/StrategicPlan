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

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

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
  }

  sendData(): void {
    if (this.regiterActive) {
      this.register();
    } else {
      this.login();
    }
  }

  login(): void {}

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
