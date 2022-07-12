import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class ShotService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getShot(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        return this.http.get(this.api_url + '/api/shot/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createShot(matchId: number, data: any) {
        //console.log("Data create shot", data)
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        return this.http.post(this.api_url + '/api/shot/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeShot(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      console.log('___________________');
        console.log('removeShot');
        console.log('removeShot ID:');
        console.log(id);
        console.log('___________________');
        return this.http.delete(this.api_url + '/api/shot/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateShot(matchId: number, id: number, data: any) {
        console.log("Update shot", data)
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/shot/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/shot/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
