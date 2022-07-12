import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class ZoneExitService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getZoneExit(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/zoneExit/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createZoneExit(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 33,
            "type": "carry",
            "playerId": 273477,
            "passingPlayerId": 273476,
            "coordinates": {
                "x": 29,
                "y": -86
            },
            "success": true,
            "underPressure": false,
            "stretchPass": true,
            "received": false,
            "denialCoordinates": {
                "x": -29,
                "y": 86
            },
            "denialTime": 31,
            "denialPlayerId": 273477,
            "followingEvent": "denial",
            "participation": [
                273477
            ]
        };
        */

        return this.http.post(this.api_url + '/api/zoneExit/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeZoneExit(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/zoneExit/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateZoneExit(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 33,
            "type": "carry",
            "playerId": 273477,
            "passingPlayerId": null,
            "coordinates": {
                "x": 29,
                "y": -86
            },
            "success": true,
            "underPressure": false,
            "stretchPass": true,
            "received": false,
            "denialCoordinates": {
                "x": -29,
                "y": 86
            },
            "denialTime": 33,
            "denialPlayerId": 273477,
            "followingEvent": "denial",
            "participation": [
                273477
            ]
            };
        */

        return this.http.put(this.api_url + '/api/zoneExit/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/zoneExit/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
