import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class ShiftService {
  token: string;
  api_url: string = 'https://ta.statistics.datasport.cz';

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('access_token');

    if (environment.production == false) {
      this.api_url = 'https://ta-test.statistics.datasport.cz';
    }
  }

  getShift(matchId: number) {
    var header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`),
    };

    return this.http
      .get(
        this.api_url + '/api/shift/' + matchId + '?cache=' + Date.now(),
        header
      )
      .pipe(map((res) => res));
  }

  createShift(matchId: number, data) {
    var header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`),
    };

    return this.http
      .post(
        this.api_url + '/api/shift/' + matchId + '?cache=' + Date.now(),
        data,
        header
      )
      .pipe(map((res) => res));
  }

  removeShift(matchId: number, id: number) {
    var header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`),
    };

    return this.http
      .delete(
        this.api_url +
          '/api/shift/' +
          matchId +
          '/' +
          id +
          '?cache=' +
          Date.now(),
        header
      )
      .pipe(map((res) => res));
  }

  updateShift(matchId: number, id: number, data: any) {
    var header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`),
    };

    return this.http
      .put(
        this.api_url +
          '/api/shift/' +
          matchId +
          '/' +
          id +
          '?cache=' +
          Date.now(),
        data,
        header
      )
      .pipe(map((res) => res));
  }

  updateShifts(shifts: any, matchId: number) {
    let body = {
      app: 'tracking',
      shifts: shifts,
    };

    console.log('Change all shifts body', body);
    var header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`),
    };

    return this.http
      .put(this.api_url + '/api/bulk/shift/' + matchId, body, header)
      .pipe(map((res) => res));
  }
}
