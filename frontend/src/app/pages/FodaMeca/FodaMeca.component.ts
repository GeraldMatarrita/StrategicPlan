import { Component, OnInit } from '@angular/core';
import { SwotService } from './FodaMeca.service';

@Component({
  selector: 'app-swot-board',
  templateUrl: './FodaMeca.component.html',
  styleUrls: ['./FodaMeca.component.scss']
})
export class FodaMecaComponent implements OnInit {
  swot: any = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  planId: any = localStorage.getItem('PlanID')
  constructor(private swotService: SwotService) {}

  ngOnInit(): void {
    this.loadSwot();
  }

  loadSwot(): void {
      // Aquí debes poner el ID del plan estratégico
    this.swotService.getSwotAnalysis(this.planId).subscribe((data) => {
      this.swot = data;
    });
  }

  addCard(type: string): void {
    
    const title = prompt('Enter card title');
    const description = prompt('Enter card description');
    
    if (title && description) {
      this.swotService.addSwotCard(type, this.planId, {title, description}) 
        .subscribe(() => this.loadSwot());
    }
  }

  deleteCard(type: string, cardId: string): void {
    this.swotService.deleteSwotCard(type, this.planId, cardId)
      .subscribe(() => this.loadSwot());
  }
}


