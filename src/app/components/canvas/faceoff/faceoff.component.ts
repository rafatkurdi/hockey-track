import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

import { FaceOffService } from '../../../services/faceOff.service';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'faceOff-canvas',
  templateUrl: './faceOff.component.html',
  styleUrls: ['./faceOff.component.scss'],
  providers: [FaceOffService],
})
export class FaceOffComponent implements OnInit {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

  //rosters
  @Input() roster_home: any = [];
  @Input() roster_away: any = [];
  roster_all: any = [];

  show_playground: boolean = false;
  editPage: boolean = false;

  active_faceoff: string = '';

  @Input() period: number;
  @Input() minute: number;
  @Input() second: number;
  @Input() casomira: number;
  @Input() editData: any;
  @Input() reversed_sides: boolean = false;

  @Output() reloadVideo = new EventEmitter<any>();
  @Output() saveType = new EventEmitter<any>();

  //filter
  time: string = '';
  winner: string = '';
  loser: string = '';
  clear_win: string = '';
  faceOffId: number;
  realDatetime: any;
  realDatetime_default: string = '';

  winner_name: string;
  winner_active: boolean = false;
  winner_team: string;

  loser_name: string;
  loser_active: boolean = false;

  matchId: number;

  loading: boolean = false;

  selectedPersonId: string = '';

  overtimeLength: number = 0;

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  contextmenu_attribute: string = '';
  showhelp: boolean = false;
  help_title: string = '';
  help_desc: string = '';

  save_type: string = '';

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  supervize: any = {
    time: false,
    timestamp: false,
    winnerId: false,
    loserId: false,
    location: false,
    cleanWin: false,
  };

  constructor(
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private faceOffService: FaceOffService,
    private defaultService: DefaultService
  ) {
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.overtimeLength = Number(localStorage.getItem('overtimeLength'));
  }

  ngOnInit(): void {
    this.formatRosters();
    this.parseEditData(this.editData);
  }

  switchWinner() {
    let winner = this.winner;
    let loser = this.loser;

    this.winner = loser;
    this.loser = winner;
  }

  parseEditData(data: any) {
    if (Object.keys(data).length != 0) {
      this.editPage = true;

      if (data.supervision != null) {
        this.supervize = data.supervision;
      }

      this.time = this.getCasomira(data.time);
      if (this.time.length == 4) {
        this.time = '0' + this.time;
      }

      this.realDatetime = new Date(data.timestamp);
      this.realDatetime_default = data.timestamp;

      this.faceOffId = data.faceOffId;
      this.active_faceoff = data.location;

      this.loser = data.loserId;
      this.winner = data.winnerId;

      setTimeout(() => {
        this.winner_name = this.getPlayerTemplate(Number(this.winner));
        this.winner_team = this.getPlayerTeam(Number(this.winner));

        this.loser_name = this.getPlayerTemplate(Number(this.loser));
      }, 200);

      if (this.winner == undefined) {
        this.winner = '';
      }
      if (this.loser == undefined) {
        this.loser = '';
      }
      if (this.active_faceoff == undefined) {
        this.active_faceoff = '';
      }

      if (data.cleanWin == null) {
        this.clear_win = '';
      } else if (data.cleanWin == true) {
        this.clear_win = 'yes';
      } else if (data.cleanWin == false) {
        this.clear_win = 'no';
      }
    }
  }

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
  }

  replay(time_value: string) {
    let times = [];
    times = time_value.split(':');
    let time = Number(times[0]) * 60 + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + this.overtimeLength;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + this.overtimeLength;
    }

    //faceoff pridani jedne sekundy
    time = time + 1;
    this.reloadVideo.emit(time);
  }

  formatRosters() {
    this.roster_home.forEach((player) => {
      player.team = 'home';
      player.search = player.name + ' ' + player.surname + '' + player.jersey;
      this.roster_all.push(player);
    });
    this.roster_away.forEach((player) => {
      player.team = 'away';
      player.search = player.name + ' ' + player.surname + '' + player.jersey;
      this.roster_all.push(player);
    });
  }

  winnerPlayerChanged(newVal) {
    this.winner = newVal.id;
    this.winner_team = newVal.team;

    let winner_team = this.getPlayerTeamShortcut(Number(this.winner));
    let loser_team = this.getPlayerTeamShortcut(Number(this.loser));

    if (winner_team != '') {
      if (winner_team == loser_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Vítěz nemůže být ze stejného týmu jako poražený.'
        );
        setTimeout(() => {
          this.winner = '';
          this.winner_name = '';
          this.winner_team = '';
          this.winner_active = false;
        }, 100);
      }
    }
  }

  winnerPlayerChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.winner = '';
      this.winner_team = '';
      this.winner_active = false;
    }
  }

  checkUndefinedPlayer() {
    setTimeout(() => {
      if (this.winner == undefined) {
        this.winner_name = '';
        this.winner_team = '';
      }
      if (this.loser == undefined) {
        this.loser_name = '';
      }
    }, 100);
  }

  loserPlayerChanged(newVal) {
    this.loser = newVal.id;

    let winner_team = this.getPlayerTeamShortcut(Number(this.winner));
    let loser_team = this.getPlayerTeamShortcut(Number(this.loser));

    if (loser_team != '') {
      if (winner_team == loser_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Vítěz nemůže být ze stejného týmu jako poražený.'
        );
        setTimeout(() => {
          this.loser = '';
          this.loser_name = '';
        }, 100);
      }
    }
  }

  loserPlayerChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.loser = '';
    }
  }

  toggleClearWin(type: string) {
    if (type == 'yes') {
      if (this.clear_win == 'yes') {
        this.clear_win = '';
      } else {
        this.clear_win = 'yes';
      }
    } else if (type == 'no') {
      if (this.clear_win == 'no') {
        this.clear_win = '';
      } else {
        this.clear_win = 'no';
      }
    }
  }

  getOpponentRoster(player: string) {
    let type = this.getPlayerTeam(Number(player));
    if (type == 'home') {
      return this.roster_away;
    } else if (type == 'away') {
      return this.roster_home;
    } else {
      return this.roster_all;
    }
  }

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.faceOffId,
      type: 'faceOff',
    });
  }

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
  }

  showPlayground() {
    if (this.show_playground) {
      this.show_playground = false;
    } else {
      this.show_playground = true;
    }
    if (!this.show_playground) {
      this.scroller.nativeElement.scrollLeft = 0;
    } else {
      this.scroller.nativeElement.scrollLeft =
        this.scroller.nativeElement.scrollWidth;
    }
  }

  formatPosition(position: string) {
    if (position == 'forward') {
      return 'Ú';
    } else if (position == 'backward') {
      return 'O';
    } else if (position == 'goalkeeper') {
      return 'B';
    }
  }

  autocompleListFormatter = (data: any) => {
    let position = this.formatPosition(data.position);

    let team = this.getPlayerTeamShortcut(data.id);

    let html = `<img src="/assets/image/logos/${team}.png" onerror="this.src='/assets/image/logos/default.png';" onerror="this.src='/assets/image/logos/default.png';" width="18px" height="18px" style="vertical-align:top;margin-top:0px;margin-right:4px"><span style="color:#637680;width:29px;display:inline-block;padding-left:3px">#${data.jersey}</span>&nbsp;<span>${data.surname} ${data.name}</span><span style="float:right;border:1px solid #1c7cd6;color:#1c7cd6;text-align:center;border-radius:100%;font-size:8px;padding-top:1px;width:16px;height:16px;">${position}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  };

  autocompleValueFormatter = (data: any) => {
    let position = this.formatPosition(data.position);
    let team = this.getPlayerTeamShortcut(data.id);
    let text =
      '#' +
      data.jersey +
      ' ' +
      data.surname +
      ' ' +
      data.name +
      ' (' +
      team +
      ')';
    return text;
  };

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }

  activeFaceoff(position: string) {
    if (this.active_faceoff == position) {
      this.active_faceoff = '';
    } else {
      this.active_faceoff = position;
    }
  }

  ISODateString(d) {
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
    return (
      d.getUTCFullYear() +
      '-' +
      pad(d.getUTCMonth() + 1) +
      '-' +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      ':' +
      pad(d.getUTCMinutes()) +
      ':' +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  }

  getPlayerTemplate(id: number) {
    let player_selected = '';

    let team = this.getPlayerTeamShortcut(id);

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected =
          '#' +
          player.jersey +
          ' ' +
          player.surname +
          ' ' +
          player.name +
          ' (' +
          team +
          ')';
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected =
          '#' +
          player.jersey +
          ' ' +
          player.surname +
          ' ' +
          player.name +
          ' (' +
          team +
          ')';
      }
    });

    return String(player_selected);
  }

  getPlayerTeamShortcut(id: number) {
    let player_selected = '';

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team_shortcut;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team_shortcut;
      }
    });

    return player_selected;
  }

  getPlayerTeam(id: number) {
    let player_selected = '';

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team;
      }
    });

    return player_selected;
  }

  selectPlayerByClick(id: string) {
    if (this.winner_active) {
      this.winner = id;
      this.winner_active = false;
    }

    if (this.loser_active) {
      this.loser = id;
      this.loser_active = false;
    }

    (document.activeElement as HTMLElement).blur();
  }

  stringy(test: any) {}

  getPeriodNumber(seconds: number) {
    if (seconds > -1 && seconds < 1200) {
      return 1;
    } else if (seconds >= 1200 && seconds < 2400) {
      return 2;
    } else if (seconds >= 2400 && seconds < 3600) {
      return 3;
    } else if (seconds >= 3600 && seconds < 4800) {
      return 4;
    } else if (seconds >= 4800 && seconds <= 6000) {
      return 5;
    } else if (seconds > 6000) {
      return 6;
    }
  }

  getCasomira(seconds: number) {
    const period = this.getPeriodNumber(seconds);
    if (period === 1) {
      return this.formatTime(1200 - seconds);
    } else if (period === 2) {
      return this.formatTime(2400 - seconds);
    } else if (period === 3) {
      return this.formatTime(3600 - seconds);
    } else if (period === 4) {
      return this.formatTime(3600 + this.overtimeLength - seconds);
    } else if (period === 5) {
      return this.formatTime(4800 + this.overtimeLength - seconds);
    } else if (period === 6) {
      return this.formatTime(6000 + this.overtimeLength - seconds);
    }
  }

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  changePlayersValidate() {
    let winner_team = this.getPlayerTeam(Number(this.winner));
    let loser_team = this.getPlayerTeam(Number(this.loser));

    if (winner_team != '' || loser_team != '') {
      if (winner_team == loser_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Vítěz nemůže být ze stejného týmu, jako poražený.'
        );
        this.loser = '';
      }
    }
  }

  toggleMenu(event, contextmenu_attribute: string) {
    this.contextmenuX = event.pageX;
    this.contextmenuY = event.pageY;
    this.contextmenu_attribute = contextmenu_attribute;
    this.contextmenu = true;
    this.showhelp = false;
  }

  disableContextMenu() {
    this.contextmenu = false;
  }

  toggleHelp() {
    if (this.contextmenu_attribute === 'winnerId') {
      this.help_title = 'Vítěz';
      this.help_desc = 'Nápověda k vítěži.';
    } else if (this.contextmenu_attribute === 'loserId') {
      this.help_title = 'Poražený';
      this.help_desc = 'Nápověda k poraženému.';
    } else if (this.contextmenu_attribute === 'cleanWin') {
      this.help_title = 'Čistě vyhrané vhazování';
      this.help_desc = 'Nápověda k čistě vyhranému vhazování.';
    }
    this.showhelp = true;
  }

  toggleSupervize() {
    let attribute = this.contextmenu_attribute;
    if (this.supervize[attribute]) {
      this.supervize[attribute] = false;
    } else {
      this.supervize[attribute] = true;
    }
  }

  updateSupervize(faceOffId: number) {
    let data = this.supervize;
    this.faceOffService
      .updateSupervize(this.matchId, faceOffId, data)
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.close();
          this.saveAndNext();
        },
        (error) => {
          this.loading = false;
        }
      );
  }

  logError(data: any) {
    this.defaultService.error(data).subscribe((data: any) => {});
  }

  submit(type: string) {
    if (Object.keys(this.editData).length == 0) {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.createFaceOff();
      }
    } else {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.updateFaceOff();
      }
    }
  }

  validace() {
    let ok = true;

    //detekce prazdne casomiry
    if (this.time == '') {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Čas časomíry nemůže být prázdný.');
    }

    //detekce nesmyslneho casu
    let times = [];
    times = this.time.split(':');
    let time = Number(times[0]) * 60 + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + 1200;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + 1200;
    } else if (this.period === 6) {
      time = (time - 6000) * -1 + 1200;
    }
    if (isNaN(time)) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Časomíra musí být ve správném formátu. (MM:SS)'
      );
    }
    if (time < 0) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Časomíra je zadaná chybně. Musí být v rozmezí od 20:00 do 00:00'
      );
    }

    //detekce prazdne lokace
    if (this.active_faceoff == '') {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Lokace nemůže být prázdná.');
    }

    //detekce prazdneho viteze
    if (this.winner == '' || this.winner == undefined) {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Pole vítěz nemůže být prázdné.');
    }

    //detekce prazdneho porazeneho
    if (this.loser == '' || this.loser == undefined) {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Pole poražený nemůže být prázdné.');
    }

    /*
    if (this.realDatetime == "" || this.realDatetime == undefined) {
      ok = false;
      this.sendToast("error", "Chyba!", "Reálný čas vhazování nemůže být prázdný.");
    }
    */

    return ok;
  }

  createFaceOff() {
    let times = [];
    times = this.time.split(':');
    let time = Number(times[0]) * 60 + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + this.overtimeLength;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + this.overtimeLength;
    } else if (this.period === 6) {
      time = (time - 6000) * -1 + this.overtimeLength;
    }

    let winnerId = String(this.winner);
    if (winnerId == '') {
      winnerId = null;
    }
    let loserId = String(this.loser);
    if (loserId == '') {
      loserId = null;
    }
    let location = String(this.active_faceoff);
    if (location == '') {
      location = null;
    }
    let cleanWin; //true false
    if (this.clear_win == 'yes') {
      cleanWin = true;
    } else if (this.clear_win == 'no') {
      cleanWin = false;
    } else if (this.clear_win == '') {
      cleanWin = 'null';
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    var date = null;

    let data = {
      time: time,
      winnerId: winnerId,
      loserId: loserId,
      location: location,
      cleanWin: cleanWin,
      realDate: date,
      app: app,
    };

    this.faceOffService.createFaceOff(this.matchId, data).subscribe(
      (data: any) => {
        this.sendCasomiraAfterEventEdit(this.time);

        this.supervize.timestamp = true;
        this.updateSupervize(data.id);

        this.sendToast(
          'success',
          'Výborně!',
          'Vybraná událost byla vytvořena.'
        );
      },
      (error) => {
        this.logError({
          error: JSON.stringify(error),
          match: this.matchId,
          data: JSON.stringify(data),
        });

        console.log(JSON.stringify(error));
        this.loading = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Během přidávání vhazování došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }

  updateFaceOff() {
    let times = [];
    times = this.time.split(':');
    let time = Number(times[0]) * 60 + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + this.overtimeLength;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + this.overtimeLength;
    } else if (this.period === 6) {
      time = (6000 - time) + this.overtimeLength;
    }

    let winnerId = String(this.winner);
    if (winnerId == '') {
      winnerId = null;
    }
    let loserId = String(this.loser);
    if (loserId == '') {
      loserId = null;
    }
    let location = String(this.active_faceoff);
    if (location == '') {
      location = null;
    }
    let cleanWin; //true false
    if (this.clear_win == 'yes') {
      cleanWin = true;
    } else if (this.clear_win == 'no') {
      cleanWin = false;
    } else if (this.clear_win == '') {
      cleanWin = 'null';
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    var datex = this.realDatetime;
    var date = datex.toISOString();

    if (this.page_type == 'tracking') {
      date = this.realDatetime_default;
    }

    let data = {
      time: time,
      winnerId: winnerId,
      loserId: loserId,
      location: location,
      cleanWin: cleanWin,
      realDate: date,
      app: app,
    };

    this.faceOffService
      .updateFaceOff(this.matchId, this.faceOffId, data)
      .subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);
          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );

          this.updateSupervize(this.faceOffId);
        },
        (error) => {
          this.logError({
            error: JSON.stringify(error),
            match: this.matchId,
            data: JSON.stringify(data),
          });

          console.log(JSON.stringify(error));
          this.loading = false;
          this.sendToast(
            'error',
            'Chyba!',
            'Během úpravy vhazování došlo k chybě. Zkuste to znovu.'
          );
        }
      );
  }
}

Date.prototype.toISOString = function () {
  var tzo = -this.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = function (num) {
      var norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };
  return (
    this.getFullYear() +
    '-' +
    pad(this.getMonth() + 1) +
    '-' +
    pad(this.getDate()) +
    'T' +
    pad(this.getHours()) +
    ':' +
    pad(this.getMinutes()) +
    ':' +
    pad(this.getSeconds()) +
    dif +
    pad(tzo / 60) +
    '' +
    pad(tzo % 60)
  );
};
