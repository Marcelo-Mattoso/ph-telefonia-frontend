import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShellComponent } from '../../shared/shell/shell.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ShellComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
