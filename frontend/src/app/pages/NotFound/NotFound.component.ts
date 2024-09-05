import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-charging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./NotFound.component.html`,
  styleUrl: './NotFound.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
