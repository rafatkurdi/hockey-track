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

import { HitService } from '../../../services/hit.service';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'hit-canvas',
  templateUrl: './hit.component.html',
  styleUrls: ['./hit.component.scss'],
  providers: [HitService],
})
export class HitComponent implements OnInit {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  show_playground: boolean = false;
  editPage: boolean = false;

  //rosters
  @Input() roster_home: any = [];
  @Input() roster_away: any = [];
  roster_all: any = [];

  @Input() period: number;
  @Input() minute: number;
  @Input() second: number;
  @Input() editData: any;
  @Input() reversed_sides: boolean = false;

  @Output() reloadVideo = new EventEmitter<any>();
  @Output() saveType = new EventEmitter<any>();

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

  lokace: string = '';
  lokace_active: boolean = false;

  x: number;
  y: number;
  show_coordinates: boolean = false;

  overtimeLength: number = 0;

  player1: string = '';
  player1_name: string = '';
  player2: string = '';
  player2_name: string = '';

  player1_team: string = '';

  player1_active: boolean = false;
  player2_active: boolean = false;

  time: string = '';

  loading: boolean = false;
  hitId: number;

  hitWon: boolean = undefined;

  matchId: number;

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  contextmenu_attribute: string = '';
  showhelp: boolean = false;
  help_title: string = '';
  help_desc: string = '';

  realDate: string = '';
  save_type: string = '';

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  supervize: any = {
    time: false,
    hitterId: false,
    hittedId: false,
    coordinates: false,
    hitWon: false,
  };

  constructor(
    private _sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private hitService: HitService,
    private defaultService: DefaultService
  ) {
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.overtimeLength = Number(localStorage.getItem('overtimeLength'));
  }

  ngOnInit(): void {
    this.formatRosters();
    this.parseEditData(this.editData);
  }

  parseEditData(data: any) {
    if (Object.keys(data).length != 0) {
      this.editPage = true;

      this.time = this.getCasomira(data.time);
      if (this.time.length == 4) {
        this.time = '0' + this.time;
      }

      if (data.supervision != null) {
        this.supervize = data.supervision;
      }

      this.hitId = data.hitId;

      this.player1 = data.hitter;
      this.player2 = data.hitted;

      this.realDate = data.realDate;

      setTimeout(() => {
        this.player1_name = this.getPlayerTemplate(Number(this.player1));
        this.player2_name = this.getPlayerTemplate(Number(this.player2));

        this.player1_team = this.getPlayerTeam(Number(this.player1));
      }, 200);

      if (this.player1 == undefined) {
        this.player1 = '';
      }
      if (this.player2 == undefined) {
        this.player2 = '';
      }

      this.hitWon = data.hitWon;
      this.lokace = data.coordinates.x + ';' + data.coordinates.y;
    }
  }

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
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

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.hitId,
      type: 'hit',
    });
  }

  toggleHitWon(state: boolean) {
    if (state == this.hitWon) {
      this.hitWon = null;
    } else {
      this.hitWon = state;
    }
  }

  selectPlayerByClick(id: string) {
    if (this.player1_active) {
      this.player1 = id;
      this.player1_active = false;
    }
    if (this.player2_active) {
      this.player2 = id;
      this.player2_active = false;
    }

    (document.activeElement as HTMLElement).blur();
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

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
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

  showPlayground() {
    if (this.show_playground) {
      this.show_playground = false;
    } else {
      this.show_playground = true;
    }
    if (!this.show_playground) {
      this.scroller.nativeElement.scrollLeft = 0;
    } else {
      this.scroller.nativeElement.scrollLeft = this.scroller.nativeElement.scrollWidth;
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

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }

  autocompleListFormatter = (data: any) => {
    let position = this.formatPosition(data.position);

    let team = this.getPlayerTeamShortcut(data.id);

    let html = `<img src="/assets/image/logos/${team}.png" onerror="this.src='/assets/image/logos/default.png';" width="18px" height="18px" style="vertical-align:top;margin-top:0px;margin-right:4px"><span style="color:#637680;width:29px;display:inline-block;padding-left:3px">#${data.jersey}</span>&nbsp;<span>${data.surname} ${data.name}</span><span style="float:right;border:1px solid #1c7cd6;color:#1c7cd6;text-align:center;border-radius:100%;font-size:8px;padding-top:1px;width:16px;height:16px;">${position}</span>`;
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

  formatPosition(position: string) {
    if (position == 'forward') {
      return 'Ú';
    } else if (position == 'backward') {
      return 'O';
    } else if (position == 'goalkeeper') {
      return 'B';
    }
  }

  checkXY() {
    this.lokace_active = true;
  }

  uncheckXY() {
    setTimeout(() => {
      this.lokace_active = false;
    }, 500);
  }

  sendCoordinates(x: number, y: number) {
    if (this.lokace_active) {
      this.lokace = x + ';' + y;
      this.lokace_active = false;
    }
  }

  onMapClick(event): void {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.show_coordinates = true;

    this.sendCoordinates(
      this.recountCoordinates(x, y, 'x'),
      this.recountCoordinates(x, y, 'y')
    );
  }

  recountCoordinates(x: number, y: number, coordinate: string) {
    let xx = x - 270;
    let yy = y - 270 / 2;

    if (!this.reversed_sides) {
      xx = this.remap(xx, -270, 270, -100, 100);
      yy = this.remap(yy, -135, 135, -100, 100) * -1;
    } else {
      xx = this.remap(xx, -270, 270, -100, 100) * -1;
      yy = this.remap(yy, -135, 135, -100, 100);
    }

    if (coordinate == 'x') {
      return Math.round(xx);
    } else if (coordinate == 'y') {
      return Math.round(yy);
    }
  }

  getCoordinatesMap(lokace: string, axis: string) {
    let coordinates = [];
    coordinates = lokace.split(';');

    if (!this.reversed_sides) {
      if (axis === 'x') {
        return Math.round(this.remap(coordinates[0], -100, 100, 0, 540));
      } else if (axis === 'y') {
        return Math.round(this.remap(coordinates[1], -100, 100, 270, 0));
      }
    } else {
      if (axis === 'x') {
        return Math.round(this.remap(coordinates[0], -100, 100, 540, 0));
      } else if (axis === 'y') {
        return Math.round(this.remap(coordinates[1], -100, 100, 0, 270));
      }
    }
  }

  remap(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
  ) {
    return Math.ceil(
      ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
  }

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

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  player1Changed(newVal) {
    this.player1 = newVal.id;
    this.player1_team = newVal.team;
  }

  player1ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player1 = '';
      this.player1_team = '';
    }
  }

  player2Changed(newVal) {
    this.player2 = newVal.id;
  }

  player2ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player2 = '';
    }
  }

  checkUndefinedPlayer() {
    setTimeout(() => {
      if (this.player1 == undefined) {
        this.player1_name = '';
        this.player1_team = '';
      }
      if (this.player2 == undefined) {
        this.player2_name = '';
      }
    }, 100);
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
      this.help_title = '???';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'loserId') {
      this.help_title = '???';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'cleanWin') {
      this.help_title = '???';
      this.help_desc = '???';
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

  updateSupervize(id: number) {
    let data = this.supervize;
    this.hitService.updateSupervize(this.matchId, id, data).subscribe(
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

  submit(type: string) {
    if (Object.keys(this.editData).length == 0) {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.createHit();
      }
    } else {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.updateHit();
      }
    }
  }

  logError(data: any) {
    this.defaultService.error(data).subscribe((data: any) => {});
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
    if (this.lokace == '') {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Lokace nemůže být prázdná.');
    }

    //detekce nesmyslne lokace
    let lokace = [];
    lokace = this.lokace.split(';');
    if (lokace[0] == undefined || lokace[1] == undefined) {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Lokace není vyplněna správně.');
    }

    //detekce prazdneho hrace
    if (this.player1 == '' || this.player1 == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole hitující hráč nemůže být prázdné.'
      );
    }
    if (this.player2 == '' || this.player2 == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole hitovaný hráč nemůže být prázdné.'
      );
    }

    //detekce prazdne lokace
    if (this.hitWon == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit, zda získal hitující tým po hitu puk.'
      );
    }

    return ok;
  }

  createHit() {
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

    let player1 = String(this.player1);
    if (player1 == '') {
      player1 = null;
    }

    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      hitter: player1,
      hitted: player2,
      time: time,
      hitWon: this.hitWon,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      realDate: new Date(),
      app: app,
    };

    this.hitService.createHit(this.matchId, data).subscribe(
      (data: any) => {
        this.sendCasomiraAfterEventEdit(this.time);

        this.sendToast('success', 'Výborně!', 'Vybraná událost byla přidána.');
        this.updateSupervize(data.id);
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
          'Během přidávání nového hitu došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }

  updateHit() {
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
      time = (3600 - time) + this.overtimeLength;
    } else if (this.period == 5) {
      time = (4800 - time) + this.overtimeLength;
    } else if (this.period === 6) {
      time = (6000 - time) + this.overtimeLength;
    }

    let player1 = String(this.player1);
    if (player1 == '') {
      player1 = null;
    }
    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      hitter: player1,
      hitted: player2,
      time: time,
      hitWon: this.hitWon,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      realDate: this.realDate,
      app: app,
    };

    this.hitService.updateHit(this.matchId, this.hitId, data).subscribe(
      (data: any) => {
        this.sendCasomiraAfterEventEdit(this.time);

        this.sendToast('success', 'Výborně!', 'Vybraná událost byla upravena.');
        this.updateSupervize(this.hitId);
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
          'Během úpravy nahození do pásma došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }
}
