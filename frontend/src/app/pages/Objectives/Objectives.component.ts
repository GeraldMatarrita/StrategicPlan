import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { ObjectivesService } from './Objectives.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';

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
  currentPlanId: string = ''; // ID del plan actual a editar
  planData: any = {};
  isEditing = false; // Controla si estás editando o creando

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar los datos de los objetivos
  objectivesData: any = [];
  objectiveIdSelected: string = '';

  showModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private objectivesService: ObjectivesService,
    private router: Router,
    private strategicPlanService: StrategicPlanService,
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
      description: ['', [Validators.required]],
      totalGoals: [''],
      completedGoals: [''],
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

      this.loadObjectives();
      this.loadStrategicPlan();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  loadStrategicPlan(): void {
    this.strategicPlanService.getPlanByID(this.currentPlanId).subscribe(
      (data: any) => {
        console.log(data);
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
  loadObjectives(): void {
    this.objectivesService.getObjectivesByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.objectivesData = data;
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para crear un objetivo
   */
  async createObjective(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.objectivesService.createObjective(
        cleanedData,
        this.currentPlanId
      );
      Swal.fire({
        icon: 'success',
        title: 'Creado',
        text: this.responseMessage,
      });
      this.loadObjectives();
      this.toogleShowModal();
      this.formObjectivesPlan.reset();
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
  async deleteObjective(): Promise<void> {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonColor: '#f52d0a',
      });
      if (result.isConfirmed) {
        this.responseMessage = await this.objectivesService.deleteObjective(
          this.objectiveIdSelected,
          this.currentPlanId
        );
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: this.responseMessage,
        });
        this.loadObjectives();
        this.toogleShowModal();
      }
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
   * Método para actualizar un objetivo
   */
  async updateObjective(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.objectivesService.updateObjective(
        cleanedData,
        this.objectiveIdSelected
      );
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: this.responseMessage,
      });
      this.loadObjectives();
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
    const formData = { ...this.formObjectivesPlan.value }; // Crear una copia del objeto

    // Filtrar los campos vacíos y null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * función para cargar navegar a seleccionar un plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
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
  onClickAddObjective(): void {
    this.isEditing = false;
    this.showModal = true;
    this.formObjectivesPlan.reset();
  }

  /**
   * Método para cuando se hace click en un objetivo
   */
  onClickObjective(objective: any): void {
    this.objectiveIdSelected = objective._id;
    this.formObjectivesPlan.patchValue(objective);
    this.isEditing = true;
    this.showModal = true;
  }
}
