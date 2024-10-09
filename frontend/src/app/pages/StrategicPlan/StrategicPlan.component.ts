import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StrategicPlanService } from './StrategicPlan.service';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './StrategicPlan.component.html',
  styleUrls: ['./StrategicPlan.component.css'],
})
export class StrategicPlanComponent implements OnInit {
  // Variable para almacenar el formulario
  formStrategicPlan!: FormGroup;
  minEndDate: string = '';
  isFormVisible: boolean = false;

  // Variable para almacenar el mensaje de respuesta
  responseMessage: string = '';
  // Variables para almacenar los datos de los planes estratégicos
  strategicPlanData: any[] = [];
  members: any[] = [];

  currentPlanId: string = ''; // ID del plan actual a editar

  // Variable para almacenar el ID del usuario activo
  activeUserID: string = '';

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

  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
  
      // Obtener la lista de planes del usuario
      const userPlans = await this.strategicPlanService.getActivePlans(this.activeUserID).toPromise();
  
      if (userPlans && userPlans.length > 0) {
        // Verificar si hay un PlanID almacenado en localStorage
        const storedPlanId = localStorage.getItem('PlanID');
        if (storedPlanId && userPlans.some(plan => plan._id === storedPlanId)) {
          // Si hay un PlanID almacenado y es válido, cargar el plan correspondiente
          this.currentPlanId = storedPlanId;
          this.loadPlanById(this.currentPlanId);
        } else {
          // Si no hay un PlanID almacenado o no es válido, redirigir
          this.navigateToSelectPlan();
        }
      } else {
        // Si el usuario no tiene planes, redirigir a la selección de plan´
        localStorage.removeItem('PlanID');
        this.navigateToSelectPlan();
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }
  
  /**
   * Método para enviar los datos del formulario
   */
  sendData(): void {
    this.updatePlan();
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
   *  Método para cargar los datos de un plan por su ID
   * @param planId ID del plan a cargar
   */
  loadPlanById(planId: string): void {
    this.strategicPlanService.getPlanByID(planId).subscribe(
      (data: any) => {
        this.strategicPlanData = [
          {
            id: data._id,
            mission: data.mission,
            vision: data.vision,
            values: data.values,
            startDate: data.startDate,
            endDate: data.endDate,
            name: data.name,
          },
        ];

        // Asignar datos de members_ListIDS a members como un array de objetos
        if (Array.isArray(data.members_ListIDS)) {
          this.members = data.members_ListIDS.map((member: any) => ({
            id: member._id,
            name: member.name,
          }));
        }
        this.formStrategicPlan.patchValue(data);
      },
      (error: any) => {
        console.error('Error al obtener el plan:', error);
      }
    );
  }

  /**
   * función para mostrar u ocultar el formulario
   */
  setFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  /**
   * función para actualizar un plan
   * @returns promesa con el mensaje de respuesta
   */
  async updatePlan(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();
      this.responseMessage =
        await this.strategicPlanService.updateStrategicPlan(
          this.currentPlanId,
          cleanedData
        );
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: this.responseMessage,
      });
      this.loadPlanById(this.currentPlanId);
      this.setFormVisibility();
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
   * función para salir de un plan
   * @param planID del plan a salir
   * @returns promesa con el mensaje de respuesta
   */
  async outPlan(planID: string): Promise<void> {

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
        this.responseMessage = await this.strategicPlanService.outStrategicPlan(
          planID,
          this.activeUserID
        );
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: this.responseMessage,
        });
        localStorage.removeItem('PlanID');
        this.navigateToSelectPlan();
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
  navigateToFodaMeca(): void {
    const FODAMECA: string = `${NAVIGATIONS_ROUTES.FODAMECA}`;
    this.router.navigate([FODAMECA]);
  }

  /**
   * función para cargar navegar a seleccionar un plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  navigateToInvitations(): void {
    // Verificar si hay un PlanID en el localStorage
    const selectedPlanId = localStorage.getItem('PlanID') || '';
    localStorage.setItem("planToInvite", selectedPlanId);
    
    if (selectedPlanId) {
      // Redirigir a la página de invitaciones
      this.router.navigate([NAVIGATIONS_ROUTES.INVITATIONS]);
    } else {
      // Si no hay un plan seleccionado, mostrar una alerta
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha seleccionado ningún plan.',
      });
    }
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
}
