import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Auth/Auth.service';
import { ProfileService } from './profile.service';
import Swal from 'sweetalert2';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

interface StrategicPlan {
  startDate: string | number | Date;
  endDate: string | number | Date;
  name: string;
}

interface UserProfile {
  realName: string;
  email: string;
  strategicPlans: StrategicPlan[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  activeUserID: string = '';
  activeUser: any = {};
  userProfile: UserProfile | null = null;
  isEditing = false;  // State to control whether we are editing or not
  strategicPlans: StrategicPlan[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      realName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });
  }

  /**
   * ngOnInit lifecycle hook.
   * Initializes the component and loads user data.
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserProfileId();
  }

  /**
   * Loads the active user's profile and updates the form with the profile data.
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async loadUserProfile() {
    await this.authService.getActiveUser().then((profile) => {
      this.userProfile = profile;
      this.profileForm.patchValue({
        realName: profile.realName,
        email: profile.email,
        username: profile.name,
      });
      this.disableForm();  // Ensure the form is disabled when loaded
      this.isEditing = false;  // Initially not in editing mode
    });
  }

  /**
   * Loads the user profile ID and fetches the strategic plans associated with the user.
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async loadUserProfileId() {
    this.activeUser = await this.authService.getActiveUser();
    this.activeUserID = this.activeUser._id;
    this.loadStrategicPlans();
  }

  /**
   * Enables form fields for editing by setting the form to editable state.
   * @returns {void} This function does not return any value.
   */
  enableEdit() {
    this.isEditing = true;
    this.profileForm.get('realName')?.enable();
    this.profileForm.get('email')?.enable();
  }

  /**
   * Disables the form fields, preventing editing.
   * @returns {void} This function does not return any value.
   */
  disableForm() {
    this.profileForm.get('realName')?.disable();
    this.profileForm.get('email')?.disable();
  }

  /**
   * Cancels the editing mode, restores the form to its original state, and disables the form fields.
   * @returns {void} This function does not return any value.
   */
  cancelEdit() {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.userProfile?.realName,
      email: this.userProfile?.email,
    });
    this.disableForm();  // Re-disable the fields
  }

  /**
   * Updates the user's profile in the backend if the form is valid.
   * Displays success or error message upon completion.
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async updateUserProfile() {
    if (this.profileForm.invalid) {
      return;  // Prevent update if the form is invalid
    }

    const updatedProfile = {
      realName: this.profileForm.get('realName')?.value,
      email: this.profileForm.get('email')?.value,
    };

    try {
      // Call the service to update the user on the backend
      await this.authService.updateUserInBackend(this.activeUserID, updatedProfile).then(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.loadUserProfile();  // Reload the profile to reflect changes
        this.cancelEdit();  // Exit edit mode
      });
    } catch (error) {
      Swal.fire({
        title: 'An unexpected error occurred',
        text: (error as any).error.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  /**
   * Loads the strategic plans associated with the active user.
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async loadStrategicPlans() {
    await this.profileService.getActivePlans(this.activeUserID).subscribe((plans) => {
      this.strategicPlans = plans;
    });
  }

  /**
   * Navigates the user to the strategic plan selection page.
   * @returns {void} This function does not return any value.
   */
  navigateStrategicPlans() {
    this.router.navigate([NAVIGATIONS_ROUTES.SELECT_STRATEGIC_PLAN]);
  }
}
