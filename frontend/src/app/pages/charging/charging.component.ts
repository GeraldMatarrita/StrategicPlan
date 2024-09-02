import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-charging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./charging.component.html`,
  styleUrl: './charging.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargingComponent {}
