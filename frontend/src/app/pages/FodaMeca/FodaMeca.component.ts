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
  swot: any = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  came: any = { correct: [], afront: [], maintain: [], explore: [] };
  planId: any = localStorage.getItem('PlanID');

  constructor(private swotService: SwotService, private router: Router) {}

  ngOnInit(): void {
    this.loadSwot();
    this.loadCame();
  }
  navigateToPlan(): void {
    const PLAN: string = `${NAVIGATIONS_ROUTES.STRATEGIC_PLAN}`;
    this.router.navigate([PLAN]);
  }
  loadSwot(): void {
    // Aquí debes poner el ID del plan estratégico
    this.swotService.getSwotAnalysis(this.planId).subscribe((data) => {
      this.swot = data;
    });
  }
  loadCame(): void {
    // Aquí debes poner el ID del plan estratégico
    this.swotService.getCameAnalysis(this.planId).subscribe((data) => {
      this.came = data;
    });
  }

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
        const title = (document.getElementById('title') as HTMLInputElement)
          .value;
        const description = (
          document.getElementById('description') as HTMLTextAreaElement
        ).value;
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
        this.swotService
          .addSwotCard(columnType, this.planId, newCard)
          .subscribe(() => {
            this.swot[columnType].push(newCard);
            Swal.fire('Added!', 'Card has been added successfully', 'success');
          });
      }
    });
  }

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
        const title = (document.getElementById('title') as HTMLInputElement)
          .value;
        const description = (
          document.getElementById('description') as HTMLTextAreaElement
        ).value;
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
        this.swotService
          .addCameCard(columnType, this.planId, newCard)
          .subscribe(() => {
            this.came[columnType].push(newCard);
            Swal.fire('Added!', 'Card has been added successfully', 'success');
          });
      }
    });
  }

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
        const title = (
          document.getElementById('title') as HTMLInputElement
        ).value;
        const description = (
          document.getElementById('description') as HTMLTextAreaElement
        ).value;
        if (!title || !description) {
          Swal.showValidationMessage('Please enter both title and description');
          return null; // Si no se completa, no se cierra el SweetAlert2
        }
        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCard = {
          ...card,
          _id: card._id, // Mantenemos las propiedades anteriores
          title: result.value?.title || card.title,
          description: result.value?.description || card.description,
        };
        this.swotService.updateCard(updatedCard).subscribe(() => {
          this.loadSwot();
          this.loadCame();
          Swal.fire('Success!', 'Card has been added.', 'success');
        });
      }
    });
  }
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
        this.swotService
          .deleteSwotCard(type, this.planId, card)
          .subscribe(() => {
            this.loadSwot();
            Swal.fire('Deleted!', 'Card has been deleted.', 'success');
          });
      }
    });
  }
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

  capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
