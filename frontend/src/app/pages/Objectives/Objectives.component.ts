import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { ObjectivesService } from './Objectives.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';

@Component({
  selector: 'app-objectives',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './Objectives.component.html',
  styleUrls: ['./Objectives.component.css'],
})
export class ObjectivesComponent implements OnInit {
  formObjective!: FormGroup; // Variable to store the form
  activeUserID = ''; // Variable to store the active user ID
  currentPlanId: string = ''; // ID of the current plan to edit
  currentPlan: any = {}; // Object to store the current plan
  isEditing = false; // Controls whether you are editing or creating
  plansData: any[] = []; // To store strategic plans

  showReadModal: boolean = false; // To control the read-only modal
  selectedObjective: any = {}; // To store the selected objective

  objectiveGoals: any[] = []; // To store the goals of the plan
  responseMessage: string = ''; // To store the response message
  objectivesData: any[] = []; // To store the objectives
  objectiveIdSelected: string = ''; // To store the selected objective ID

  showModal: boolean = false; // To control the modal

  constructor(
    private formBuilder: FormBuilder,
    private objectivesService: ObjectivesService,
    private router: Router,
    private strategicPlanService: StrategicPlanService,
    private authService: AuthService
  ) {}

  /**
   * Method that runs when the component initializes
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
    this.formObjective = this.formBuilder.group({
      title: ['', [Validators.required]], // Add this field
      description: ['', [Validators.required]],
      totalGoals: [''],
      completedGoals: [''],
      responsible: ['', [Validators.required]],
    });
  }

  /**
   * Method to load the data and active user
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();

      this.strategicPlanService
        .getActivePlans(this.activeUserID)
        .subscribe((data: any[]) => {
          this.plansData = data; // Store the plans in the property
        });

      // Check if there is a PlanID stored in localStorage
      const storedPlanId = localStorage.getItem('PlanID');

      if (storedPlanId) {
        // If there is a stored PlanID, load the corresponding plan
        this.currentPlanId = storedPlanId;
        await this.loadObjectives();
        await this.loadStrategicPlan();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Method to change the current plan
   */
  async onPlanChange(): Promise<void> {
    this.loadObjectives(); // Load the objectives of the selected plan
    localStorage.setItem('PlanID', this.currentPlanId); // Update the PlanID in localStorage
    this.currentPlan = this.plansData.find(
      (plan) => plan._id === this.currentPlanId
    );
    await this.loadStrategicPlan();
    console.log('Current Plan:', this.currentPlan);
  }

  /**
   * Method to load the current plan
   */
  async loadStrategicPlan(): Promise<void> {
    this.strategicPlanService.getPlanByID(this.currentPlanId).subscribe(
      (data: any) => {
        this.currentPlan = data;
      },
      (error: any) => {
        console.error('Error getting the plan:', error);
      }
    );
  }

  /**
   * Method to load the objectives of the current plan
   */
  async loadObjectives() {
    try {
      this.objectivesService
        .getObjectivesByPlanId(this.currentPlanId)
        .subscribe(
          async (data: any[]) => {
            this.objectivesData = data;

            // Update the completed goals for each objective
            for (let objective of this.objectivesData) {
              await this.updateCompletedGoals(objective);
            }
          },
          (error: any) => {
            console.error('Error loading objectives', error);
          }
        );
    } catch (error) {
      console.error('Error loading objectives', error);
    }
  }

  /**
   * Method to update the completed goals of an objective
   */
  async updateCompletedGoals(objective: any): Promise<void> {
    try {
      // Load the goals of the objective
      const goals =
        (await this.objectivesService
          .getGoalsByObjectiveId(objective._id)
          .toPromise()) || [];

      // Count the completed goals
      const completedGoals = goals.filter((goal: any) => goal.completed).length;

      // Update the completedGoals field
      const updatedObjective = {
        ...objective,
        completedGoals: completedGoals,
      };

      // Update the objective
      await this.objectivesService.updateObjective(
        objective._id,
        updatedObjective
      );
      console.log(
        `Objective ${objective._id} updated with ${completedGoals} completed goals.`
      );
    } catch (error) {
      console.error(
        'Error updating completedGoals for objective',
        objective._id,
        error
      );
    }
  }

  /**
   * Method to create an objective
   */
  async createObjective(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage = await this.objectivesService.createObjective(
        cleanedData,
        this.currentPlanId
      );
      Swal.fire({
        icon: 'success',
        title: 'Objective created',
        text: this.responseMessage,
      });
      this.loadObjectives();
      this.toogleShowModal();
      this.formObjective.reset();
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
   * Method to delete an objective
   */
  async deleteObjective(objectiveId: string, planId: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonColor: '#f52d0a',
      });

      if (result.isConfirmed) {
        // Step 1: Get the plan to remove the reference
        const plan = await this.strategicPlanService
          .getPlanByID(planId)
          .toPromise();

        // Remove the objective reference from the plan
        const updatedObjectiveList = plan.objective_ListIDS.filter(
          (objId: string) => objId !== objectiveId
        );

        // Step 2: Update the plan without the objective
        await this.strategicPlanService.updateObjectivesStrategicPlan(planId, {
          objective_ListIDS: updatedObjectiveList,
        });

        // Step 3: Delete the objective
        const responseMessage = await this.objectivesService.deleteObjective(
          objectiveId
        );

        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: responseMessage,
        });

        this.loadObjectives(); // Load the updated objectives
      }
    } catch (error) {
      const responseMessage = (error as any).error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: responseMessage,
      });
    }
  }

  /**
   * Method to update an objective
   */
  updateObjective() {
    if (this.formObjective.valid) {
      const updatedObjective = {
        title: this.formObjective.value.title,
        description: this.formObjective.value.description,
        responsible: this.formObjective.value.responsible,
      };

      this.objectivesService
        .updateObjective(this.selectedObjective._id, updatedObjective)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Objective updated',
            text: 'The objective has been updated successfully',
          });
          this.toogleShowModal(); // Close the modal after updating
          // Here you can add additional logic, like updating the objectives list
          this.loadObjectives(); // Assume you have a method to reload the objectives list
        })
        .catch((error) => {
          console.error('Error updating objective:', error);
        });
    }
  }

  /**
   * Function to clean empty fields from the form
   * @returns object with cleaned data
   */
  private cleanFormData(): any {
    const formData = { ...this.formObjective.value }; // Create a copy of the object

    // Filter out empty and null fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * Function to navigate to select a plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  /**
   * Function to navigate to the selected plan
   */
  navigateToSelectedPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  /**
   * Method to load the goals of an objective
   */
  async loadObjectiveGoals(objectiveId: string): Promise<void> {
    this.objectivesService.getGoalsByObjectiveId(objectiveId).subscribe(
      (data: any[]) => {
        this.objectiveGoals = data;
      },
      (error: any) => {
        console.error('Error obtaining the goals:', error);
      }
    );
  }

  /**
   * Method to show or hide the modal
   */
  toogleShowModal(): void {
    this.showModal = !this.showModal;
  }

  /**
   * Method for when the add objective button is clicked
   * - Change the editing state
   * - Show the modal
   * - Clear the form
   * - Change the editing state
   */
  onClickAddObjective(): void {
    this.isEditing = false;
    this.showModal = true;
    this.formObjective.reset();
  }

  /**
   * Method to handle the click on the objective
   */
  editObjective(objective: any): void {
    this.formObjective.patchValue(objective);
    this.selectedObjective = objective;
    this.isEditing = true;
    this.showModal = true;

    console.log('Objective:', objective);

    // Set the responsible user
    if (objective.responsible) {
      this.formObjective.patchValue({ responsible: objective.responsible._id });
    }
  }

  /**
   * Method to show or hide the read-only modal
   */
  onViewObjective(item: any): void {
    this.objectiveIdSelected = item._id;
    this.loadObjectiveGoals(this.objectiveIdSelected);
    this.selectedObjective = item; // Asignar el objetivo seleccionado
    this.toogleReadModal(); // Mostrar el modal
  }

  /**
   * Method to show or hide the read-only modal
   */
  toogleReadModal(): void {
    this.showReadModal = !this.showReadModal;
  }

  /**
   * Method to handle the redirection to the goals page
   */
  handleRedirectToGoals(objectiveId: string): void {
    const ObjectiveTitle = this.objectivesData.find(
      (objective) => objective._id === objectiveId
    ).title;
    localStorage.setItem('ObjectiveTitle', ObjectiveTitle);
    localStorage.setItem('ObjectiveID', objectiveId);
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }
}
