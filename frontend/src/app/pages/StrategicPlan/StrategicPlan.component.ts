import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BasicService } from '../../service/basic.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_ROUTES } from '../../config/api.routes';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './StrategicPlan.component.html',
  styleUrls: ['./StrategicPlan.component.css'],
})
export class StrategicPlanComponent implements OnInit {
  strategicPlanData: any[] = [];
  responseMessage: string = '';
  public formStrategicPlan!: FormGroup;
  isFormVisible: boolean = false;
  public minEndDate: string = '';
  isEditMode: boolean = false; // Variable para indicar si es modo edición
  public currentPlanId: string = ''; // ID del plan actual a editar (si lo hay)

  constructor(
    private formBuilder: FormBuilder,
    private basicoService: BasicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.formStrategicPlan = this.formBuilder.group({
      mission: [''],
      vision: [''],
      values: [''],
      endDate: ['', Validators.required],
      name: ['', Validators.required],
    });
    // Obtener la fecha actual y sumar un mes
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    this.minEndDate = nextMonth.toISOString().split('T')[0];
  }

  loadData(): void {
    this.basicoService
      .getData(`${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`)
      .subscribe(
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

  // Método para editar un plan existente
  editPlan(plan: any): void {
    this.isEditMode = true; // Activar el modo edición
    this.currentPlanId = plan.id.toString();
    this.formStrategicPlan.patchValue(plan); // Cargar los datos del plan en el formulario
  }

  // Método para crear un nuevo plan
  createNewPlan(): void {
    this.isFormVisible = true; // Mostrar el formulario
    this.formStrategicPlan.reset(); // Limpiar el formulario
  }

  setFormVisibility(value: boolean): void {
    this.isFormVisible = value;
  }

  navigateToFodaMeca(): void {
    const FODAMECA: string = `/FodaMeca/${this.currentPlanId}`;
    console.log('FODAMECA', FODAMECA);
    this.router.navigate([FODAMECA]);
  }

  sendData(): void {
    if (this.isEditMode) {
      // Si estamos en modo edición, actualizamos y mandamos a hacer el FODAMECA
      this.updatePlan();
    } else {
      // Si no, creamos un nuevo plan
      this.createData();
    }
  }

  async createData(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.basicoService.createData(
        cleanedData,
        `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`
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

  async updatePlan(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();
      this.responseMessage = await this.basicoService
        .updateData(
          this.currentPlanId,
          cleanedData,
          `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`
        )
        .toPromise();
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
   * función para eliminar un plan por ID
   * @param id del plan a eliminar
   * @returns promesa con el mensaje de respuesta
   */
  async deletePlan(id: string): Promise<void> {
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
        this.responseMessage = await this.basicoService.deleteDataByID(
          id,
          `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`
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

  resetForm(): void {
    this.formStrategicPlan.reset();
    this.isEditMode = false; // Reiniciar el modo de edición
    this.currentPlanId = ''; // Limpiar el ID del plan actual
    this.isFormVisible = false; // Ocultar el formulario
  }

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
}
