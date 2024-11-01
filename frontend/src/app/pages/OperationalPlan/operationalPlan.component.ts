import { CommonModule } from '@angular/common';
import { Component, OnInit, NgModule } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { OperationalPlanService } from './operationalPlan.service'; // Import the Operational Plan service
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service'; // Import the Strategic Plan service
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-operational-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './operationalPlan.component.html',
  styleUrls: ['./operationalPlan.component.css'],
})
export class OperationalPlanComponent implements OnInit {
  formOperationalPlan!: FormGroup;
  operationalPlans: any[] = [];
  strategicPlans: any[] = []; // List of strategic plans for select
  selectedStrategicPlanId: string = ''; // Selected Strategic Plan ID
  selectedStrategicPlan: any = {}; // Selected Strategic Plan
  isEditing = false;
  currentPlanId: string = '';
  activePlanExists = false;
  showModal = false;

  constructor(
    private formBuilder: FormBuilder,
    private operationalPlanService: OperationalPlanService,
    private strategicPlanService: StrategicPlanService, // Inject Strategic Plan service
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStrategicPlans();
    this.loadOperationalPlans(localStorage.getItem('PlanID') || '');
  }

  initializeForm() {
    this.formOperationalPlan = this.formBuilder.group({
      title: ['', [Validators.required]],
      startDate: [{ value: new Date(), disabled: true }],
      endDate: ['', [Validators.required]],
    });

    // Listener for endDate value changes
    this.formOperationalPlan.get('endDate')?.valueChanges.subscribe((value) => {
      this.validateEndDate(value);
    });
  }

  validateEndDate(value: string): void {
    const today = new Date();
    const selectedEndDate = new Date(value);

    if (selectedEndDate <= today) {
      this.formOperationalPlan.get('endDate')?.setErrors({
        invalidDate: true,
      });
    } else {
      this.formOperationalPlan.get('endDate')?.setErrors(null);
    }
  }

  loadStrategicPlans(): void {
    this.strategicPlanService.getStrategicPlans().subscribe((plans: any[]) => {
      this.strategicPlans = plans;

      const storedPlanId = localStorage.getItem('PlanID');
      if (storedPlanId) {
        this.selectedStrategicPlanId = storedPlanId;
        this.selectedStrategicPlan = this.strategicPlans.find(
          (plan) => plan._id === storedPlanId
        );

        console.log('Selected Strategic Plan:', this.selectedStrategicPlan);

        if (this.selectedStrategicPlan) {
          this.operationalPlans =
            this.selectedStrategicPlan.operationPlan_ListIDS;
          this.checkActivePlan();
          this.checkAndSetInactivePlans();
        }
      }
    });
  }

  loadOperationalPlans(StrategicPlanID: string): void {
    localStorage.setItem('PlanID', StrategicPlanID);
    this.strategicPlanService.getPlanByID(StrategicPlanID).subscribe((plan) => {
      this.selectedStrategicPlan = plan;
      this.operationalPlans = this.selectedStrategicPlan.operationPlan_ListIDS;
      this.checkActivePlan();
      this.checkAndSetInactivePlans();
    });
  }

  checkActivePlan(): void {
    this.activePlanExists = this.operationalPlans.some((plan) => plan.active);
  }

  checkAndSetInactivePlans(): void {
    const today = new Date();
    this.operationalPlans.forEach((plan) => {
      const endDate = new Date(plan.endDate);
      if (plan.active && endDate < today) {
        this.operationalPlanService
          .setInactiveOperationalPlan(plan._id)
          .then(() => this.loadStrategicPlans())
          .catch((error) =>
            console.error('Error setting plan as inactive:', error)
          );
      }
    });
  }

  openCreateForm(): void {
    this.showModal = true;
    this.isEditing = false;
    this.formOperationalPlan.reset();
    this.initializeForm();
  }

  createOperationalPlan(): void {
    Swal.fire({
      title: 'Create Operational Plan',
      text: 'This will become the active operational plan. Do you want to proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (this.formOperationalPlan.invalid) {
        Swal.fire('Error', 'End Date must be greater than today', 'error');
        return; // Prevent form submission if invalid
      }

      if (result.isConfirmed) {
        const operationalPlanData = this.formOperationalPlan.getRawValue();
        this.operationalPlanService
          .createOperationalPlan(
            operationalPlanData,
            this.selectedStrategicPlanId
          )
          .then(() => {
            Swal.fire(
              'Success',
              'Operational Plan created successfully',
              'success'
            );
            this.loadStrategicPlans(); // Recargar los planes estratégicos después de crear
          })
          .catch((error) => {
            Swal.fire('Error', 'Failed to create Operational Plan', 'error');
            console.error(error);
          });
        this.toogleShowModal();
      }
    });
  }

  openEditForm(plan: any): void {
    this.showModal = true;
    this.isEditing = true;
    this.currentPlanId = plan._id;

    const formattedEndDate = plan.endDate
      ? new Date(plan.endDate).toISOString().substring(0, 10)
      : '';

    this.formOperationalPlan.patchValue({
      title: plan.title,
      endDate: formattedEndDate,
    });
  }

  updateOperationalPlan(): void {
    const updatedData = {
      title: this.formOperationalPlan.value.title,
      endDate: this.formOperationalPlan.value.endDate,
    };

    const today = new Date();
    const endDate = new Date(updatedData.endDate);

    if (endDate < today) {
      Swal.fire({
        title: 'Warning',
        text: 'The end date is in the past. Confirming this change will make the plan inactive. This action is irreversible. Do you want to proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.proceedWithUpdate(updatedData);
        }
      });
    } else {
      Swal.fire({
        title: 'Confirm Update',
        text: 'Are you sure you want to update the operational plan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.proceedWithUpdate(updatedData);
        }
      });
    }
  }

  private proceedWithUpdate(updatedData: {
    title: string;
    endDate: string;
  }): void {
    this.operationalPlanService
      .updateOperationalPlan(this.currentPlanId, updatedData)
      .then(() => {
        Swal.fire(
          'Success',
          'Operational Plan updated successfully',
          'success'
        );
        this.loadStrategicPlans();
        this.toogleShowModal();
      })
      .catch((error) => {
        Swal.fire('Error', 'Failed to update Operational Plan', 'error');
        console.error(error);
      });
  }

  redirectToGoals(planId: string): void {
    localStorage.setItem('OperationalPlanID', planId);
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  toogleShowModal(): void {
    this.showModal = !this.showModal;
  }
}
