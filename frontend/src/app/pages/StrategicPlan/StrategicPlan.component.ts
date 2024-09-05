import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StrategicPlanService } from './StrategicPlan.service';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../navigation/navigations.routes';

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

  planSelected: boolean = false; // Variable para indicar que selecionó un plan
  currentPlanId: string = ''; // ID del plan actual a editar (si lo hay)

  // Variable para almacenar el ID del usuario activo
  activeUserID: string = 'nada';

  constructor(
    private formBuilder: FormBuilder,
    private strategicPlanService: StrategicPlanService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Método que se ejecuta al iniciar el componente
   * - Cargar los datos (Obtener el ID del usuario activo)
   * - Inicializar el formulario
   * - Obtener la fecha actual y sumar para el mínimo de la fecha de fin
   */
  ngOnInit(): void {
    this.loadData();

    this.formStrategicPlan = this.formBuilder.group({
      mission: [''],
      vision: [''],
      values: [''],
      endDate: ['', Validators.required],
      name: ['', Validators.required],
    });
    // Obtener la fecha actual y sumar un mes para el mínimo de la fecha de fin del plan estratégico
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    this.minEndDate = nextMonth.toISOString().split('T')[0];
  }

  /**
   * Método para cargar los datos
   * - usuario activo
   * - planes estratégicos del usuario activo
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
      this.getStratecPlans();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  /**
   * Método para obtener los planes estratégicos del usuario activo                      --- esto aun no esta bien porque trae todos los planes no solo los del usuario el bueno esta en invitations
   */
  getStratecPlans() {
    this.strategicPlanService.getStrategicPlans().subscribe(
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
      },
      (error: any) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  /**
   * función para seleccionar un plan y cargar los datos en el formulario
   * @param plan plan a editar
   */
  onClickPlan(plan: any): void {
    this.planSelected = true;
    this.currentPlanId = plan.id.toString();
    this.formStrategicPlan.patchValue(plan); // Cargar los datos del plan en el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Hacer scroll al top de la página
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
  }

  /**
   * función para enviar los datos del formulario en modo edición o creación según el caso
   */
  sendData(): void {
    if (this.planSelected) {
      // Si estamos en modo edición, actualizamos el plan
      this.updatePlan();
    } else {
      this.createData();
    }
  }

  /**
   * función para crear un plan
   * @returns promesa con el mensaje de respuesta
   */
  async createData(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage =
        await this.strategicPlanService.createStrategicPlan(cleanedData);
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
      console.log(this.activeUserID);
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
        this.loadData();
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
   * funcion para resetear el formulario
   * y ocultar el formulario volviendo al modo de selección de crear o ver plan
   */
  resetForm(): void {
    this.formStrategicPlan.reset();
    this.planSelected = false; // Reiniciar el modo de edición
    this.currentPlanId = ''; // Limpiar el ID del plan actual
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
  navigateToFodaMeca(): void {
    const FODAMECA: string = `${NAVIGATIONS_ROUTES.FODAMECA}/${this.currentPlanId}`;
    console.log('FODAMECA', FODAMECA);
    this.router.navigate([FODAMECA]);
  }
}
