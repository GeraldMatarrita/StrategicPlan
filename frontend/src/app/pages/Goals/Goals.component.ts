import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { GoalsService } from './Goals.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';
import { ObjectivesService } from '../Objectives/Objectives.service';

import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './Goals.component.html',
  styleUrls: ['./Goals.component.css'],
})
export class GoalsComponent implements OnInit {
  // Variable to store the form
  formGoal!: FormGroup;

  currentPlanId: string = ''; // ID of the current plan being edited
  activeUserID = ''; // ID of the active user
  isEditing = false; // Controls whether editing or creating

  objectiveData: any = {};
  objectiveIdSelected: string = '';

  currentObjective: any = {}; // ID of the current objective being edited

  // Variable to store the response message
  responseMessage: string = '';

  // Variables to store the goals data
  goalsData: any = [];
  plansData: any[] = []; // To store strategic plans
  goalsIdSelected: string = '';

  showModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private goalsService: GoalsService,
    private router: Router,
    private strategicPlanService: StrategicPlanService,
    private authService: AuthService,
    private objectivesService: ObjectivesService
  ) {}

  /**
   * Method that runs when the component is initialized
   * - Initialize the form
   * - Load the data
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    window.scrollTo(0, 0);
  }

  /**
   * Method to initialize the form
   */
  initializeForm() {
    this.formGoal = this.formBuilder.group({
      objectiveIdSelectedForm: [''],
      description: ['', [Validators.required]],
      totalActivities: [''],
      completedActivities: [''],
      responsible: [''],
    });
  }

  /**
   * Method to load the data and active user
   */
  async loadData(): Promise<void> {
    try {
      // Always load the strategic plans
      this.activeUserID = await this.authService.getActiveUserID();
      this.strategicPlanService.getActivePlans(this.activeUserID).subscribe(
        (data: any[]) => {
          this.plansData = data;

          // Check if there is a stored PlanID in localStorage
          const storedPlanId = localStorage.getItem('PlanID');
          const storedObjectiveId = localStorage.getItem('ObjectiveID');

          if (storedPlanId) {
            this.currentPlanId = storedPlanId;
            this.loadObjectives(); // Load objectives from the stored plan

            if (storedObjectiveId) {
              this.objectiveIdSelected = storedObjectiveId;
              this.objectivesService
                .getObjectiveById(storedObjectiveId)
                .subscribe(
                  (data: any) => {
                    this.currentObjective = data;
                  },
                  (error: any) => {
                    console.error('Error getting the objective:', error);
                  }
                );
              this.formGoal.patchValue({
                objectiveIdSelectedForm: storedObjectiveId,
              });
              this.loadGoalsByObjective(storedObjectiveId); // Load goals from the stored objective
            }
          } else {
            this.clearSelections();
          }
        },
        (error: any) => {
          console.error('Error loading the plans:', error);
        }
      );
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  clearSelections(): void {
    this.currentPlanId = '';
    this.objectiveIdSelected = '';
    this.goalsData = [];
  }

  /**
   * Method to load the objectives of the current plan
   */
  async loadObjectives(): Promise<void> {
    this.objectivesService.getObjectivesByPlanId(this.currentPlanId).subscribe(
      (data: any[]) => {
        this.objectiveData = data;
      },
      (error: any) => {
        console.error('Error getting the plan:', error);
      }
    );
  }

  /**
   * Method to create a goal
   */
  async createGoal(): Promise<void> {
    try {
      // Get the ObjectiveID from localStorage
      const storedObjectiveId = localStorage.getItem('ObjectiveID');

      // Validate that it is not null or empty
      if (!storedObjectiveId) {
        throw new Error('Objective ID is not available.');
      }

      this.objectiveIdSelected = storedObjectiveId;

      // Clear the form before submitting
      this.formGoal.value.objectiveIdSelectedForm = undefined;
      const cleanedData = this.cleanFormData();

      // Create the goal with the selected ObjectiveID
      this.responseMessage = await this.goalsService.createGoal(
        cleanedData,
        this.objectiveIdSelected
      );

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Goal created',
      });

      // Reload the goals
      this.loadGoalsByObjective(this.objectiveIdSelected);

      // Hide modal and reset the form
      this.toogleShowModal();
      this.formGoal.reset();
    } catch (error) {
      // Error handling and showing message to the user
      console.error('Error creating the goal:', error);
      this.responseMessage =
        (error as any).message || 'Unknown error creating the goal';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Method to delete a goal
   */
  async deleteGoal(goalId: string, objectiveId: string): Promise<void> {
    try {
      // Step 1: Get the Objective by ID
      const objective = await this.objectivesService
        .getObjectiveById(objectiveId)
        .toPromise();

      if (!objective) {
        throw new Error('Objective not found');
      }

      // Step 2: Remove the goalId from the goals_ListIDS of the Objective
      const updatedGoalsList = objective.goals_ListIDS.filter(
        (id: string) => id !== goalId
      );

      // Check if the goal exists in the objective
      if (updatedGoalsList.length === objective.goals_ListIDS.length) {
        throw new Error('Goal not found in the objective');
      }

      // Step 3: Update only the goals list of the Objective
      await this.objectivesService.updateObjective(objectiveId, {
        goals_ListIDS: updatedGoalsList,
      });

      // Step 4: Delete the Goal from the system
      const responseMessage = await this.goalsService.deleteGoal(goalId);

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: responseMessage,
      });

      this.loadGoalsByObjective(objectiveId); // Load updated goals
    } catch (error) {
      console.error('Error deleting the goal:', error);
      this.responseMessage =
        (error as any).message || 'Unknown error deleting the goal';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Method to update a goal
   */
  async updateGoal(): Promise<void> {
    try {
      delete this.formGoal.value.objectiveIdSelectedForm;
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.goalsService.updateGoal(
        this.goalsIdSelected,
        cleanedData
      );
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'The goal has been updated successfully',
      });
      this.loadGoalsByObjective(this.objectiveIdSelected);
      this.toogleShowModal();
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Function to clean empty fields from the form
   * @returns object with clean data
   */
  private cleanFormData(): any {
    const formData = { ...this.formGoal.value }; // Create a copy of the object

    // Filter out empty and null fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * Method to toggle show/hide the modal
   */
  toogleShowModal(): void {
    this.showModal = !this.showModal;
  }

  /**
   * Method for clicking on the add goal button
   * - Switch the editing state
   * - Show the modal
   * - Reset the form
   */
  onClickAddGoal(): void {
    this.isEditing = false;
    this.showModal = true;
    this.formGoal.reset();
  }

  /**
   * Method triggered when a goal is clicked
   */
  onClickGoal(goal: any): void {
    this.goalsIdSelected = goal._id;
    this.formGoal.patchValue(goal);
    this.isEditing = true;
    this.showModal = true;
  }

  /**
   * Function to navigate to select a plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  async loadGoalsByObjective(objectiveId: string | null): Promise<void> {
    if (objectiveId) {
      // Filter Goals by the selected Objective
      this.objectivesService.getGoalsByObjectiveId(objectiveId).subscribe(
        (data: any[]) => {
          this.goalsData = data;
        },
        (error: any) => {
          console.error('Error retrieving Goals:', error);
        }
      );
    } else {
      // If no Objective is selected, clear the Goals
      this.goalsData = [];
    }
  }

  // Method to handle the change of the selected objective
  onObjectiveChange(): void {
    if (this.objectiveIdSelected) {
      this.loadGoalsByObjective(this.objectiveIdSelected);
      localStorage.setItem('ObjectiveID', this.objectiveIdSelected);
      this.objectivesService
        .getObjectiveById(this.objectiveIdSelected)
        .subscribe(
          (data: any) => {
            this.currentObjective = data;
          },
          (error: any) => {
            console.error('Error retrieving the objective:', error);
          }
        );
    } else {
      // If no objective is selected, clear the Goals
      this.goalsData = [];
      localStorage.removeItem('ObjectiveID');
    }
  }

  navigateToSelectedPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  onPlanChange(): void {
    this.goalsData = []; // Clear the goals when changing the plan
    this.objectiveIdSelected = ''; // Clear the selected objective when changing the plan
    this.loadObjectives(); // Load the objectives for the selected plan
    localStorage.setItem('PlanID', this.currentPlanId); // Update PlanID in localStorage
    localStorage.removeItem('ObjectiveID'); // Clear ObjectiveID when the plan changes
  }

  getProgressColor(value: number): string {
    if (value >= 100) {
      return '#a4fba6'; // Light green for 100
    } else if (value >= 75) {
      return '#71e48b'; // Lighter green for 75-99
    } else if (value >= 50) {
      return '#3ac778'; // Dark green for 50-74
    } else if (value >= 25) {
      return '#ff9933'; // Orange for 25-49
    } else {
      return '#ff3300'; // Red for 0-24
    }
  }
}
