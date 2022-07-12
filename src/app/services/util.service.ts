import {Injectable} from '@angular/core';

@Injectable()
export class UtilService {

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }
}
