import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class EventFlowService {

    token: string;
    api_url = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production === false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getEventflow(matchId: number) {
      const header = {
        headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
      };

      return this.http.get(this.api_url + '/api/eventFlow/' + matchId, header).pipe(map(res => res));
    }

}
