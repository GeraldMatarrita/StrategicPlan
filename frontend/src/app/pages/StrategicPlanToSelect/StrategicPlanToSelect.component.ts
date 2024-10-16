import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StrategicPlanService } from './StrategicPlanToSelect.service';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './StrategicPlanToSelect.component.html',
  styleUrls: ['./StrategicPlanToSelect.component.css'],
})
export class StrategicPlanToSelect implements OnInit {
  // Variable para almacenar el formulario
  formStrategicPlan!: FormGroup;
  minEndDate: string = '';
  isFormVisible: boolean = false;

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';
  // Variables para almacenar los datos de los planes estratégicos
  strategicPlanData: any[] = [];

  // Variable para almacenar el ID del usuario activo
  activeUserID: string = '';

  // Variable para indicar si se está viendo la vista de planes finalizados
  isFinishedPlansView: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private strategicPlanService: StrategicPlanService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Método que se ejecuta al iniciar el componente
   * - Inicializar el formulario
   * - Cargar los datos de los planes activos
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Método para inicializar el formulario
   * - Inicializar los campos del formulario
   * - Obtener la fecha actual y sumar para el mínimo de la fecha de fin
   */

  initializeForm() {
    this.formStrategicPlan = this.formBuilder.group({
      mission: [''],
      vision: [''],
      values: [''],
      endDate: ['', Validators.required],
      name: ['', Validators.required],
    });

    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    this.minEndDate = nextMonth.toISOString().split('T')[0];
  }

  /**
   * Método para cargar los datos de los planes estratégicos
   * - Obtener el ID del usuario activo
   * - Cargar los planes activos del usuario
   */
  async loadData(): Promise<void> {
    try {
      localStorage.removeItem('PlanID');
      localStorage.removeItem('ObjectiveID');
      this.activeUserID = await this.authService.getActiveUserID();
      this.loadActivePlans();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  /**
   * Método para cargar los planes activos del usuario
   */
  loadActivePlans() {
    this.strategicPlanService.getActivePlans(this.activeUserID).subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          this.strategicPlanData = data.map((item) => ({
            id: item._id,
            mission: item.mission,
            vision: item.vision,
            values: item.values,
            startDate: item.startDate,
            endDate: item.endDate,
            name: item.name,
          }));
        } else {
          this.strategicPlanData = [];
        }
        this.isFinishedPlansView = false;
      },
      (error: any) => {
        console.error('Error al obtener los planes activos:', error);
      }
    );
  }

  /**
   * Método para cargar los planes finalizados del usuario
   */
  loadFinishedPlans() {
    this.strategicPlanService.getFinishedPlans(this.activeUserID).subscribe(
      (data: any[]) => {
        this.strategicPlanData = data.map((item) => ({
          id: item._id,
          mission: item.mission,
          vision: item.vision,
          values: item.values,
          startDate: item.startDate,
          endDate: item.endDate,
          name: item.name,
        }));
        this.isFinishedPlansView = true;
      },
      (error: any) => {
        console.error('Error al obtener los planes finalizados:', error);
      }
    );
  }

  /**
   * Método para verificar si el plan ha expirado
   * @param endDate La fecha de finalización del plan
   * @returns true si el plan ha expirado, false en caso contrario
   */
  isPlanExpired(endDate: Date): boolean {
    const currentDate = new Date();
    return new Date(endDate) < currentDate;
  }

  /**
   * Función para seleccionar un plan y cargar el id en localStorage
   * @param plan Plan a editar
   */
  onClickPlan(plan: any): void {
    const planID: string = plan.id.toString(); // Usa 'string' en lugar de 'String'
    localStorage.setItem('PlanID', planID); // Guarda el ID en localStorage
    this.navigateToPlan();
  }

  /**
   * función para navegar a la página del plan seleccionado
   */
  navigateToPlan(): void {
    const PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([PLAN]);
  }

  /**
   * función para crear un nuevo plan
   * - limpiar el formulario
   * - mostrar el formulario
   */
  onClickCreateNewPlan(): void {
    this.formStrategicPlan.reset(); // Limpiar el formulario
    this.isFormVisible = true; // Mostrar el formulario
  }

  /**
   * función para mostrar u ocultar el formulario
   */
  setFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
    // Desplazar la página al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * función para enviar los datos del formulario en modo edición o creación según el caso
   */
  sendData(): void {
    this.createPlan();
  }

  /**
   * función para crear un plan estratégico
   * @returns promesa con el mensaje de respuesta
   */
  async createPlan(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage =
        await this.strategicPlanService.createStrategicPlan(
          cleanedData,
          this.activeUserID
        );
      Swal.fire({
        icon: 'success',
        title: 'Creado',
        text: this.responseMessage,
      });
      this.loadData();
      this.resetForm();
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
   * funcion para resetear el formulario
   * y ocultar el formulario volviendo al modo de selección de crear o ver plan
   */
  resetForm(): void {
    this.formStrategicPlan.reset();
    this.isFormVisible = false; // Ocultar el formulario
  }

  /**
   * función para limpiar los campos vacíos del formulario
   * @returns objeto con los datos limpios
   */
  private cleanFormData(): any {
    const formData = { ...this.formStrategicPlan.value }; // Crear una copia del objeto

    // Filtrar los campos vacíos y null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * función para navegar a la página de FODAMECA
   */
  showFinishedPlans(): void {
    this.isFinishedPlansView = true;
    this.loadFinishedPlans();
  }

  /**
   * función para navegar a la página de FODAMECA
   * y mostrar los planes activos
   */
  showActivePlans(): void {
    this.isFinishedPlansView = false;
    this.loadActivePlans();
  }
}
