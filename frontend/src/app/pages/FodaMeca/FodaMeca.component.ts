import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy} from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NAVIGATIONS_ROUTES } from '../../navigation/navigations.routes';
import { FodaMecaService } from './FodaMeca.service';
import { API_ROUTES } from '../../config/api.routes';
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
  constructor
  (
    private fb: FormBuilder,
    private router: Router,
    private FodaMecaSevice:FodaMecaService
  ) { }
  
  fodaMecaForm!: FormGroup;
  lastSegment: any;

  responseMessage: any = '';
    strategicPlanData: any[] = [];
    currentPlanId : any;
    activeUserID: string = 'nada';
   

  ngOnInit() {
    this.fodaMecaForm = this.fb.group({
      strengths: [''],
      opportunities: [''],
      weaknesses: [''],
      threats: [''],
      maintain: [''],
      adapt: [''],
      correct: [''],
      explore: ['']
      
    }); 
    this.currentPlanId = localStorage.getItem('PlanID');
  
  }
  private cleanFormData(): any {
    const formData = { ...this.fodaMecaForm.value }; // Crear una copia del objeto
    return formData;
  }
  async onSubmit() {
    if (this.fodaMecaForm.valid) {
      console.log(this.fodaMecaForm.value);
      console.log("Este es el ID: ",this.activeUserID)
      try {
        const cleanedData = this.cleanFormData();
        this.responseMessage = await this.FodaMecaSevice.updateData(
            `${API_ROUTES.BASE_URL}${API_ROUTES.STRATEGIC_PLAN}`,
            this.currentPlanId,
            cleanedData
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
  goBack(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.STRATEGIC_PLAN]);
  }
}
