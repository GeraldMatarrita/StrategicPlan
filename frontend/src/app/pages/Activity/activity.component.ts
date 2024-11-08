import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../Activity/activity.service';
import { IndicatorService } from '../Indicators/indicators.service';
import { OperationalPlanService } from '../OperationalPlan/operationalPlan.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';
import { AuthService } from '../Auth/Auth.service';
import Swal from 'sweetalert2';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  standalone: true,
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ActivityComponent implements OnInit {
  activityIndicatorForm!: FormGroup;
  operationalPlanId: string = '';
  members: any[] = [];
  currentIndicatorId: string = '';
  currentActivityId: string = '';
  currentActivity: any = {};
  isPercentageType: boolean = false;
  showTotalField: boolean = false;
  isCreatingActivity: boolean = true;
  isViewMode: boolean = false;
  isEditing: boolean = false;
  responsible: any = {};
  isActiveOperationalPlan: boolean = true;

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private indicatorService: IndicatorService,
    private operationalPlanService: OperationalPlanService,
    private strategicPlan: StrategicPlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.operationalPlanId = localStorage.getItem('OperationalPlanID') || '';
    this.isActiveOperationalPlan =
      localStorage.getItem('isActiveOperationalPlan') === 'true';
    this.loadMembers();
    const isViewing = localStorage.getItem('ActivityID') !== null;
    if (isViewing) {
      this.isCreatingActivity = false; // Deshabilita la creación y pasa a vista de solo lectura
      this.isViewMode = true;
      this.showTotalField = true; // Mostrar campo total
      this.loadActivityData(); // Método para cargar datos del activity e indicador
    }
  }

  initializeForms(): void {
    this.activityIndicatorForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      responsible: ['', Validators.required],
      indicators_ListIDS: [[]], // Require indicators

      // Campos del indicador
      indicatorDescription: ['', Validators.required],
      indicatorType: ['', Validators.required],
      indicatorActual: [0, Validators.required],
      indicatorEvidence: [''],
      indicatorTotal: [
        0,
        this.isPercentageType
          ? [Validators.required, Validators.min(1), Validators.max(100)]
          : [Validators.required, Validators.min(1)],
      ],
    });
  }

  loadActivityData(): void {
    this.currentActivityId = localStorage.getItem('ActivityID') || '';

    this.activityService
      .getActivityById(this.currentActivityId)
      .subscribe((activity) => {
        this.currentActivity = activity;
        this.activityIndicatorForm.patchValue({
          title: activity.title,
          description: activity.description,
          responsible: activity.responsible,
        });

        const userId = activity.responsible;
        this.authService.getUserById(userId).subscribe((user) => {
          this.responsible = user;
        });

        // Filtrar el indicador correspondiente usando el activeOperationalPlanId
        const currentIndicatorId = localStorage.getItem('IndicatorID');
        const matchedIndicator = activity.indicators_ListIDS.find(
          (indicatorId: string) => indicatorId === currentIndicatorId
        );

        if (matchedIndicator) {
          this.indicatorService
            .getIndicatorById(matchedIndicator)
            .subscribe((indicator) => {
              this.activityIndicatorForm.patchValue({
                indicatorDescription: indicator.description,
                indicatorType: indicator.type,
                indicatorActual: indicator.actual,
                indicatorTotal: indicator.total,
                indicatorEvidence: indicator.evidence,
              });
              this.currentIndicatorId = matchedIndicator;
            });
        } else {
          Swal.fire(
            'Error',
            'There is no indicator for the current operational plan.',
            'error'
          );
        }
      });
  }

  loadMembers(): void {
    const planID = localStorage.getItem('PlanID') || '';
    this.strategicPlan.getPlanByID(planID).subscribe(
      (plan) => {
        this.members = plan.members_ListIDS;
      },
      (error) => {
        Swal.fire('Error', 'No se pudieron cargar los miembros.', 'error');
      }
    );
  }

  createActivityAndIndicator(): void {
    if (this.activityIndicatorForm.invalid) {
      Swal.fire('Error', 'The form is invalid.', 'error');
      return;
    }

    const goalId = localStorage.getItem('GoalID') || '';
    const activityData = {
      title: this.activityIndicatorForm.value.title,
      description: this.activityIndicatorForm.value.description,
      responsible: this.activityIndicatorForm.value.responsible,
      indicators_ListIDS: [], // Se agregará después de crear el Indicator
    };

    // Crear la Activity primero
    this.activityService
      .createActivity(activityData, goalId)
      .then((activityResponse: any) => {
        const indicatorData = {
          description: this.activityIndicatorForm.value.indicatorDescription,
          type: this.activityIndicatorForm.value.indicatorType,
          actual: this.activityIndicatorForm.value.indicatorActual,
          total:
            this.activityIndicatorForm.value.indicatorType === 'BINARY'
              ? 1
              : this.activityIndicatorForm.value.indicatorTotal,
          operationalPlanId: this.operationalPlanId,
          activityId: activityResponse._id, // Asociar el Indicator con la Activity creada
          evidence: this.activityIndicatorForm.value.evidence,
        };

        // Crear el Indicator asociado a la Activity
        this.indicatorService
          .createIndicator(indicatorData)
          .then((indicatorResponse) => {
            // Actualizar la Activity con el ID del Indicator
            this.activityService
              .updateActivity(activityResponse._id, {
                indicators_ListIDS: [indicatorResponse._id],
              })
              .then(() => {
                Swal.fire(
                  'Éxito',
                  'Activity and Indicator created successfully',
                  'success'
                );
                this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
              })
              .catch((error: any) => {
                Swal.fire(
                  'Error',
                  'Failed to update activity with indicator.',
                  'error'
                );
              });
          })
          .catch(() => {
            Swal.fire('Error', 'The indicator could not be created.', 'error');
          });
      })
      .catch(() => {
        Swal.fire('Error', 'The activity could not be created.', 'error');
      });
  }

  navigateBack(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  toggleEditMode(): void {
    this.isViewMode = !this.isViewMode;
    this.isEditing = !this.isEditing;
  }

  saveChanges(): void {
    if (this.activityIndicatorForm.valid) {
      const activityData = {
        title: this.activityIndicatorForm.value.title,
        description: this.activityIndicatorForm.value.description,
        responsible: this.activityIndicatorForm.value.responsible,
      };

      // Actualizar la actividad
      this.activityService
        .updateActivity(this.currentActivityId, activityData)
        .then(() => {
          this.isViewMode = true;
          this.isEditing = false;
          Swal.fire('Success', 'Activity updated successfully', 'success');
        })
        .catch((error) => {
          Swal.fire('Error', 'The activity could not be updated.', 'error');
        });

      const updatedIndicatorData = {
        description: this.activityIndicatorForm.value.indicatorDescription,
        type: this.activityIndicatorForm.value.indicatorType,
        actual: this.activityIndicatorForm.value.indicatorActual,
        total:
          this.activityIndicatorForm.value.indicatorType === 'BINARY'
            ? 1
            : this.activityIndicatorForm.value.indicatorTotal,
        evidence: this.activityIndicatorForm.value.indicatorEvidence,
      };

      // Actualizar el indicador
      this.indicatorService
        .updateIndicator(this.currentIndicatorId, updatedIndicatorData)
        .then(() => {
          this.isViewMode = true;
          this.isEditing = false;
          Swal.fire('Success', 'Indicator updated successfully', 'success');
        })
        .catch((error) => {
          Swal.fire('Error', 'The indicator could not be updated.', 'error');
        });

      // Cambiar de modo de edición
      this.toggleEditMode();
    } else {
      Swal.fire('Error', 'The form is invalid.', 'error');
    }
  }

  // Método agregado para manejar el cambio de tipo de indicador
  onIndicatorTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;

    // Establecer isPercentageType según el tipo seleccionado
    if (selectedType === 'PERCENTAGE') {
      this.isPercentageType = true; // Habilitar tipo porcentual
      this.showTotalField = true; // Mostrar campo total
      this.activityIndicatorForm.patchValue({ indicatorTotal: 0 }); // Reiniciar valor total
    } else if (selectedType === 'BINARY') {
      this.activityIndicatorForm.patchValue({ indicatorTotal: 1 });
      this.showTotalField = false; // Ocultar campo total si es binario
      this.isPercentageType = false; // Asegurarse de que no sea porcentaje
    } else {
      this.showTotalField = true; // Mostrar campo total para otros tipos
      this.isPercentageType = false; // No es porcentual
      this.activityIndicatorForm.patchValue({ indicatorTotal: 0 }); // Reiniciar valor total
    }
  }

  adjustTotalValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    // Si es porcentual y el valor es mayor que 100, ajusta a 100
    if (this.isPercentageType && value > 100) {
      this.activityIndicatorForm.patchValue({ indicatorTotal: 100 }); // Ajusta el valor a 100
    }
  }

  cancelCreation(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isViewMode = true;
    this.loadActivityData();
  }

  formatType(value: string): string {
    switch (value) {
      case 'NUMERAL':
        return 'Numeral';
      case 'BINARY':
        return 'Binary';
      case 'PERCENTAGE':
        return 'Percentage';
      default:
        return value;
    }
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked ? 1 : 0; // Se establece 1 si está marcado, 0 si está desmarcado
    this.activityIndicatorForm.patchValue({ indicatorActual: newValue });
  }
}
