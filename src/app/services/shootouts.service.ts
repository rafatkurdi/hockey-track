import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class ShootoutsService {

    token: string
    api_url: string = 'https://ta.statistics.datasport.cz';

    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('access_token');

        if (environment.production == false) {
            this.api_url = 'https://ta-test.statistics.datasport.cz';
        }
    }

    getShootout(matchId: number) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }

        return this.http.get(this.api_url + '/api/shootout/' + matchId + '?cache=' + Date.now(), header).pipe(map(res => res));
    }

    updateShootout(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        console.log("_ - _ - _ -  Update ShootOut (normal)  - _ - _ - _")
        console.log("matchId",matchId);
        console.log("ID",id);
        console.log("data",data);
        console.log("_ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ ")


        return this.http.put(this.api_url + '/api/shootout/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

    updateSupervize(matchId: number, id: number, data: any) {
        var header = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${this.token}`)
        }
        console.log("_ - _ - _ -  Update ShootOut (supervision)  - _ - _ - _")
        console.log("matchId",matchId);
        console.log("ID",id);
        console.log("data",data);
        console.log("_ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ ")

        return this.http.put(this.api_url + '/api/supervision/shootout/' + matchId + '/' + id + '?cache=' + Date.now(), data, header).pipe(map(res => res));
    }

}
