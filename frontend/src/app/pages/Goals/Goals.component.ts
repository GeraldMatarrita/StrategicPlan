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

  currentPlanId: string = ''; // ID del plan actual a editar
  activeUserID = ''; // ID del usuario activo
  isEditing = false; // Controla si estás editando o creando

  objectiveData: any = {};
  objectiveIdSelected: string = '';

  currentObjective: any = {}; // ID del objetivo actual a editar

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar los datos de los objetivos
  goalsData: any = [];
  plansData: any[] = []; // Para almacenar los planes estratégicos
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
    window.scrollTo(0, 0);
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
      // Cargar siempre los planes estratégicos
      this.activeUserID = await this.authService.getActiveUserID();
      this.strategicPlanService.getActivePlans(this.activeUserID).subscribe(
        (data: any[]) => {
          this.plansData = data;

          // Verificar si hay un PlanID almacenado en localStorage
          const storedPlanId = localStorage.getItem('PlanID');
          const storedObjectiveId = localStorage.getItem('ObjectiveID');

          if (storedPlanId) {
            this.currentPlanId = storedPlanId;
            this.loadObjectives(); // Cargar objetivos del plan almacenado

            if (storedObjectiveId) {
              this.objectiveIdSelected = storedObjectiveId;
              this.objectivesService
                .getObjectiveById(storedObjectiveId)
                .subscribe(
                  (data: any) => {
                    this.currentObjective = data;
                  },
                  (error: any) => {
                    console.error('Error al obtener el objetivo:', error);
                  }
                );
              this.formGoal.patchValue({
                objectiveIdSelectedForm: storedObjectiveId,
              });
              this.loadGoalsByObjective(storedObjectiveId); // Cargar metas del objetivo almacenado
            }
          } else {
            this.clearSelections();
          }
        },
        (error: any) => {
          console.error('Error al cargar los planes:', error);
        }
      );
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  clearSelections(): void {
    this.currentPlanId = '';
    this.objectiveIdSelected = '';
    this.goalsData = [];
  }

  /**
   * Método para cargar los objetivos del plan actual
   */
  async loadGoals(): Promise<void> {
    this.goalsService.getGoalsByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.goalsData = data;
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para cargar los objetivos del plan actual
   */
  async loadObjectives(): Promise<void> {
    this.objectivesService.getObjectivesByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.objectiveData = data;
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
      // Obtener el ObjectiveID desde localStorage
      const storedObjectiveId = localStorage.getItem('ObjectiveID');

      // Validar que no sea null o vacío
      if (!storedObjectiveId) {
        throw new Error('El ID del objetivo no está disponible.');
      }

      this.objectiveIdSelected = storedObjectiveId;

      // Limpiar el formulario antes de enviarlo
      this.formGoal.value.objectiveIdSelectedForm = undefined;
      const cleanedData = this.cleanFormData();

      // Crear el Goal con el ObjectiveID seleccionado
      this.responseMessage = await this.goalsService.createGoal(
        cleanedData,
        this.objectiveIdSelected
      );

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Meta creada',
      });

      // Recargar los Goals
      this.loadGoalsByObjective(this.objectiveIdSelected);

      // Ocultar el modal y limpiar el formulario
      this.toogleShowModal();
      this.formGoal.reset();
    } catch (error) {
      // Manejo de errores y mostrar mensaje al usuario
      console.error('Error al crear la meta:', error);
      this.responseMessage =
        (error as any).message || 'Error desconocido al crear la meta';
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
      delete this.formGoal.value.objectiveIdSelectedForm;
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

  async loadGoalsByObjective(objectiveId: string | null): Promise<void> {
    if (objectiveId) {
      // Filtrar los Goals por el Objective seleccionado
      this.objectivesService.getGoalsByObjectiveId(objectiveId).subscribe(
        (data: any[]) => {
          this.goalsData = data;
        },
        (error: any) => {
          console.error('Error al obtener los Goals:', error);
        }
      );
    } else {
      // Si no hay ningún Objective seleccionado, limpiar Goals
      this.goalsData = [];
    }
  }

  // Método para manejar el cambio de objetivo seleccionado
  onObjectiveChange(): void {
    if (this.objectiveIdSelected) {
      this.loadGoalsByObjective(this.objectiveIdSelected);
      localStorage.setItem('ObjectiveID', this.objectiveIdSelected);
      this.objectivesService
        .getObjectiveById(this.objectiveIdSelected)
        .subscribe(
          (data: any) => {
            this.currentObjective = data;
          },
          (error: any) => {
            console.error('Error al obtener el objetivo:', error);
          }
        );
    } else {
      // Si no hay un objetivo seleccionado, limpiar Goals
      this.goalsData = [];
      localStorage.removeItem('ObjectiveID');
    }
  }

  navigateToSelectedPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  onPlanChange(): void {
    this.goalsData = []; // Limpiar las metas al cambiar de plan
    this.objectiveIdSelected = ''; // Limpiar el objetivo seleccionado al cambiar de plan
    this.loadObjectives(); // Cargar los objetivos del plan seleccionado
    localStorage.setItem('PlanID', this.currentPlanId); // Actualizar el PlanID en localStorage
    localStorage.removeItem('ObjectiveID'); // Limpiar ObjectiveID cuando se cambia el plan
  }

  getProgressColor(value: number): string {
    if (value >= 100) {
      return '#a4fba6'; // Verde claro para 100
    } else if (value >= 75) {
      return '#71e48b'; // Verde más claro para 75-99
    } else if (value >= 50) {
      return '#3ac778'; // Verde oscuro para 50-74
    } else if (value >= 25) {
      return '#ff9933'; // Naranja para 25-49
    } else {
      return '#ff3300'; // Rojo para 0-24
    }
  }
}
