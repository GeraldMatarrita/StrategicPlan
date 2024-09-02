import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-foda-meca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './FodaMeca.component.html',
  styleUrl: './FodaMeca.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FodaMecaComponent {}
