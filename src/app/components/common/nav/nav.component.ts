import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  page: string = "";
  user: string = "";

  username: string = "";

  constructor(
    private router: Router
  ) {
    this.page = this.router.url;
    this.user = localStorage.getItem('logged_user');

    this.username = JSON.parse(localStorage.getItem('user_identity'))['name'];

  }

  ngOnInit(): void {
    console.log(this.router.url)
  }

  isActive(page: string) {
    if (this.page.includes(page)) {
      return true
    }
  }

  logout() {
    localStorage.setItem('access_token', '');
    localStorage.setItem('logged_user', '');
    this.router.navigate(['/login']);
  }
}
