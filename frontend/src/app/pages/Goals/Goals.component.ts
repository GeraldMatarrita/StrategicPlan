import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { GoalsService } from './Goals.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';
import { ObjectivesService } from '../Objectives/Objectives.service';

import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './Goals.component.html',
  styleUrls: ['./Goals.component.css'],
})
export class GoalsComponent implements OnInit {
  // Variable para almacenar el formulario
  formGoal!: FormGroup;

  activeUserID = '';
  currentPlanId: string = ''; // ID del plan actual a editar
  planData: any = {};
  isEditing = false; // Controla si estás editando o creando

  objectiveData: any = {};
  objectiveIdSelected: string = '';

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar los datos de los objetivos
  goalsData: any = [];
  goalsIdSelected: string = '';

  showModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private goalsService: GoalsService,
    private router: Router,
    private strategicPlanService: StrategicPlanService,
    private authService: AuthService,
    private objectivesService: ObjectivesService
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
    this.formGoal = this.formBuilder.group({
      objectiveIdSelectedForm: [''],
      description: ['', [Validators.required]],
      totalActivities: [''],
      completedActivities: [''],
      responsible: [''],
    });
  }

  /**
   * Método para cargar los datos y usuario activo
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();

      // Verificar si hay un PlanID almacenado en localStorage
      const storedPlanId = localStorage.getItem('PlanID');
      if (storedPlanId) {
        // Si hay un PlanID almacenado, cargar el plan correspondiente
        this.currentPlanId = storedPlanId;
      } else {
        // Si no
        this.navigateToSelectPlan();
      }

      this.loadGoals();
      this.loadStrategicPlan();
      this.loadObjectives();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  loadStrategicPlan(): void {
    this.strategicPlanService.getPlanByID(this.currentPlanId).subscribe(
      (data: any) => {
        this.planData = data;
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para cargar los objetivos del plan actual
   */
  loadGoals(): void {
    this.goalsService.getGoalsByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.goalsData = data;
        console.log('goals', data);
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para cargar los objetivos del plan actual
   */
  loadObjectives(): void {
    this.objectivesService.getObjectivesByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.objectiveData = data;
        console.log('objectives', this.objectiveData);
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para crear un objetivo
   */
  async createGoal(): Promise<void> {
    try {
      this.objectiveIdSelected = this.formGoal.value.objectiveIdSelectedForm;
      this.formGoal.value.objectiveIdSelectedForm = undefined;
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.goalsService.createGoal(
        cleanedData,
        this.objectiveIdSelected
      );
      Swal.fire({
        icon: 'success',
        title: 'Creado',
        text: this.responseMessage,
      });
      this.loadGoals();
      this.toogleShowModal();
      this.formGoal.reset();
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
   * Método para eliminar un objetivo
   */
  // async deleteGoal(): Promise<void> {
  //   try {
  //     const result = await Swal.fire({
  //       title: '¿Estás seguro?',
  //       text: 'No podrás revertir esto',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Sí, eliminar',
  //       cancelButtonColor: '#f52d0a',
  //     });
  //     if (result.isConfirmed) {
  //       this.responseMessage = await this.goalsService.deleteG(
  //         this.goalsIdSelected,
  //         this.currentPlanId
  //       );
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Eliminado',
  //         text: this.responseMessage,
  //       });
  //       this.loadGoals();
  //       this.toogleShowModal();
  //     }
  //   } catch (error) {
  //     this.responseMessage =
  //       (error as any).error?.message || 'Error desconocido';
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: this.responseMessage,
  //     });
  //   }
  // }

  /**
   * Método para actualizar un Goals
   */
  async updateGoal(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.goalsService.updateGoal(
        this.goalsIdSelected,
        cleanedData
      );
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: this.responseMessage,
      });
      this.loadGoals();
      this.toogleShowModal();
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
   * función para limpiar los campos vacíos del formulario
   * @returns objeto con los datos limpios
   */
  private cleanFormData(): any {
    const formData = { ...this.formGoal.value }; // Crear una copia del objeto

    // Filtrar los campos vacíos y null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * Método para mostrar u ocultar el modal
   */
  toogleShowModal(): void {
    this.showModal = !this.showModal;
  }

  /**
   * Método para cuando se hace click en el botón de agregar objetivo
   * - Cambiar el estado de edición
   * - Mostrar el modal
   * - Limpiar el formulario
   * - Cambiar el estado de edición
   */
  onClickAddGoal(): void {
    this.isEditing = false;
    this.showModal = true;
    this.formGoal.reset();
  }

  /**
   * Método para cuando se hace click en un objetivo
   */
  onClickGoal(goal: any): void {
    this.goalsIdSelected = goal._id;
    this.formGoal.patchValue(goal);
    this.isEditing = true;
    this.showModal = true;
  }

  /**
   * función para cargar navegar a seleccionar un plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }
}
