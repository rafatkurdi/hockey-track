import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class ZoneEntryService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getZoneEntry(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/zoneEntry/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createZoneEntry(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 176,
            "type": "carry",
            "playerId": "260647",
            "passingPlayerId": null,
            "stopperPlayerId": null,
            "coordinates": {
                "x": 29,
                "y": 91
            },
            "success": true,
            "completed": false
            };
        */

        return this.http.post(this.api_url + '/api/zoneEntry/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeZoneEntry(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/zoneEntry/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateZoneEntry(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 176,
            "type": "carry",
            "playerId": "260647",
            "passingPlayerId": null,
            "stopperPlayerId": null,
            "coordinates": {
                "x": 29,
                "y": 91
            },
            "success": true,
            "completed": false
            };
        */

        return this.http.put(this.api_url + '/api/zoneEntry/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/zoneEntry/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
