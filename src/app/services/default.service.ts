import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../environments/environment';

@Injectable()
export class DefaultService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastr: ToastrService,
    ) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getToken(client_id: string, client_secret: string) {
        var body = {
            'grant_type': 'client_credentials',
            'client_id': client_id,
            'client_secret': client_secret
        };

        return this.http.post(this.api_url + '/api/token?cache=' + Date.now(), body, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).pipe(map(res => res));
    }

    getIdentity(token: string) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }
        return this.http.get(this.api_url + '/api/identity', header).pipe(map(res => res));
    }

    getMatch(matchId: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)

      };

      return this.http.get(this.api_url + '/api/match/' + matchId, header).pipe(map(res => res));
    }

    getMatches() {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/match?cache=' + Date.now(), header).pipe(map(res => res));
    }

    getSchedule(date: string, league: string) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        if (league == "") {
            return this.http.get(this.api_url + '/api/schedule?date=' + date + '&cache=' + Date.now(), header).pipe(map(res => res));
        } else {
            return this.http.get(this.api_url + '/api/schedule?date=' + date + '&league=' + league + '&cache=' + Date.now(), header)
                .pipe(map(res => res));
        }
    }

    createMatch(matchId: string) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        let body = {
            matchId
        };
        return this.http.post(this.api_url + '/api/match?cache=' + Date.now(), body, header).pipe(map(res => res));
    }

    removeMatch(matchId: string) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        return this.http.delete(this.api_url + '/api/match/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    matchSynchronize(matchId: string) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };
      return this.http.get(this.api_url + '/api/match/' + matchId + '/sync', header).pipe(map(res => res));
    }


    getLeague() {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        return this.http.get(this.api_url + '/api/league?cache=' + Date.now(), header).pipe(map(res => res));
    }

    getPlayersOnIce(matchId: number, time: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };
      return this.http.get(this.api_url + '/api/playersOnIce/' + matchId + '/' + time, header).pipe(map(res => res));
    }

    needRelog() {
        let expire = new Date(localStorage.getItem('token_expire')).getTime();
        let now = new Date().getTime();

        console.log(expire + " až " + now + "   rozdíl:" + (expire - now - 3000000));

        if (now > expire - 3000000) {
            return true;
        } else {
            return false;
        }
    }

    error(data: any) {
        return this.http.post('https://php.laura.esports.cz/tracking-app/error.php?date=' + new Date().toLocaleString(), data).pipe(map(res => res));
    }

    createWatch(matchId: string) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        let data = {
            "matchId": matchId
        };
        return this.http.post(this.api_url + '/api/watch?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeWatch(matchId: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };
      return this.http.delete(this.api_url + '/api/watch/' + matchId, header).pipe(map(res => res));
    }


    logout(): void {
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('logged_user');
        this.router.navigate(['/login']);

        this.toastr.warning('Platnost relace přihlášení vypršela. Přihlaste se znovu.', 'Odhlášení', {
            progressBar: true
        });
    }

}
