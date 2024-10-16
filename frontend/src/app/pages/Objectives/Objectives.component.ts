import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { ObjectivesService } from './Objectives.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-objectives',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './Objectives.component.html',
  styleUrls: ['./Objectives.component.css'],
})
export class ObjectivesComponent implements OnInit {
  // Variable para almacenar el formulario
  formObjective!: FormGroup;
  activeUserID = '';
  currentPlanId: string = ''; // ID del plan actual a editar
  currentPlan: any = {};
  isEditing = false; // Controla si estás editando o creando
  plansData: any[] = []; // Para almacenar los planes estratégicos

  showReadModal: boolean = false; // Para controlar el modal de solo lectura
  selectedObjective: any = {}; // Para almacenar el objetivo seleccionado

  objectiveGoals: any[] = []; // Para almacenar los objetivos del plan

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';

  // Variables para almacenar los datos de los objetivos
  objectivesData: any[] = [];
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
    window.scrollTo(0, 0);
  }

  /**
   * Método para inicializar el formulario
   */
  initializeForm() {
    this.formObjective = this.formBuilder.group({
      title: ['', [Validators.required]], // Agregar este campo
      description: ['', [Validators.required]],
      totalGoals: [''],
      completedGoals: [''],
    });
  }

  /**
   * Método para cargar los datos y usuario activo
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();

      this.strategicPlanService
        .getActivePlans(this.activeUserID)
        .subscribe((data: any[]) => {
          this.plansData = data; // Guardar los planes en la propiedad
        });

      // Verificar si hay un PlanID almacenado en localStorage
      const storedPlanId = localStorage.getItem('PlanID');

      if (storedPlanId) {
        // Si hay un PlanID almacenado, cargar el plan correspondiente
        this.currentPlanId = storedPlanId;
        await this.loadObjectives();
        this.loadStrategicPlan();
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  onPlanChange(): void {
    this.loadObjectives(); // Cargar los objetivos del plan seleccionado
    localStorage.setItem('PlanID', this.currentPlanId); // Actualizar el PlanID en localStorage
    this.currentPlan = this.plansData.find(
      (plan) => plan._id === this.currentPlanId
    );
  }

  loadStrategicPlan(): void {
    this.strategicPlanService.getPlanByID(this.currentPlanId).subscribe(
      (data: any) => {
        this.currentPlan = data;
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * Método para cargar los objetivos del plan actual
   */
  async loadObjectives() {
    try {
      this.objectivesService
        .getObjectivesByPlanId(this.currentPlanId)
        .subscribe(
          (data: any[]) => {
            this.objectivesData = data; // Asigna los datos a objectivesData
          },
          (error: any) => {
            console.error('Error al cargar los objetivos', error);
          }
        );
    } catch (error) {
      console.error('Error al cargar los objetivos', error);
    }
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
        title: 'Objective created',
        text: this.responseMessage,
      });
      this.loadObjectives();
      this.toogleShowModal();
      this.formObjective.reset();
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
  // Objectives.component.ts
  async deleteObjective(objectiveId: string, planId: string): Promise<void> {
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
        // Paso 1: Obtener el plan para eliminar la referencia
        const plan = await this.strategicPlanService
          .getPlanByID(planId)
          .toPromise();

        // Eliminar la referencia del objetivo en el plan
        const updatedObjectiveList = plan.objective_ListIDS.filter(
          (objId: string) => objId !== objectiveId
        )

        // Paso 2: Actualizar el plan sin el objetivo
        await this.strategicPlanService.updateStrategicPlan(planId, {
          objective_ListIDS: updatedObjectiveList,
        });

        // Paso 3: Eliminar el objetivo
        const responseMessage = await this.objectivesService.deleteObjective(
          objectiveId
        );

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: responseMessage,
        });

        this.loadObjectives(); // Carga de los objetivos actualizados
      }
    } catch (error) {
      const responseMessage =
        (error as any).error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: responseMessage,
      });
    }
  }

  /**
   * Método para actualizar un objetivo
   */
  updateObjective() {
    if (this.formObjective.valid) {
      const updatedObjective = {
        title: this.formObjective.value.title,
        description: this.formObjective.value.description,
      };

      this.objectivesService.updateObjective(this.selectedObjective._id, updatedObjective)
        .then(() => {
          this.toogleShowModal(); // Cierra el modal después de actualizar
          // Aquí puedes agregar lógica adicional, como actualizar la lista de objetivos
          this.loadObjectives(); // Supón que tienes un método para recargar la lista de objetivos
        })
        .catch(error => {
          console.error('Error updating objective:', error);
        });
    }
  }
  
  /**
   * función para limpiar los campos vacíos del formulario
   * @returns objeto con los datos limpios
   */
  private cleanFormData(): any {
    const formData = { ...this.formObjective.value }; // Crear una copia del objeto

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

  navigateToSelectedPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  async loadObjectiveGoals(objectiveId: string): Promise<void> {
    this.objectivesService.getGoalsByObjectiveId(objectiveId).subscribe(
      (data: any[]) => {
        this.objectiveGoals = data;
      },
      (error: any) => {
        console.error('Error al obtener los objetivos:', error);
      }
    );
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
    this.formObjective.reset();
  }

  /**
   * Método para cuando se hace click en un objetivo
   */
  onClickObjective(objective: any): void {
    this.formObjective.patchValue(objective);
    this.selectedObjective = objective;
    this.isEditing = true;
    this.showModal = true;
  }

  /**
   * Método para mostrar el modal de solo lectura
   */
  onViewObjective(item: any): void {
    this.objectiveIdSelected = item._id;
    this.loadObjectiveGoals(this.objectiveIdSelected);
    this.selectedObjective = item; // Asignar el objetivo seleccionado
    this.toogleReadModal(); // Mostrar el modal
  }

  /**
   * Método para mostrar u ocultar el modal de solo lectura
   */
  toogleReadModal(): void {
    this.showReadModal = !this.showReadModal;
  }

  handleRedirectToGoals(objectiveId: string): void {
    const ObjectiveTitle = this.objectivesData.find(
      (objective) => objective._id === objectiveId
    ).title;
    localStorage.setItem('ObjectiveTitle', ObjectiveTitle);
    localStorage.setItem('ObjectiveID', objectiveId);
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }
}
