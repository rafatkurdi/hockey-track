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
import { Router, ActivatedRoute } from '@angular/router';

import { DumpOutService } from '../../../services/dumpOut.service';
import { PuckWonService } from '../../../services/puckWon.service';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'dumpOut-canvas',
  templateUrl: './dumpOut.component.html',
  styleUrls: ['./dumpOut.component.scss'],
  providers: [DumpOutService, PuckWonService],
})
export class DumpOutComponent implements OnInit, OnChanges {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;
  @Input() selected_x: number;
  @Input() selected_y: number;

  show_playground: boolean = false;
  editPage: boolean = false;

  loading: boolean = false;

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

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

  overtimeLength: number = 0;

  player: string = '';
  player_name: string;
  player2: string = '';
  player2_name: string;
  player3: string = '';
  player3_name: string;

  player_team: string = '';
  player_active: boolean = false;

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  lokace: string = '';
  lokace2: string = '';

  lokace_active: boolean = true;
  lokace2_active: boolean = false;

  x: number;
  y: number;
  show_coordinates: boolean = false;

  dumpIn: boolean = undefined;
  battleWon: boolean = undefined;
  battleWonTeam: string = '';
  battle: boolean = undefined;

  puck_type: string = '';
  goalieTouch: string = '';

  time: string = '';

  bad_pos = false;

  homeTeamId: number;
  awayTeamId: number;

  dumpOutId: number;
  puckWonId: number;
  puckWon_list: any = [];
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

  supervize: any = {
    time: false,
    playerId: false,
    battleWonTeamId: false,
    coordinates: false,
    battle: false,
    dumpIn: false,
    realDate: false,
  };

  constructor(
    private _sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private dumpOutService: DumpOutService,
    private puckWonService: PuckWonService,
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

    console.log('lokace:', this.lokace);
  }

  checkPlayer() {
    this.bad_pos = false;
    if (this.player && this.x && !this.lokace2_active) {
      this.roster_all.forEach((player) => {
        if (this.player == player.id) {
          if (
            (player.team == 'home' && this.x != 24) ||
            (player.team == 'away' && this.x != -24)
          ) {
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

      this.dumpOutId = data.dumpOutId;

      this.player = data.playerId;
      this.dumpIn = data.dumpIn;
      this.battle = data.battle;

      this.realDate = data.realDate;

      setTimeout(() => {
        this.player_name = this.getPlayerTemplate(Number(this.player));
        this.player_team = this.getPlayerTeam(Number(this.player));
      }, 200);

      if (this.player == undefined) {
        this.player = '';
      }

      if (data.battleWonTeamId == this.getPlayerTeamId(Number(this.player))) {
        this.battleWonTeam = 'utocici';
      } else {
        this.battleWonTeam = 'branici';
      }

      this.lokace = data.coordinates.x + ';' + data.coordinates.y;
      this.checkPlayer();
      this.loading = false;
    }
  }

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
  }

  selectPlayerByClick(id: string) {
    if (this.player_active) {
      this.player = id;
      this.player_active = false;
    }

    (document.activeElement as HTMLElement).blur();
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
      this.homeTeamId = player.team_id;
    });
    this.roster_away.forEach((player) => {
      player.team = 'away';
      player.search = player.name + ' ' + player.surname + '' + player.jersey;

      this.roster_all.push(player);
      this.awayTeamId = player.team_id;
    });
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

  playerChanged(newVal) {
    this.player = newVal.id;
    this.player_team = newVal.team;
  }

  playerChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player = '';
      this.player_team = '';
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
      if (this.player == undefined) {
        this.player_name = '';
        this.player_team = '';
      }
      if (this.player2 == undefined) {
        this.player2_name = '';
      }
      if (this.player2 == undefined) {
        this.player2_name = '';
      }
    }, 100);
  }

  getOwnTeamRoster(type: string) {
    if (type == 'home') {
      return this.roster_home;
    } else if (type == 'away') {
      return this.roster_away;
    } else {
      return this.roster_all;
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

  checkXY2() {
    this.lokace2_active = true;
  }

  uncheckXY2() {
    setTimeout(() => {
      this.lokace2_active = false;
    }, 500);
  }

  sendCoordinates(x: number, y: number) {
    if (this.lokace_active) {
      this.lokace = x + ';' + y;
      this.lokace_active = false;
    }
    if (this.lokace2_active) {
      this.lokace2 = x + ';' + y;
      this.lokace2_active = false;
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

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
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

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
  }

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.dumpOutId,
      type: 'dumpOut',
    });
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

  getPlayerTeamId(id: number) {
    let team_id;

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        team_id = player.team_id;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        team_id = player.team_id;
      }
    });

    return team_id;
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
    this.dumpOutService.updateSupervize(this.matchId, id, data).subscribe(
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
        this.createDumpOut();
      }
    } else if (!this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.updateDumpOut();
      }
    } else {
      this.checkPlayer();
    }
  }

  validace() {
    let ok = true;

    //detekce prazdneho hrace
    if (this.player == '' || this.player == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole hráč, který vyhodil puk nemůže být prázdné.'
      );
    }

    //detekce prazdne casomiry
    if (this.time == '') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Čas časomíry u zisku puku nemůže být prázdný.'
      );
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

    if (this.dumpIn == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit zda vyhození puku bylo do útočného pásma.'
      );
    }

    if (this.dumpIn == true) {
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

      if (this.battle == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Je nutné vyplnit, zda po vyhození následoval souboj o puk.'
        );
      }

      if (this.battleWonTeam == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Je nutné vyplnit tým, který získal puk do držení.'
        );
      }
    }

    return ok;
  }

  createDumpOut() {
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

    let lokace = [];
    lokace = this.lokace.split(';');

    let player = String(this.player);
    if (player == '') {
      player = null;
    }

    let battleWonTeamId;
    if (this.battleWonTeam == 'utocici') {
      battleWonTeamId = this.getPlayerTeamId(Number(player));
    } else if (this.battleWonTeam == 'branici') {
      if (this.getPlayerTeamId(Number(player)) == this.homeTeamId) {
        battleWonTeamId = this.awayTeamId;
      } else {
        battleWonTeamId = this.homeTeamId;
      }
    } else {
      battleWonTeamId = null;
    }

    if (this.dumpIn == false) {
      lokace[0] = 0;
      lokace[1] = 0;
      this.battle = false;
      battleWonTeamId = null;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      playerId: player,
      battleWonTeamId: battleWonTeamId,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      battle: this.battle,
      dumpIn: this.dumpIn,
      realDate: new Date(),
      app: app,
    };

    this.dumpOutService.createDumpOut(this.matchId, data).subscribe(
      (data: any) => {
        this.sendCasomiraAfterEventEdit(this.time);

        this.sendToast(
          'success',
          'Výborně!',
          'Vybraná událost byla vytvořena.'
        );
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
          'Během přidávání vyhození došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }

  updateDumpOut() {
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

    let lokace = [];
    lokace = this.lokace.split(';');

    let player = String(this.player);
    if (player == '') {
      player = null;
    }

    let battleWonTeamId;
    if (this.battleWonTeam == 'utocici') {
      battleWonTeamId = this.getPlayerTeamId(Number(player));
    } else if (this.battleWonTeam == 'branici') {
      if (this.getPlayerTeamId(Number(player)) == this.homeTeamId) {
        battleWonTeamId = this.awayTeamId;
      } else {
        battleWonTeamId = this.homeTeamId;
      }
    } else {
      battleWonTeamId = null;
    }

    if (this.dumpIn == false) {
      lokace[0] = 0;
      lokace[1] = 0;
      this.battle = false;
      battleWonTeamId = null;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      playerId: player,
      battleWonTeamId: battleWonTeamId,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      battle: this.battle,
      dumpIn: this.dumpIn,
      realDate: this.realDate,
      app: app,
    };

    this.dumpOutService
      .updateDumpOut(this.matchId, this.dumpOutId, data)
      .subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);

          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );
          this.updateSupervize(this.dumpOutId);
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
            'Během úpravy vyhození došlo k chybě. Zkuste to znovu.'
          );
        }
      );
  }
}
