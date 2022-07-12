import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { DefaultService } from '../../services/default.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [DefaultService],
  host: {
    '(document:keypress)': 'handleKeyboardEvent($event)'
  }
})

export class LoginComponent implements OnInit {

  client_id: string = "";
  client_secret: string = "";

  loading: boolean = false;


  typ: boolean;
  version: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private defaultService: DefaultService
  ) {
    this.typ = environment.production;
    this.version = environment.version;
  }


  ngOnInit(): void {

  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode == 13) {
      this.login();
    }
  }

  logError(data: any) {
    this.defaultService.error(data)
      .subscribe((data: any) => {


      });
  }

  login() {
    this.loading = true;
    this.defaultService.getToken(this.client_id, this.client_secret)
      .subscribe((data: any) => {

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('logged_user', this.client_id);

        localStorage.setItem('client_id', this.client_id);
        localStorage.setItem('client_secret', this.client_secret);

        let now = new Date();
        now.setSeconds(now.getSeconds() + Number(data.expires_in));

        localStorage.setItem('token_expire', String(now));


        this.defaultService.getIdentity(data.access_token)
          .subscribe((data: any) => {

            localStorage.setItem('user_identity', JSON.stringify(data));


            this.router.navigate(['/select']);
            this.loading = false;
          }, (error) => {
            this.logError({ 'error': JSON.stringify(error), 'match': '', 'data': this.client_id });

            this.toastr.error('Během přihlašování došlo k chybě.', 'Chyba!', {
              progressBar: true
            });
            this.loading = false;
          });


      }, (error) => {
        this.logError({ 'error': JSON.stringify(error), 'match': '', 'data': this.client_id });

        this.toastr.error('Během přihlašování došlo k chybě.', 'Chyba!', {
          progressBar: true
        });
        this.loading = false;
      });
  }





}
