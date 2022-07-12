import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class TimelineService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getTimeline(matchId: number, teamId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/timeline/' + matchId + '/' + teamId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    getSlot(matchId: number, teamId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/slot/' + matchId + '/' + teamId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    getVideoTime(matchId: number, time: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.get(this.api_url + '/api/video/' + matchId + '/' + time, header).pipe(map(res => res));
    }

    getTimelineOfShifts(matchId: number, teamId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/timeline/' + matchId + '/' + teamId + '/shift?cache=' + Date.now(), header).pipe(map(res => res));
    }

}
