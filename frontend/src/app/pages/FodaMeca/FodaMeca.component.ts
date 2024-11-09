import { SwotService } from './FodaMeca.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NAVIGATIONS_ROUTES } from '../../config/navigations.routes';

@Component({
  selector: 'app-swot-board',
  templateUrl: './FodaMeca.component.html',
  styleUrls: ['./FodaMeca.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FodaMecaComponent implements OnInit {
  // Variables to hold SWOT and CAME analysis data
  swot: any = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  came: any = { correct: [], afront: [], maintain: [], explore: [] };
  
  // Plan ID fetched from local storage
  planId: any = localStorage.getItem('PlanID');

  constructor(private swotService: SwotService, private router: Router) {}

  // Lifecycle hook that runs on component initialization
  ngOnInit(): void {
    this.loadSwot(); // Load the SWOT analysis data
    this.loadCame(); // Load the CAME analysis data
  }

  // Navigate to the strategic plan page
  navigateToPlan(): void {
    const PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([PLAN]);
  }

  // Load the SWOT analysis data from the service
  loadSwot(): void {
    // Get the SWOT analysis data using the plan ID
    this.swotService.getSwotAnalysis(this.planId).subscribe((data) => {
      this.swot = data; // Update the swot object with the received data
    });
  }

  // Load the CAME analysis data from the service
  loadCame(): void {
    // Get the CAME analysis data using the plan ID
    this.swotService.getCameAnalysis(this.planId).subscribe((data) => {
      this.came = data; // Update the came object with the received data
    });
  }

  // Add a new card to a specific column in the SWOT analysis
  addCard(columnType: string) {
    Swal.fire({
      title: `Add New ${this.capitalizeFirstLetter(columnType)}`,
      showCancelButton: true,
      confirmButtonText: 'Add',
      customClass: {
        popup: 'my-swal',
        title: 'my-swal-title',
        htmlContainer: 'my-swal-content',
        confirmButton: 'btn btn-success',
        cancelButton: 'buttonCancelReset',
        input: 'inputReset',
      },
      html: `
      <form>
        <div class="form1-group">
          <label for="title">Title</label>
          <input type="text" id="title" placeholder="Title">
        </div>
        <div class="form1-group">
          <label for="description">Description</label>
          <textarea id="description" placeholder="Description"></textarea>
        </div>
      </form>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        if (!title || !description) {
          Swal.showValidationMessage('Please enter both title and description');
        }
        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newCard = {
          title: result.value?.title || 'No Title',
          description: result.value?.description || 'No Description',
        };
        // Call the service to add the new SWOT card
        this.swotService.addSwotCard(columnType, this.planId, newCard).subscribe(() => {
          this.swot[columnType].push(newCard); // Add the new card to the respective column
          Swal.fire('Added!', 'Card has been added successfully', 'success');
        });
      }
    });
  }

  // Add a new card to a specific column in the CAME analysis
  addCameCard(columnType: string) {
    Swal.fire({
      title: `Add New ${this.capitalizeFirstLetter(columnType)}`,
      showCancelButton: true,
      confirmButtonText: 'Add',
      customClass: {
        popup: 'my-swal',
        title: 'my-swal-title',
        htmlContainer: 'my-swal-content',
        confirmButton: 'btn btn-success',
        cancelButton: 'buttonCancelReset',
        input: 'inputReset',
      },
      html: `
      <form>
        <div class="form1-group">
          <label for="title">Title</label>
          <input type="text" id="title" placeholder="Title">
        </div>
        <div class="form1-group">
          <label for="description">Description</label>
          <textarea id="description" placeholder="Description"></textarea>
        </div>
      </form>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        if (!title || !description) {
          Swal.showValidationMessage('Please enter both title and description');
        }
        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newCard = {
          title: result.value?.title || 'No Title',
          description: result.value?.description || 'No Description',
        };
        // Call the service to add the new CAME card
        this.swotService.addCameCard(columnType, this.planId, newCard).subscribe(() => {
          this.came[columnType].push(newCard); // Add the new card to the respective column
          Swal.fire('Added!', 'Card has been added successfully', 'success');
        });
      }
    });
  }

  // Update an existing card in the SWOT analysis
  updateCardAnalysis(card: any): void {
    Swal.fire({
      title: `Update Card`,
      showCancelButton: true,
      confirmButtonText: 'Save',
      customClass: {
        popup: 'my-swal',
        title: 'my-swal-title',
        htmlContainer: 'my-swal-content',
        confirmButton: 'btn btn-success',
        cancelButton: 'buttonCancelReset',
        input: 'inputReset',
      },
      html: `
      <form>
        <div class="form1-group">
          <label for="title">Title</label>
          <input type="text" id="title" placeholder="Title" value="${card.title}">
        </div>
        <div class="form1-group">
          <label for="description">Description</label>
          <textarea id="description" placeholder="Description">${card.description}</textarea>
        </div>
      </form>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        if (!title || !description) {
          Swal.showValidationMessage('Please enter both title and description');
          return null; // Prevent closing if validation fails
        }
        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCard = {
          ...card, // Keep the original card properties
          _id: card._id,
          title: result.value?.title || card.title,
          description: result.value?.description || card.description,
        };
        // Call the service to update the card
        this.swotService.updateCard(updatedCard).subscribe(() => {
          this.loadSwot(); // Reload SWOT data
          this.loadCame(); // Reload CAME data
          Swal.fire('Success!', 'Card has been updated.', 'success');
        });
      }
    });
  }

  // Delete a card from the SWOT analysis
  deleteCard(type: string, card: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action can't be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the service to delete the card
        this.swotService.deleteSwotCard(type, this.planId, card).subscribe(() => {
          this.loadSwot(); // Reload SWOT data
          Swal.fire('Deleted!', 'Card has been deleted.', 'success');
        });
      }
    });
  }

  // Delete a card from the CAME analysis
  deleteCameCard(type: string, card: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action can't be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.swotService
          .deleteCameCard(type, this.planId, card)
          .subscribe(() => {
            this.loadCame();
            Swal.fire('Deleted!', 'Card has been deleted.', 'success');
          });
      }
    });
  }

  // Capitalize the first letter of a string
  capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
