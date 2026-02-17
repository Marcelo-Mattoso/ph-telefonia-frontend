import { Component, Input } from '@angular/core';
import { ValidationState } from '../../core/order.model';

@Component({
  selector: 'app-validation-badge',
  standalone: true,
  templateUrl: './validation-badge.component.html',
  styleUrls: ['./validation-badge.component.css'],
})
export class ValidationBadgeComponent {
  @Input() state: ValidationState = 'pending';
  @Input() title = '';

  get symbol(): string {
    switch (this.state) {
      case 'ok': return '✓';
      case 'problem': return '✕';
      default: return '–';
    }
  }
}
