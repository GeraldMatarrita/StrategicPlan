import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { ObjectivesService } from './Objectives.service';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './Objectives.component.html',
  styleUrls: ['./Objectives.component.css'],
})
export class ObjectivesComponent implements OnInit {
  // Variable para almacenar el formulario
  formObjectivesPlan!: FormGroup;
  activeUserID = '';

  constructor(
    private formBuilder: FormBuilder,
    private objectivesService: ObjectivesService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Método que se ejecuta al iniciar el componente
   * - Inicializar el formulario
   * - Cargar los datos
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Método para inicializar el formulario
   */
  initializeForm() {
    this.formObjectivesPlan = this.formBuilder.group({
      name: [''],
    });
  }

  /**
   * Método para cargar los datos y usuario activo
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }
}
