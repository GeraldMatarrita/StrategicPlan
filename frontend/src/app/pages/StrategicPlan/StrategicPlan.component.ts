import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StrategicPlanService } from './StrategicPlan.service';
import { AuthService } from '../Auth/Auth.service';
import { ObjectivesService } from '../Objectives/Objectives.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './StrategicPlan.component.html',
  styleUrls: ['./StrategicPlan.component.css'],
})
export class StrategicPlanComponent implements OnInit {
  // Variable to store the form
  formStrategicPlan!: FormGroup; // Form group for handling the strategic plan form
  minEndDate: string = ''; // Variable to store the minimum end date
  isFormVisible: boolean = false; // Variable to control the form visibility

  responseMessage: string = ''; // Variable to store the response message
  strategicPlanData: any[] = []; // Variables to store the strategic plan data
  members: any[] = []; // Variable to store the members of the plan

  objectivesData: any[] = []; // Variable to store the objectives data

  currentPlanId: string = ''; // ID of the current plan to edit

  activeUserID: string = ''; // Variable to store the ID of the active user

  constructor(
    private formBuilder: FormBuilder,
    private strategicPlanService: StrategicPlanService,
    private router: Router,
    private authService: AuthService,
    private objectivesService: ObjectivesService
  ) {}

  /**
   * Method executed when the component is initialized
   * - Initialize the form
   * - Load active plan data
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Method to load the data of the active user
   * - Get the active user ID
   * - Get the active user's plans
   * - Load the plan data
   * - Load the objectives data
   * - Redirect if there are no plans
   * - Redirect if there is no valid plan ID
   * - Redirect if the user is not authenticated
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
      if (!this.activeUserID) {
        this.router.navigate([NAVIGATIONS_ROUTES.AUTH]);
      }

      // Get the list of user's plans
      const userPlans = await this.strategicPlanService
        .getActivePlans(this.activeUserID)
        .toPromise();

      if (userPlans && userPlans.length > 0) {
        // Check if a PlanID is stored in localStorage
        const storedPlanId = localStorage.getItem('PlanID');
        if (
          storedPlanId &&
          userPlans.some((plan) => plan._id === storedPlanId)
        ) {
          // If there's a valid stored PlanID, load the corresponding plan
          this.currentPlanId = storedPlanId;
          this.loadObjectives();
          this.loadPlanById(this.currentPlanId);
        } else {
          // If no valid PlanID is stored, redirect
          this.navigateToSelectPlan();
        }
      } else {
        // If the user has no plans, redirect to plan selection
        localStorage.removeItem('PlanID');
        this.navigateToSelectPlan();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Method to send the form data
   */
  sendData(): void {
    this.updatePlan();
  }

  /**
   * Method to initialize the form
   * - Initialize form fields
   * - Get the current date and add to set the minimum end date
   */
  initializeForm() {
    this.formStrategicPlan = this.formBuilder.group({
      mission: [''],
      vision: [''],
      values: [''],
      endDate: ['', Validators.required],
      name: ['', Validators.required],
    });

    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    this.minEndDate = nextMonth.toISOString().split('T')[0];
  }

  /**
   *  Method to load plan data by its ID
   * @param planId ID of the plan to load
   */
  loadPlanById(planId: string): void {
    this.strategicPlanService.getPlanByID(planId).subscribe(
      (data: any) => {
        if (data.endDate) {
          const endDate = new Date(data.endDate);
          data.endDate = endDate.toISOString().split('T')[0];
        }

        this.strategicPlanData = [
          {
            id: data._id,
            mission: data.mission,
            vision: data.vision,
            values: data.values,
            startDate: data.startDate,
            endDate: data.endDate,
            name: data.name,
          },
        ];

        // Assign the data to the form
        this.formStrategicPlan.patchValue(data);

        // Assign members_ListIDS data to members as an array of objects
        if (Array.isArray(data.members_ListIDS)) {
          this.members = data.members_ListIDS.map((member: any) => ({
            id: member._id,
            name: member.name,
            realName: member.realName,
          }));
        }
        this.formStrategicPlan.patchValue(data);
      },
      (error: any) => {
        console.error('Error loading the plan:', error);
      }
    );
  }

  /**
   * Function to show or hide the form
   */
  setFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  /**
   * Function to update a plan
   * @returns promise with the response message
   */
  async updatePlan(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();
      this.responseMessage =
        await this.strategicPlanService.updateStrategicPlan(
          this.currentPlanId,
          cleanedData
        );
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: this.responseMessage,
      });
      this.loadPlanById(this.currentPlanId);
      this.setFormVisibility();
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
   * Function to exit a plan
   * @param planID of the plan to exit
   * @returns promise with the response message
   */
  async outPlan(planID: string): Promise<void> {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to leave this plan, this action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Yes, I'm sure",
        cancelButtonColor: '#f52d0a',
      });
      if (result.isConfirmed) {
        this.responseMessage = await this.strategicPlanService.outStrategicPlan(
          planID,
          this.activeUserID
        );
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: "You've left the plan",
        });
        localStorage.removeItem('PlanID');
        localStorage.removeItem('selectedPlan');
        this.navigateToSelectPlan();
      }
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
   * @returns object with cleaned data
   */
  private cleanFormData(): any {
    const formData = { ...this.formStrategicPlan.value }; // Create a copy of the object

    // Filter out empty and null fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    return formData;
  }

  /**
   * Function to navigate to the FODAMECA page
   */
  navigateToFodaMeca(): void {
    const FODAMECA: string = `${NAVIGATIONS_ROUTES.FODAMECA}`;
    this.router.navigate([FODAMECA]);
  }

  /**
   * Function to navigate to select a plan
   */
  navigateToSelectPlan(): void {
    const SELECT_PLAN: string = `${NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN}`;
    this.router.navigate([SELECT_PLAN]);
  }

  navigateToInvitations(): void {
    // Check if there is a PlanID in localStorage
    const selectedPlanId = localStorage.getItem('PlanID') || '';
    localStorage.setItem('planToInvite', selectedPlanId);

    if (selectedPlanId) {
      // Redirect to the invitations page
      this.router.navigate([NAVIGATIONS_ROUTES.INVITATIONS]);
    } else {
      // If no plan is selected, show an alert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No plan has been selected.',
      });
    }
  }

  /**
   * Method to check if the plan has expired
   * @param endDate The plan's end date
   * @returns true if the plan has expired, false otherwise
   */
  isPlanExpired(endDate: Date): boolean {
    const currentDate = new Date();
    return new Date(endDate) < currentDate;
  }

  /**
   * Method to cancel plan editing
   */
  cancelEdit(): void {
    this.setFormVisibility();
    this.loadPlanById(this.currentPlanId);
  }

  /**
   * Method to load objectives data by plan ID
   */
  async loadObjectives() {
    try {
      this.objectivesService
        .getObjectivesByPlanId(this.currentPlanId)
        .subscribe(
          (data: any[]) => {
            this.objectivesData = data; // Assign data to objectivesData
          },
          (error: any) => {
            console.error('Error loading objectives:', error);
          }
        );
    } catch (error) {
      console.error('Error loading objectives:', error);
    }
  }

  /**
   * Method to navigate to the objectives page
   */
  navigateToObjective(): void {
    localStorage.setItem('PlanID', this.currentPlanId);
    this.router.navigate([NAVIGATIONS_ROUTES.OBJECTIVE]);
  }

  /**
   * Method to navigate to the goals page
   */
  navigateToGoals(ObjectiveID: string): void {
    localStorage.setItem('ObjectiveID', ObjectiveID);
    this.router.navigate([NAVIGATIONS_ROUTES.GOALS]);
  }
}
