import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../navigation/navigations.routes';
import { FodaMecaService } from './FodaMeca.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-foda-meca',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './FodaMeca.component.html',
  styleUrl: './FodaMeca.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FodaMecaComponent {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private FodaMecaSevice: FodaMecaService
  ) {}

  fodaMecaForm!: FormGroup;

  responseMessage: any = '';
  currentPlanId: any;

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
    this.currentPlanId = localStorage.getItem('PlanID');
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
   * función para navegar a la dirección anterior strategic-plan
   */
  goBack(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
  }
}
