import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Plantillas de Mensajes</h1>
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
export class PlantillasComponent {}