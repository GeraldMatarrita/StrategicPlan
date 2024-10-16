import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StrategicPlanService } from './StrategicPlanToSelect.service';
import { AuthService } from '../Auth/Auth.service';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-strategic-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './StrategicPlanToSelect.component.html',
  styleUrls: ['./StrategicPlanToSelect.component.css'],
})
export class StrategicPlanToSelect implements OnInit {
  // Variable to store the form
  formStrategicPlan!: FormGroup;
  minEndDate: string = '';
  isFormVisible: boolean = false;

  // Variable to store the response message
  responseMessage: string = '';
  // Variables to store the strategic plan data
  strategicPlanData: any[] = [];

  // Variable to store the active user ID
  activeUserID: string = '';

  // Variable to indicate whether the finished plans view is being shown
  isFinishedPlansView: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private strategicPlanService: StrategicPlanService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Method that runs when the component is initialized
   * - Initialize the form
   * - Load the active plan data
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Method to initialize the form
   * - Initialize form fields
   * - Get the current date and set a minimum for the end date
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
   * Method to load the strategic plan data
   * - Get the active user ID
   * - Load the user's active plans
   */
  async loadData(): Promise<void> {
    try {
      localStorage.removeItem('PlanID');
      localStorage.removeItem('ObjectiveID');
      this.activeUserID = await this.authService.getActiveUserID();
      this.loadActivePlans();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Method to load the user's active plans
   */
  loadActivePlans() {
    this.strategicPlanService.getActivePlans(this.activeUserID).subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          this.strategicPlanData = data.map((item) => ({
            id: item._id,
            mission: item.mission,
            vision: item.vision,
            values: item.values,
            startDate: item.startDate,
            endDate: item.endDate,
            name: item.name,
          }));
        } else {
          this.strategicPlanData = [];
        }
        this.isFinishedPlansView = false;
      },
      (error: any) => {
        console.error('Error fetching active plans:', error);
      }
    );
  }

  /**
   * Method to load the user's finished plans
   */
  loadFinishedPlans() {
    this.strategicPlanService.getFinishedPlans(this.activeUserID).subscribe(
      (data: any[]) => {
        this.strategicPlanData = data.map((item) => ({
          id: item._id,
          mission: item.mission,
          vision: item.vision,
          values: item.values,
          startDate: item.startDate,
          endDate: item.endDate,
          name: item.name,
        }));
        this.isFinishedPlansView = true;
      },
      (error: any) => {
        console.error('Error fetching finished plans:', error);
      }
    );
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
   * Function to select a plan and store the ID in localStorage
   * @param plan The plan to edit
   */
  onClickPlan(plan: any): void {
    const planID: string = plan.id.toString(); // Use 'string' instead of 'String'
    localStorage.setItem('PlanID', planID); // Store the ID in localStorage
    this.navigateToPlan();
  }

  /**
   * Function to navigate to the selected plan's page
   */
  navigateToPlan(): void {
    const PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([PLAN]);
  }

  /**
   * Function to create a new plan
   * - Clear the form
   * - Show the form
   */
  onClickCreateNewPlan(): void {
    this.formStrategicPlan.reset(); // Clear the form
    this.isFormVisible = true; // Show the form
  }

  /**
   * Function to show or hide the form
   */
  setFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
    // Scroll the page to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Function to submit the form data, either in edit or creation mode
   */
  sendData(): void {
    this.createPlan();
  }

  /**
   * Function to create a strategic plan
   * @returns promise with the response message
   */
  async createPlan(): Promise<void> {
    try {
      const cleanedData = this.cleanFormData();

      this.responseMessage =
        await this.strategicPlanService.createStrategicPlan(
          cleanedData,
          this.activeUserID
        );
      Swal.fire({
        icon: 'success',
        title: 'Created',
        text: this.responseMessage,
      });
      this.loadData();
      this.resetForm();
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
   * Function to reset the form
   * and hide the form, returning to the plan creation or view selection mode
   */
  resetForm(): void {
    this.formStrategicPlan.reset();
    this.isFormVisible = false; // Hide the form
  }

  /**
   * Function to clean empty form fields
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
   * Function to show the finished plans view
   */
  showFinishedPlans(): void {
    this.isFinishedPlansView = true;
    this.loadFinishedPlans();
  }

  /**
   * Function to show the active plans
   * and return to the active plan view
   */
  showActivePlans(): void {
    this.isFinishedPlansView = false;
    this.loadActivePlans();
  }
}
