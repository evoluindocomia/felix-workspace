import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloMfeComponent } from './hello-mfe/hello-mfe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HelloMfeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('nfe-app');
}
