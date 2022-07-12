import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class PassService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getPass(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/pass/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createPass(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.post(this.api_url + '/api/pass/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removePass(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };
      console.log('---removing pass---');

      return this.http.delete(this.api_url + '/api/pass/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updatePass(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/pass/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/pass/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
