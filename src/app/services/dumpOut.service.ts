import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class DumpOutService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getDumpOut(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/dumpOut/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createDumpOut(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 100,
            "playerId": 260335,
            "battleWonTeamId": 1499,
            "coordinates": {
                "x": 1,
                "y": -1
            },
            "battle": false,
            "dumpIn": true,
            "realDate": "2019-08-14T08:48:34+0200"
            };
        */

        return this.http.post(this.api_url + '/api/dumpOut/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeDumpOut(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/dumpOut/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateDumpOut(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 100,
            "playerId": 260335,
            "battleWonTeamId": 1499,
            "coordinates": {
                "x": 1,
                "y": -1
            },
            "battle": false,
            "dumpIn": true,
            "realDate": "2019-08-14T08:48:34+0200"
            };
        */

        return this.http.put(this.api_url + '/api/dumpOut/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/dumpOut/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
