import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class OffensiveZoneLossService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getOffensiveZoneLoss(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/offensiveZoneLoss/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createOffensiveZoneLoss(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 1,
            "playerId": 260335,
            "clearPlayerId": 260491,
            "coordinates": {
                "x": 1,
                "y": -1
            },
            "type": "quit",
            "realDate": "2019-08-14T08:48:34+0200"
            };
        */

        return this.http.post(this.api_url + '/api/offensiveZoneLoss/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeOffensiveZoneLoss(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/offensiveZoneLoss/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateOffensiveZoneLoss(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 1,
            "playerId": 260335,
            "clearPlayerId": 260491,
            "coordinates": {
                "x": 1,
                "y": -1
            },
            "type": "quit",
            "realDate": "2019-08-14T08:48:34+0200"
            };
        */

        return this.http.put(this.api_url + '/api/offensiveZoneLoss/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/offensiveZoneLoss/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
