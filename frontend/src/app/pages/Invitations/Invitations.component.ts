import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { InvitationsService } from './Invitations.service';
import { AuthService } from '../Auth/Auth.service';
import { StrategicPlanService } from '../StrategicPlan/StrategicPlan.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './Invitations.component.html',
  styleUrl: './Invitations.component.css',
})
export class InvitationsComponent implements OnInit {
  // Variables to store the form
  public invitationForm!: FormGroup;

  // Variable to store the response message
  responseMessage: string = '';

  // Variables to send invitations
  usersToInvite: any[] = [];
  selectedUsers: any[] = [];
  strategicPlanId: string = '';
  strategicPlanName: string = '';

  // Variables for the user's pending invitations
  invitationData: any[] = [];

  // Variables for the strategic plans
  strategicPlanData: any[] = [];
  showPlans: boolean = true;

  // Variable to store the active user
  activeUserID: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private invitationsService: InvitationsService,
    private router: Router,
    private StrategicPlanService: StrategicPlanService,
    private authService: AuthService
  ) {}

  /**
   * Method that runs when the component is initialized
   * - Initialize the invitations form
   * - Load the necessary data
   */
  ngOnInit(): void {
    let storedPlanId = null;

    // Initialize the invitations form
    this.invitationForm = this.formBuilder.group({
      users: [null, Validators.required],
    });

    const planToInvite = localStorage.getItem('planToInvite');
    if (planToInvite) {
      storedPlanId = planToInvite;
      this.updatePlanName(storedPlanId);
    } else {
      storedPlanId = localStorage.getItem('selectedPlan');
    }

    if (storedPlanId) {
      this.strategicPlanId = storedPlanId;
      this.showPlans = false;
      this.loadUserToInvite();
    }

    // Load the necessary data
    this.loadData();
  }

  /**
   * Method to load data
   *  - active user ID
   *  - strategic plans for the user
   *  - users to invite (excluding the active user)
   *  - user's pending invitations
   */
  async loadData(): Promise<void> {
    try {
      this.activeUserID = await this.authService.getActiveUserID();
      this.loadStrategicPlansForActiveUser();
      this.getPendingInvitations();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Method to load the strategic plans for the active user
   */
  loadStrategicPlansForActiveUser(): void {
    this.invitationsService
      .getStrategicPlansForUser(this.activeUserID)
      .subscribe(
        (data: any[]) => {
          this.strategicPlanData = data.map((item: any) => ({
            id: item._id,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
          }));
        },
        (error: any) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  /**
   * Method to load the users to invite
   */
  loadUserToInvite(): void {
    this.invitationsService.getUserToInvite(this.strategicPlanId).subscribe(
      (data: any) => {
        // Ensure 'data' has the 'users' property
        console.log(data);

        // Directly map the received users to a new format
        this.usersToInvite = data.users.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
        }));
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  /**
   * Method to get the pending invitations for the active user
   */
  getPendingInvitations(): void {
    this.invitationsService.getInvitationsForUser(this.activeUserID).subscribe(
      (data: any) => {
        this.invitationData = data.invitations.filter(
          (invitation: any) => invitation.status === 'pending'
        );
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  /**
   * Method to select a strategic plan and load it into the variable `strategicPlanId`
   * @param id ID of the selected strategic plan
   */
  onSelectPlan(id: string): void {
    this.showPlans = false;
    this.strategicPlanId = id;

    localStorage.setItem('selectedPlan', id);

    this.updatePlanName(id);

    this.loadUserToInvite();
  }

  updatePlanName(id: string): void {
    this.StrategicPlanService.getPlanByID(id).subscribe((plan: any) => {
      this.strategicPlanName = plan.name;
    });
  }

  /**
   * Method to cancel the selection of a strategic plan
   */
  cancelSelection(): void {
    this.showPlans = true;
    this.strategicPlanId = '';
    this.invitationForm.reset();
    localStorage.removeItem('planToInvite');
  }

  /**
   * Method to send invitations using createInvitation to send
   * invitations to all selected users
   */
  async sendInvitations(): Promise<void> {
    try {
      this.selectedUsers = this.invitationForm.get('users')?.value;

      // Use Promise.all to run all promises and handle errors
      await Promise.all(
        this.selectedUsers.map((user) =>
          this.createInvitation(user, this.strategicPlanId)
        )
      );
      this.cancelSelection();
      this.loadUserToInvite();
    } catch (error) {
      // If an unexpected error occurs outside of `createInvitation`
      Swal.fire({
        icon: 'error',
        title: 'Error sending invitations',
        text: 'An error occurred while sending invitations.',
      });
    }
  }

  /**
   * Method to send an invitation
   * @param userId ID of the user to invite
   * @param planId ID of the strategic plan to invite the user to
   */
  async createInvitation(userId: string, planId: string): Promise<void> {
    try {
      this.responseMessage = await this.invitationsService.createInvitation({
        userId,
        planId,
      });
      Swal.fire({
        icon: 'success',
        title: 'Invitations sent',
        text: 'All invitations were sent successfully.',
      });
    } catch (error) {
      this.responseMessage =
        (error as any)?.error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  getPlaceholderText(): string {
    return this.invitationForm.get('users')?.value?.length ? '' : 'Select users';
  }

  /**
   * Method to respond to an invitation to a strategic plan
   * @param decision accept or decline the invitation
   * @param planId ID of the strategic plan being responded to
   */
  async responseInvitation(decision: boolean, planId: string): Promise<void> {
    try {
      const responseMessage = await this.invitationsService.responseInvitation({
        decision: decision,
        planId: planId,
        userId: this.activeUserID,
      });

      await this.invitationsService.deleteInvitation(this.activeUserID, planId);

      // Update the invitation count after responding
      this.invitationsService
        .getPendingInvitationsCount(this.activeUserID)
        .subscribe((count) => {
          this.invitationsService.updatePendingInvitationsCount(count);
        });

      Swal.fire({
        icon: 'success',
        title: 'Response sent',
        text: responseMessage,
      });
      this.loadData();
    } catch (error) {
      this.responseMessage =
        (error as any)?.error?.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * Method to navigate to the selected strategic plan
   */
  navigateToSelectedPlan(): void {
    const SELECTED_PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([SELECTED_PLAN]);
  }
}
