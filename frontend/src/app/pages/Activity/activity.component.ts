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

/**
 * Activity component for creating, viewing, and editing activities.
 */
@Component({
  standalone: true,
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ActivityComponent implements OnInit {
  activityIndicatorForm!: FormGroup; // Form group for the activity and indicator
  operationalPlanId: string = ''; // ID of the operational plan
  members: any[] = []; // Members of the strategic plan
  currentIndicatorId: string = ''; // ID of the current indicator
  currentActivityId: string = ''; // ID of the current activity
  currentActivity: any = {}; // Current activity data
  isPercentageType: boolean = false; // Indicator type is percentage
  showTotalField: boolean = false; // Show the total field
  isCreatingActivity: boolean = true; // Creating a new activity
  isViewMode: boolean = false; // Viewing mode
  isEditing: boolean = false; // Editing mode
  responsible: any = {}; // Responsible user
  isActiveOperationalPlan: boolean = true; // Active operational plan

  /**
   * Initializes the activity component with the required services and form builder
   */
  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private indicatorService: IndicatorService,
    private strategicPlan: StrategicPlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Initializes the component, sets initial state values, loads operational plan data,
   * and decides whether to enter view mode or create mode.
   */
  ngOnInit(): void {
    this.initializeForms(); // Initialize the activity form
    this.operationalPlanId = localStorage.getItem('OperationalPlanID') || ''; // Get the operational plan ID
    this.isActiveOperationalPlan =
      localStorage.getItem('isActiveOperationalPlan') === 'true'; // Check if the operational plan is active
    this.loadMembers(); // Load the members of the strategic plan
    const isViewing = localStorage.getItem('ActivityID') !== null; // Check if viewing an activity
    if (isViewing) {
      this.isCreatingActivity = false;
      this.isViewMode = true;
      this.showTotalField = true;
      this.loadActivityData(); // Load the activity data
    }
  }

  /**
   * Initializes the activity form with required fields and validators.
   */
  initializeForms(): void {
    this.activityIndicatorForm = this.fb.group({
      // Activity fields
      title: ['', Validators.required],
      description: ['', Validators.required],
      responsible: ['', Validators.required],
      indicators_ListIDS: [[]],

      // Indicator fields
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

  /**
   * Loads the current activity data, if in view mode, and populates the form with the data.
   */
  loadActivityData(): void {
    this.currentActivityId = localStorage.getItem('ActivityID') || '';

    // Get the activity by ID
    this.activityService
      .getActivityById(this.currentActivityId)
      .subscribe((activity) => {
        this.currentActivity = activity;
        this.activityIndicatorForm.patchValue({
          // Populate the form with the activity data
          title: activity.title,
          description: activity.description,
          responsible: activity.responsible,
        });

        // Get the responsible user by ID
        const userId = activity.responsible;
        this.authService.getUserById(userId).subscribe((user) => {
          this.responsible = user;
        });

        // Get the indicator for the current operational plan
        const currentIndicatorId = localStorage.getItem('IndicatorID');
        const matchedIndicator = activity.indicators_ListIDS.find(
          (indicatorId: string) => indicatorId === currentIndicatorId
        );

        // If there is a matched indicator, populate the form with the indicator data
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

  /**
   * Loads the members of the strategic plan and handles errors if they cannot be retrieved.
   */
  loadMembers(): void {
    const planID = localStorage.getItem('PlanID') || '';
    this.strategicPlan.getPlanByID(planID).subscribe(
      (plan) => {
        this.members = plan.members_ListIDS;
      },
      (error) => {
        Swal.fire('Error', 'Members could not be loaded.', 'error');
      }
    );
  }

  /**
   * Creates an activity along with its associated indicator and updates the activity with the indicator ID.
   */
  createActivityAndIndicator(): void {
    if (this.activityIndicatorForm.invalid) {
      Swal.fire('Error', 'The form is invalid.', 'error');
      return;
    }

    const goalId = localStorage.getItem('GoalID') || '';

    // Create the activity data
    const activityData = {
      title: this.activityIndicatorForm.value.title,
      description: this.activityIndicatorForm.value.description,
      responsible: this.activityIndicatorForm.value.responsible,
      indicators_ListIDS: [],
    };

    // Create the activity and update it with the indicator ID
    this.activityService
      .createActivity(activityData, goalId)
      .then((activityResponse: any) => {
        const indicatorData = {
          // Create the indicator data
          description: this.activityIndicatorForm.value.indicatorDescription,
          type: this.activityIndicatorForm.value.indicatorType,
          actual: this.activityIndicatorForm.value.indicatorActual,
          total:
            this.activityIndicatorForm.value.indicatorType === 'BINARY'
              ? 1
              : this.activityIndicatorForm.value.indicatorTotal,
          operationalPlanId: this.operationalPlanId,
          activityId: activityResponse._id,
          evidence: this.activityIndicatorForm.value.evidence,
        };

        // Create the indicator and update the activity with the indicator ID
        this.indicatorService
          .createIndicator(indicatorData)
          .then((indicatorResponse) => {
            // Update the activity with the indicator ID
            this.activityService
              .updateActivity(activityResponse._id, {
                indicators_ListIDS: [indicatorResponse._id],
              })
              .then(() => {
                Swal.fire(
                  'Success',
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

  /**
   * Navigates back to the goals page.
   */
  navigateBack(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  /**
   * Toggles between edit and view mode.
   */
  toggleEditMode(): void {
    this.isViewMode = !this.isViewMode;
    this.isEditing = !this.isEditing;
  }

  /**
   * Saves changes made to the activity and indicator, updating them in the backend.
   */
  saveChanges(): void {
    if (this.activityIndicatorForm.valid) {
      const activityData = {
        title: this.activityIndicatorForm.value.title,
        description: this.activityIndicatorForm.value.description,
        responsible: this.activityIndicatorForm.value.responsible,
      };

      // Update the activity with the new data
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

        // Update the indicator with the new data
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

      // Update the indicator with the new data
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

      this.toggleEditMode();
    } else {
      Swal.fire('Error', 'The form is invalid.', 'error');
    }
  }

  /**
   * Adjusts form fields based on the selected indicator type.
   */
  onIndicatorTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;

    // Set isPercentageType based on the selected type
    if (selectedType === 'PERCENTAGE') {
      this.isPercentageType = true; // Enable percentage type
      this.showTotalField = true; // Show the total field
      this.activityIndicatorForm.patchValue({ indicatorTotal: 0 }); // Reset total value
    } else if (selectedType === 'BINARY') {
      this.activityIndicatorForm.patchValue({ indicatorTotal: 1 });
      this.showTotalField = false; // Hide total field if binary
      this.isPercentageType = false; // Ensure it is not a percentage type
    } else {
      this.showTotalField = true; // Show total field for other types
      this.isPercentageType = false; // Not a percentage
      this.activityIndicatorForm.patchValue({ indicatorTotal: 0 }); // Reset total value
    }
  }

  /**
   * Adjusts the total value based on the selected indicator type.
   */
  adjustTotalValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    // If it's a percentage and the value is greater than 100, adjust it to 100
    if (this.isPercentageType && value > 100) {
      this.activityIndicatorForm.patchValue({ indicatorTotal: 100 }); // Adjust value to 100
    }
  }

  /**
   * Navigates back to the goals
   * page without creating an activity.
   */
  cancelCreation(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }

  /**
   * Cancels the current edit and reverts to the previous state.
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.isViewMode = true;
    this.loadActivityData();
  }

  /**
   * Formats the indicator type for display purposes.
   */
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

  /**
   * Handles the checkbox change event and updates the actual value of the indicator.
   */
  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked ? 1 : 0; // Set to 1 if checked, 0 if unchecked
    this.activityIndicatorForm.patchValue({ indicatorActual: newValue });
  }
}
