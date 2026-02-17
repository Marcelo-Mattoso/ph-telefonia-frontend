import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
})
export class ShellComponent {
  @Input() title = 'CRUD';
  theme: 'light' | 'dark' = (localStorage.getItem('theme') as any) || 'light';

  ngOnInit() {
    document.body.setAttribute('data-theme', this.theme);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    document.body.setAttribute('data-theme', this.theme);
  }
}
