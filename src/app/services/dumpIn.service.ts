import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class DumpInService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getDumpIn(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/dumpIn/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createDumpIn(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 10,
            "playerId": 260335,
            "battleWonTeamId": 1499,
            "coordinates": {
                "x": 25,
                "y": -50
            },
            "battleWon": true,
            "realDate": "2020-08-14T08:48:34+0200"
            };
        */

        return this.http.post(this.api_url + '/api/dumpIn/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeDumpIn(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/dumpIn/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateDumpIn(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 10,
            "playerId": 260335,
            "battleWonTeamId": 1499,
            "coordinates": {
                "x": 25,
                "y": -50
            },
            "battleWon": true,
            "realDate": "2020-08-14T08:48:34+0200"
            };
        */

        return this.http.put(this.api_url + '/api/dumpIn/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/dumpIn/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
