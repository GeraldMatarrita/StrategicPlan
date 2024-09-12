import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { FodaMecaService } from './FodaMeca.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-foda-meca',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './FodaMeca.component.html',
  styleUrl: './FodaMeca.component.css',
})
export class FodaMecaComponent {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private FodaMecaSevice: FodaMecaService
  ) {}

  fodaMecaForm!: FormGroup;

  responseMessage: any = '';
  currentPlanId: string = '';
  fodaMecaData: any = [];
  editMode = false;

  ngOnInit() {
    this.fodaMecaForm = this.formBuilder.group({
      strengths: [''],
      opportunities: [''],
      weaknesses: [''],
      threats: [''],
      maintain: [''],
      adapt: [''],
      correct: [''],
      explore: [''],
    });
    this.currentPlanId = String(localStorage.getItem('PlanID'));
    this.getFodaMecaForPlan();
  }

  /**
   * funcion para enviar los datos a actualizar de fodaMeca
   * @returns
   */
  async updateFodaMecaForPlan(): Promise<void> {
    if (this.fodaMecaForm.valid) {
      try {
        this.responseMessage = await this.FodaMecaSevice.updateFodaMeca(
          this.currentPlanId,
          this.fodaMecaForm.value
        );
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: this.responseMessage,
        });
        this.getFodaMecaForPlan();
        this.editMode = false;
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
  }

  /**
   * función para obtener los datos de FODA y MECA de un plan
   * - Se obtienen los datos de FODA y MECA de un plan y se asignan al formulario y
   *  a la variable `fodaMecaData`
   */
  getFodaMecaForPlan(): void {
    this.FodaMecaSevice.getFodaMecaData(this.currentPlanId).subscribe(
      (data: any) => {
        // Verifica si los datos incluyen FODA y MECA
        if (data && data.FODA && data.MECA) {
          // Asignar los datos FODA y MECA al formulario
          this.fodaMecaData = {
            strengths: data.FODA.strengths,
            opportunities: data.FODA.opportunities,
            weaknesses: data.FODA.weaknesses,
            threats: data.FODA.threats,
            maintain: data.MECA.maintain,
            adapt: data.MECA.adapt,
            correct: data.MECA.correct,
            explore: data.MECA.explore,
          };

          // Llenar el formulario con los datos obtenidos
          this.fodaMecaForm.patchValue(this.fodaMecaData);
          console.log('fodameca data', this.fodaMecaData);
        }
      },
      (error: any) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  /**
   * función para navegar a la dirección anterior strategic-plan
   */
  goBack(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
  }

  /**
   * función para habilitar o deshabilitar el modo de edición
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    console.log(this.editMode);
  }
}
