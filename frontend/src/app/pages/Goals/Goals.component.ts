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
import { IndicatorService } from '../Indicators/indicators.service';
import { OperationalPlanService } from '../OperationalPlan/operationalPlan.service';

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
  currentOperationalId: string = ''; // ID of the current operational plan
  activeOperationalPlan: any = {}; // Current active operational plan
  operationalPlansData: any[] = []; // To store operational plans

  // Variable to store the response message
  responseMessage: string = '';

  // Variables to store the goals data
  goalsData: any = [];
  plansData: any[] = []; // To store strategic plans
  goalsIdSelected: string = '';
  indicatorToView: any = {};

  showModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private goalsService: GoalsService,
    private router: Router,
    private strategicPlanService: StrategicPlanService,
    private authService: AuthService,
    private objectivesService: ObjectivesService,
    private indicatorService: IndicatorService,
    private operationalPlanService: OperationalPlanService
  ) {}

  /**
   * Method that runs when the component is initialized
   * - Initialize the form
   * - Load the data
   */
  async ngOnInit(): Promise<void> {
    localStorage.removeItem('ActivityID');
    localStorage.removeItem('IndicatorID');
    this.initializeForm();
    await this.loadData();
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
      responsible: [''],
      completed: [false],
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
        async (data: any[]) => {
          this.plansData = data;

          // Check if there is a stored PlanID in localStorage
          const storedPlanId = localStorage.getItem('PlanID');
          const storedObjectiveId = localStorage.getItem('ObjectiveID');

          if (storedPlanId) {
            this.currentPlanId = storedPlanId;
            if (!this.currentPlanId && storedPlanId) {
              this.currentPlanId = storedPlanId;
              await this.loadObjectives();
            }
            await this.loadObjectives(); // Load objectives from the stored plan

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
              await this.loadGoalsByObjective(storedObjectiveId);
            }
          } else {
            this.clearSelections();
          }
        },
        (error: any) => {
          console.error('Error loading the plans:', error);
        }
      );

      const currentStrategicPlanId = localStorage.getItem('PlanID') || '';

      if (currentStrategicPlanId) {
        this.operationalPlansData = await this.operationalPlanService
          .getOperationalPlansByStrategicPlanId(currentStrategicPlanId)
          .toPromise();

        this.activeOperationalPlan = await this.operationalPlansData.find(
          (plan: any) => plan.active === true
        );

        this.currentOperationalId =
          localStorage.getItem('OperationalPlanID') || '';
      }
      if (!this.currentOperationalId && this.activeOperationalPlan) {
        this.currentOperationalId = this.activeOperationalPlan._id;
      }
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
    await this.objectivesService
      .getObjectivesByPlanId(this.currentPlanId)
      .subscribe(
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

      const result = await Swal.fire({
        title: '¿Are you sure?',
        text: 'You are about to delete this goal. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonColor: '#f52d0a',
      });

      if (!result.isConfirmed) {
        return;
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
        text: 'The goal has been deleted successfully',
      });

      this.goalsData = this.goalsData.filter((goal: any) => goal._id !== goalId);

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
      this.responseMessage = (error as any).error?.message || 'Unknown error';
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
  editGoal(goal: any): void {
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

  async loadGoalsByObjective(objectiveId: string): Promise<void> {
    try {
      let storedOperationalPlanId =
        localStorage.getItem('OperationalPlanID') || '';

      if (!storedOperationalPlanId) {
        if (this.activeOperationalPlan) {
          storedOperationalPlanId = this.activeOperationalPlan._id;
        }
      }

      // Obtener indicadores del plan operativo
      const indicatorsByOperationalPlan = await this.indicatorService
        .getIndicatorsByOperationalPlan(storedOperationalPlanId)
        .toPromise();

      // Ahora obtener los Goals y sus Activities
      this.objectivesService
        .getGoalsByObjectiveId(objectiveId)
        .subscribe((goals: any[]) => {
          if (goals.length === 0) {
            console.log('No goals found for the selected objective');
            return; // Salir si no hay objetivos
          }

          this.goalsData = goals.map((goal) => {
            // Para cada Goal, buscamos su lista de Activities
            goal.Activity_ListIDS = goal.Activity_ListIDS.map(
              (activity: any) => {
                // Buscar el indicador actual de la Activity según indicators_ListIDS
                const matchingIndicator = indicatorsByOperationalPlan.find(
                  (indicator: any) =>
                    activity.indicators_ListIDS.includes(indicator._id)
                );
                activity.currentIndicatorId = matchingIndicator
                  ? matchingIndicator
                  : null;
                return activity;
              }
            );
            return goal;
          });
          console.log('Goals:', this.goalsData);
        });
    } catch (error) {
      console.error('Error loading goals:', error);
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

  navigateToObjectives(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.OBJECTIVE]);
  }

  navigateToAddActivity(GoalID: string): void {
    localStorage.setItem('GoalID', GoalID);
    localStorage.setItem('OperationalPlanID', this.currentOperationalId);
    console.log('OperationalPlanID:', this.currentOperationalId);
    this.router.navigate([NAVIGATIONS_ROUTES.ACTIVITY]);
  }

  navigateToViewActivity(activityId: string, indicatorId: string): void {
    localStorage.setItem('ActivityID', activityId);
    localStorage.setItem('IndicatorID', indicatorId);
    localStorage.setItem(
      'isActiveOperationalPlan',
      this.activeOperationalPlan ? 'true' : 'false'
    );
    this.router.navigate([NAVIGATIONS_ROUTES.ACTIVITY]);
  }

  navigateToOperationalPlan(): void {
    this.router.navigate([NAVIGATIONS_ROUTES.OPERATIONAL]);
  }

  onOperationalPlanChange(newOperationalPlanId: string): void {
    this.currentOperationalId = newOperationalPlanId;
    // Guardar el plan seleccionado en localStorage
    localStorage.setItem('OperationalPlanID', this.currentOperationalId);
    this.loadGoalsByObjective(this.objectiveIdSelected);
  }

  onPlanChange(): void {
    this.goalsData = []; // Clear the goals
    this.objectiveData = [];
    this.objectiveIdSelected = '';
    this.currentObjective = {};
    localStorage.removeItem('ObjectiveID');
    localStorage.setItem('PlanID', this.currentPlanId);
    this.loadObjectives();
  }

  calculateGeneralProgress(goals: any[]): { actual: number; goal: number } {
    if (!goals.length) return { actual: 0, goal: 100 };

    let totalProgress = 0;
    let activityCount = 0;

    goals.forEach((goal) => {
      goal.Activity_ListIDS.forEach((activity: any) => {
        // Verificamos que el activity tiene currentIndicatorId y que su total es mayor a 0
        if (
          activity.currentIndicatorId &&
          activity.currentIndicatorId.total > 0
        ) {
          // Calcular el porcentaje de progreso de cada actividad y sumarlo
          const activityProgress =
            (activity.currentIndicatorId.actual /
              activity.currentIndicatorId.total) *
            100;
          totalProgress += activityProgress;
          activityCount++;
        }
      });
    });

    // Evitar dividir por 0 y calcular el promedio de progreso
    const averageProgress =
      activityCount > 0 ? totalProgress / activityCount : 0;

    return { actual: Math.round(averageProgress), goal: 100 };
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
