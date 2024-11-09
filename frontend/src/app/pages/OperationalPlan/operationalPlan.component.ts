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
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { switchMap, tap } from 'rxjs/operators';

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
    private strategicPlanService: StrategicPlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStrategicPlans();
    this.loadOperationalPlans(localStorage.getItem('PlanID') || '');
  }

  /**
   * Initializes the operational plan form with necessary fields and validation.
   * Sets up a listener to validate the 'endDate' field.
   */
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

  /**
   * Validates if the end date is greater than the current date.
   * @param value - The selected end date value.
   */
  validateEndDate(value: string): void {
    const today = new Date();
    const selectedEndDate = new Date(value);

    // If the selected end date is less than or equal to today, set an error
    if (selectedEndDate <= today) {
      this.formOperationalPlan.get('endDate')?.setErrors({
        invalidDate: true,
      });
    } else {
      this.formOperationalPlan.get('endDate')?.setErrors(null);
    }
  }

  /**
   * Loads the strategic plans from the service and sets the selected strategic plan.
   * Updates the list of operational plans based on the selected strategic plan.
   */
  async loadStrategicPlans(): Promise<void> {
    const activeUserId = await this.authService.getActiveUserID();
  
    if (!activeUserId) {
      this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
    }
    console.log('Active User ID:', activeUserId);

    this.selectedStrategicPlanId = localStorage.getItem('PlanID') || '';
  
    // Load strategic plans and set the selected plan
    this.strategicPlanService.getStrategicPlans().pipe(
      tap((plans: any[]) => {
        this.strategicPlans = plans;
        console.log('Strategic Plans:', this.strategicPlans);
        this.strategicPlans = this.strategicPlans.filter(plan => plan.members_ListIDS.includes(activeUserId));
        const storedPlanId = localStorage.getItem('PlanID');
  
        if (storedPlanId) {
          this.selectedStrategicPlanId = storedPlanId;
          this.selectedStrategicPlan = this.strategicPlans.find(
            (plan) => plan._id === storedPlanId
          );
        }
      }),
      switchMap(() => {
        // Only fetch the plan if it exists
        return this.selectedStrategicPlan
          ? this.strategicPlanService.getPlanByID(this.selectedStrategicPlan._id)
          : [];
      })
    ).subscribe(
      (plan) => {
        if (plan) {
          this.selectedStrategicPlan = plan;
          this.operationalPlans = this.selectedStrategicPlan.operationPlan_ListIDS || [];
          this.checkActivePlan();
          this.checkAndSetInactivePlans();
        }
      },
      (error) => console.error('Error loading plans:', error)
    );
  }

  /**
   * Loads operational plans based on the selected strategic plan ID.
   * Updates the list of operational plans and checks for active/inactive plans.
   * @param StrategicPlanID - ID of the selected strategic plan.
   */
  loadOperationalPlans(StrategicPlanID: string): void {
    localStorage.setItem('PlanID', StrategicPlanID);
    this.strategicPlanService.getPlanByID(StrategicPlanID).subscribe((plan) => {
      this.selectedStrategicPlan = plan;
      this.operationalPlans = this.selectedStrategicPlan.operationPlan_ListIDS;
      this.checkActivePlan();
      this.checkAndSetInactivePlans();
    });
  }

  /**
   * Checks if there is an active operational plan.
   */
  checkActivePlan(): void {
    this.activePlanExists = this.operationalPlans.some((plan) => plan.active);
  }

  /**
   * Checks each operational plan's end date. If the plan is active and the end date has passed, 
   * it sets the plan to inactive.
   */
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

  /**
   * Opens the form to create a new operational plan by resetting the form and setting the modal visibility to true.
   */
  openCreateForm(): void {
    this.showModal = true;
    this.isEditing = false;
    this.formOperationalPlan.reset();
    this.initializeForm();
  }

  /**
   * Handles the creation of a new operational plan.
   * Confirms the creation action with a Swal prompt and proceeds to create the plan.
   */
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
          .then((OperationalPlan) => {
            Swal.fire(
              'Success',
              'Operational Plan created successfully',
              'success'
            );
            localStorage.setItem('ActiveOperationalPlanID', OperationalPlan);
            this.loadStrategicPlans(); // Reload plans to update the active plan
          })
          .catch((error) => {
            Swal.fire('Error', 'Failed to create Operational Plan', 'error');
            console.error(error);
          });
        this.toogleShowModal();
      }
    });
  }

  /**
   * Opens the form to edit an existing operational plan and populates it with the selected plan's data.
   * @param plan - The operational plan to edit.
   */
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

  /**
   * Handles the update of an existing operational plan.
   * Prompts for confirmation if the end date is in the past.
   */
  updateOperationalPlan(): void {
    const updatedData = {
      title: this.formOperationalPlan.value.title,
      endDate: this.formOperationalPlan.value.endDate,
    };

    // Check if the end date is in the past
    const today = new Date();
    const endDate = new Date(updatedData.endDate);

    // If the end date is in the past, prompt the user to confirm the update
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
          localStorage.removeItem('OperationalPlanID');
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

  /**
   * Proceeds with the update of an operational plan.
   */
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

  /**
   * Handles the deletion of an existing operational plan.
   */
  redirectToGoals(planId: string): void {
    localStorage.setItem('OperationalPlanID', planId);
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  /**
   * Handles the deletion of an existing operational plan.
   */
  toogleShowModal(): void {
    this.showModal = !this.showModal;
  }
}
