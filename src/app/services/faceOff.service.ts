import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class FaceOffService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getFaceOff(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/faceOff/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    createFaceOff(matchId: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 0,
            "winnerId": "273162",
            "loserId": "260179",
            "location": "C",
            "cleanWin": null,
            "realDate": "2019-09-24T18:00:04+0200"
          };
        */

        return this.http.post(this.api_url + '/api/faceOff/' + matchId + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    removeFaceOff(matchId: number, id: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.delete(this.api_url + '/api/faceOff/' + matchId + '/' + id, header).pipe(map(res => res));
    }

    updateFaceOff(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        /*
        let data = {
            "time": 0,
            "winnerId": "273162",
            "loserId": "260179",
            "location": "C",
            "cleanWin": null,
            "realDate": "2019-09-24T18:00:04+0200"
        };
        */

        return this.http.put(this.api_url + '/api/faceOff/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }


    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.put(this.api_url + '/api/supervision/faceOff/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }


}
