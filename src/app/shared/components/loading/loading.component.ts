import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="background-particles">
        <div class="bg-particle"></div>
        <div class="bg-particle"></div>
        <div class="bg-particle"></div>
      </div>

      <div class="loading-content">
        <div class="spinner-container">
          <div class="spinner-ring yellow"></div>
          <div class="spinner-ring blue"></div>
          <div class="spinner-ring red"></div>
          <div class="center-icon">
            <div class="vote-check"></div>
          </div>
        </div>

        <div class="loading-text">
          Cargando Sistema Electoral
        </div>

        <div class="dots">
          <span class="dot yellow"></span>
          <span class="dot blue"></span>
          <span class="dot red"></span>
        </div>

        <div class="loading-subtext">
          Por favor espere
        </div>

        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      z-index: 9999;
      overflow: hidden;
    }

    .background-particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }

    .bg-particle {
      position: absolute;
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    .bg-particle:nth-child(1) {
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(252, 209, 22, 0.1) 0%, transparent 70%);
      left: 10%;
      top: 20%;
      animation-delay: 0s;
    }

    .bg-particle:nth-child(2) {
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(0, 56, 147, 0.1) 0%, transparent 70%);
      right: 15%;
      top: 60%;
      animation-delay: 2s;
    }

    .bg-particle:nth-child(3) {
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(206, 17, 38, 0.1) 0%, transparent 70%);
      left: 70%;
      bottom: 20%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .loading-content {
      text-align: center;
      position: relative;
    }

    .spinner-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 40px;
    }

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 8px solid transparent;
    }

    .spinner-ring.yellow {
      border-top-color: #FCD116;
      border-right-color: #FCD116;
      animation: spinYellow 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }

    .spinner-ring.blue {
      border-bottom-color: #003893;
      border-left-color: #003893;
      animation: spinBlue 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      animation-delay: 0.3s;
    }

    .spinner-ring.red {
      width: 80%;
      height: 80%;
      top: 10%;
      left: 10%;
      border-top-color: #CE1126;
      border-bottom-color: #CE1126;
      animation: spinRed 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      animation-delay: 0.6s;
    }

    .center-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    }

    .vote-check {
      width: 30px;
      height: 30px;
      position: relative;
    }

    .vote-check::before,
    .vote-check::after {
      content: '';
      position: absolute;
      background: #4CAF50;
      border-radius: 2px;
    }

    .vote-check::before {
      width: 4px;
      height: 20px;
      left: 18px;
      top: 5px;
      transform: rotate(45deg);
      animation: checkGrow 1.5s ease-in-out infinite;
    }

    .vote-check::after {
      width: 4px;
      height: 10px;
      left: 10px;
      top: 15px;
      transform: rotate(-45deg);
      animation: checkGrow 1.5s ease-in-out infinite 0.2s;
    }

    .loading-text {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 15px;
      animation: textFade 2s ease-in-out infinite;
    }

    .loading-subtext {
      color: #FCD116;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .dots {
      display: inline-block;
      margin: 20px 0;
    }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin: 0 3px;
      animation: dotBounce 1.4s ease-in-out infinite;
    }

    .dot.yellow {
      background: #FCD116;
      animation-delay: 0s;
    }

    .dot.blue {
      background: #003893;
      animation-delay: 0.2s;
    }

    .dot.red {
      background: #CE1126;
      animation-delay: 0.4s;
    }

    .progress-bar {
      width: 300px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      margin: 30px auto 0;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      position: absolute;
      height: 100%;
      background: linear-gradient(90deg, #FCD116 0%, #003893 50%, #CE1126 100%);
      border-radius: 3px;
      animation: progressMove 2s ease-in-out infinite;
      background-size: 200% 100%;
    }

    @keyframes spinYellow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes spinBlue {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }

    @keyframes spinRed {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    @keyframes checkGrow {
      0%, 100% { transform: scaleY(0) rotate(45deg); }
      50%, 75% { transform: scaleY(1) rotate(45deg); }
    }

    @keyframes textFade {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-15px); }
    }

    @keyframes progressMove {
      0% { width: 0%; background-position: 0% 50%; }
      50% { width: 100%; background-position: 100% 50%; }
      100% { width: 100%; background-position: 200% 50%; }
    }
  `]
})
export class LoadingComponent {}
