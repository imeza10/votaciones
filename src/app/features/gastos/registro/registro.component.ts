import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-gastos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Registro de Gastos</h1>
      <p>Módulo en desarrollo...</p>
    </div>
  `,
  styles: [`
    .page-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class RegistroGastosComponent {}