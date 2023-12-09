import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication-service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    public authService: AuthenticationService,
    public router: Router
  ) {
    this.authService = authService;
  }
  ngOnInit(): void {
    const isLoggedIn = this.authService.isLoggedIn;
    console.log({ isLoggedIn });

    if (this.authService.isLoggedIn) this.router.navigate(['dashboard']);
  }
}
