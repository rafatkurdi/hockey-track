import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class HitService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getHit(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/hit/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createHit(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "hitter": 261739,
            "hitted": 274474,
            "time": 775,
            "hitWon": true,
            "coordinates": {
                "x": -84,
                "y": -84
            }
        };
        */

        return this.http.post(this.api_url + '/api/hit/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeHit(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/hit/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateHit(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "hitter": 261739,
            "hitted": 274474,
            "time": 775,
            "hitWon": true,
            "coordinates": {
                "x": -84,
                "y": -84
            }
        };
        */

        return this.http.put(this.api_url + '/api/hit/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/hit/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
