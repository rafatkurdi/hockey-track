import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ZoneEntryService } from '../../../services/zoneEntry.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'zoneEntry-canvas',
  templateUrl: './zoneEntry.component.html',
  styleUrls: ['./zoneEntry.component.scss'],
  providers: [ZoneEntryService],
})
export class ZoneEntryComponent implements OnInit, OnChanges {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

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

  lokace: string = '';
  lokace_active: boolean = false;

  type: string = '';
  completed: string = '';

  player1: string = '';
  player1_name: string = '';
  player2: string = '';
  player2_name: string = '';
  player1_team: string = '';
  player3: string = '';
  player3_name: string = '';

  player1_active: boolean = false;
  player2_active: boolean = false;
  player3_active: boolean = false;

  x: number;
  y: number;
  show_coordinates: boolean = false;

  zoneEntryId: number;

  matchId: number;
  time: string = '';

  loading: boolean = false;
  bad_pos = false;

  @Input() selected_x: number;
  @Input() selected_y: number;

  lost_pred_vrcholky: string = '';

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
    type: false,
    playerId: false,
    passingPlayerId: false,
    coordinates: false,
    stopperPlayerId: false,
    completed: false,
  };

  constructor(
    private route: ActivatedRoute,
    private zoneEntryService: ZoneEntryService,
    private _sanitizer: DomSanitizer,
    private defaultService: DefaultService
  ) {
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.overtimeLength = Number(localStorage.getItem('overtimeLength'));
  }

  ngOnInit(): void {
    this.formatRosters();
    this.parseEditData(this.editData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ng on changes called in zoneEntry');
    if (changes.selected_x) {
      if (changes.selected_x.currentValue) {
        this.x = changes.selected_x.currentValue;
        this.lokace =
          changes.selected_x.currentValue +
          ';' +
          changes.selected_y.currentValue;
        this.checkPlayer();
      } else {
        this.lokace = '';
      }
    } else {
      if (changes.selected_y) {
        this.lokace =
          this.x.toString() + ';' + changes.selected_y.currentValue.toString();
      } else {
        // this.lokace = '';
      }
    }
  }

  checkPlayer() {
    this.bad_pos = false;
    if (this.player1 && this.x) {
      this.roster_all.forEach((player) => {
        if (this.player1 == player.id) {
          if (
            (player.team == 'home' && this.x != 24) ||
            (player.team == 'away' && this.x != -24)
          ) {
            console.log('3');
            this.sendToast(
              'error',
              'Chyba!',
              'Špatná lokace - zvolte druhou modrou čáru'
            );
            this.bad_pos = true;
          }
        }
      });
    }
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

      this.zoneEntryId = data.zoneEntryId;

      this.player1 = data.playerId;
      this.player2 = data.passingPlayerId;
      this.player3 = data.stopperPlayerId;

      //alert(JSON.stringify(data));

      if (this.player3 != null || this.player3 === '') {
        this.lost_pred_vrcholky = 'yes';
      } else {
        this.lost_pred_vrcholky = 'no';
      }

      setTimeout(() => {
        this.player1_name = this.getPlayerTemplate(Number(this.player1));
        this.player1_team = this.getPlayerTeam(Number(this.player1));

        this.player2_name = this.getPlayerTemplate(Number(this.player2));

        this.player3_name = this.getPlayerTemplate(Number(this.player3));
      }, 200);

      if (this.player1 == undefined) {
        this.player1 = '';
      }
      if (this.player2 == undefined) {
        this.player2 = '';
      }
      if (this.player3 == undefined) {
        this.player3 = '';
      }

      this.type = data.type;
      if (data.completed) {
        this.completed = 'yes';
      } else {
        this.completed = 'no';
      }

      this.lokace = data.coordinates.x + ';' + data.coordinates.y;
      this.checkPlayer();
    } else {
      this.checkXY();
    }
  }

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
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

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.zoneEntryId,
      type: 'zoneEntry',
    });
  }

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
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
    if (this.player3_active) {
      this.player3 = id;
      this.player3_active = false;
    }

    (document.activeElement as HTMLElement).blur();
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

  toggleType(type: string) {
    this.type = type;
  }

  togglecompleted(type: string) {
    this.completed = type;
  }

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
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

  player3Changed(newVal) {
    this.player3 = newVal.id;
  }

  player3ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player3 = '';
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
      if (this.player3 == undefined) {
        this.player3_name = '';
      }
    }, 100);
  }

  getOwnTeamRoster(player: string) {
    let type = this.getPlayerTeam(Number(player));

    if (type == 'home') {
      return this.roster_home;
    } else if (type == 'away') {
      return this.roster_away;
    } else {
      return this.roster_all;
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

  onMapClick(event): void {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.show_coordinates = true;

    this.sendCoordinates(
      this.recountCoordinates(x, y, 'x'),
      this.recountCoordinates(x, y, 'y')
    );

    this.checkPlayer();
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

    if (xx < 1) {
      xx = -24;
      this.x = -24;
    } else {
      xx = 24;
      this.x = 24;
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

    if (parseInt(coordinates[0]) < 1) {
      coordinates[0] = -24;
      this.x = -24;
    } else {
      coordinates[0] = 24;
      this.x = 24;
    }

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

  toggleLostPredVrcholky(type: string) {
    this.lost_pred_vrcholky = type;
    if (type == 'no') {
      this.player3 = '';
      this.player3_name = '';
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
    this.zoneEntryService.updateSupervize(this.matchId, id, data).subscribe(
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
    if (Object.keys(this.editData).length == 0 && !this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;

        this.loading = true;
        this.createFaceOff();
      }
    } else if (!this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;

        this.loading = true;
        this.updateFaceOff();
      }
    } else {
      this.checkPlayer();
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

    //detekce druhu přesunu
    if (this.type == '') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vybrat druh přesunu puku přes modrou čáru.'
      );
    }
    if (this.type == 'pass') {
      if (this.completed == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Je nutné vyplnit zda přihrávka byla zpracovaná.'
        );
      }
    }

    //detekce prazdneho hrace
    if (this.player1 == '' || this.player1 == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole hráč zavážející puk nemůže být prázdné.'
      );
    }

    if (this.lost_pred_vrcholky == '') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit, zda ztratil hráč držení před vrcholky kruhů.'
      );
    }

    if (this.lost_pred_vrcholky == 'yes') {
      if (this.player3 == '' || this.player3 == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Pole protihráč, který způsobil ztrátu nemůže být prázdné.'
        );
      }
    }

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

    let type = String(this.type);
    if (type == '') {
      type = null;
    }

    let player1 = String(this.player1);
    if (player1 == '') {
      player1 = null;
    }
    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }
    let player3 = String(this.player3);
    if (player3 == '') {
      player3 = null;
    }
    if (player1 == 'undefined') {
      player1 = null;
    }
    if (player2 == 'undefined') {
      player2 = null;
    }
    if (player3 == 'undefined') {
      player3 = null;
    }

    let completed = false;
    if (this.completed == '') {
      completed = false;
    } else if (this.completed == 'yes') {
      completed = true;
    } else if (this.completed == 'no') {
      completed = false;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      type: type,
      playerId: player1,
      passingPlayerId: player2,
      stopperPlayerId: player3,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      completed: completed,
      app: app,
    };

    //alert(JSON.stringify(data));

    this.zoneEntryService.createZoneEntry(this.matchId, data).subscribe(
      (data: any) => {
        this.sendCasomiraAfterEventEdit(this.time);

        this.sendToast('success', 'Výborně!', 'Vybraná událost byla upravena.');
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
          'Během přidávání nového vstupu došlo k chybě. Zkuste to znovu.'
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
      time = (time - 6000) * -1 + this.overtimeLength;
    }

    let type = String(this.type);
    if (type == '') {
      type = null;
    }

    let player1 = String(this.player1);
    if (player1 == '') {
      player1 = null;
    }
    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }
    let player3 = String(this.player3);
    if (player3 == '') {
      player3 = null;
    }
    if (player1 == 'undefined') {
      player1 = null;
    }
    if (player2 == 'undefined') {
      player2 = null;
    }
    if (player3 == 'undefined') {
      player3 = null;
    }

    //alert(player3);

    let completed = false;
    if (this.completed == '') {
      completed = false;
    } else if (this.completed == 'yes') {
      completed = true;
    } else if (this.completed == 'no') {
      completed = false;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      type: type,
      playerId: player1,
      passingPlayerId: player2,
      stopperPlayerId: player3,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      completed: completed,
      app: app,
    };

    this.zoneEntryService
      .updateZoneEntry(this.matchId, this.zoneEntryId, data)
      .subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);

          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );
          this.updateSupervize(this.zoneEntryId);
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
            'Během úpravy vstupu do pásma došlo k chybě. Zkuste to znovu.'
          );
        }
      );
  }
}
