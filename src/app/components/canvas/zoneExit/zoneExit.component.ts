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
import { PuckWonService } from '../../../services/puckWon.service';

import { ZoneExitService } from '../../../services/zoneExit.service';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'zoneExit-canvas',
  templateUrl: './zoneExit.component.html',
  styleUrls: ['./zoneExit.component.scss'],
  providers: [ZoneExitService, PuckWonService],
})
export class ZoneExitComponent implements OnInit, OnChanges {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  show_playground: boolean = false;
  editPage: boolean = false;

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

  @Input() selected_x: number;
  @Input() selected_y: number;

  overtimeLength: number = 0;

  loading: boolean = false;

  type: string = '';
  stretchPass: boolean = undefined;
  received: boolean = undefined;
  success: boolean = undefined;

  lokace: string = '';
  lokace2: string = '';
  lokace3: string = '';

  lokace_active: boolean = true;
  lokace2_active: boolean = false;
  lokace3_active: boolean = false;

  time: string = '';

  bad_pos = false;

  followingEvent: string = '';

  player: string = '';
  player_name: string;
  player2: string = '';
  player2_name: string;

  player_active: boolean = false;
  player2_active: boolean = false;

  player_team: string = '';

  time2: string = '';

  x: number;
  y: number;
  show_coordinates: boolean = false;

  matchId: number;

  puck_type: string = '';
  underPressure: boolean = false;
  goalieTouch: string = '';

  zoneExitId: number;
  puckWonId: number;
  puckWon_list: any = [];

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  contextmenu_attribute: string = '';
  showhelp: boolean = false;
  help_title: string = '';
  help_desc: string = '';

  passingPlayerId: number;
  participation: any = [];

  save_type: string = '';

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  after_zone_exit: string = '';

  supervize: any = {
    time: false,
    type: false,
    playerId: false,
    passingPlayerId: false,
    coordinates: false,
    denialPlayerId: false,
    denialCoordinates: false,
    denialTime: false,
    followingEvent: false,
    participation: false,
    underPressure: false,
    success: false,
    stretchPass: false,
    received: false,
  };

  constructor(
    private _sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private zoneExitService: ZoneExitService,
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
  }

  checkPlayer() {
    this.bad_pos = false;
    console.log('Lokace2', this.lokace2_active);
    if (this.player && this.x && !this.lokace2_active) {
      this.roster_all.forEach((player) => {
        if (this.player == player.id) {
          if (
            (player.team == 'home' && this.x != -24) ||
            (player.team == 'away' && this.x != 24)
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

      this.loading = true;
      this.zoneExitId = data.zoneExitId;

      this.time = this.getCasomira(data.time);
      if (this.time.length == 4) {
        this.time = '0' + this.time;
      }

      this.participation = data.participation;

      this.passingPlayerId = data.passingPlayerId;
      this.success = data.success;
      this.player = data.playerId;
      this.player2 = data.denialPlayerId;
      setTimeout(() => {
        this.player_name = this.getPlayerTemplate(Number(this.player));
        this.player_team = this.getPlayerTeam(Number(this.player));
        this.player2_name = this.getPlayerTemplate(Number(this.player2));
      }, 200);
      if (this.player === undefined) {
        this.player = '';
      }
      if (this.player2 == undefined) {
        this.player2 = '';
      }

      this.type = data.type;
      this.stretchPass = data.stretchPass;
      this.received = data.received;

      this.lokace = data.coordinates.x + ';' + data.coordinates.y;

      if (data.denialCoordinates != undefined) {
        this.lokace2 =
          data.denialCoordinates.x + ';' + data.denialCoordinates.y;
      } else {
        this.lokace2 = '';
      }

      this.followingEvent = data.followingEvent;

      this.loading = false;

      /*
      this.puckWonService.getPuckWon(this.matchId)
        .subscribe((data2: any) => {
          this.puckWon_list = data2;

          this.puckWon_list.forEach((item, index) => {
            if (item.zoneExitId == this.zoneExitId) {

              this.puckWonId = item.puckWonId;

              this.player = data.denialPlayerId;
              this.player2 = item.playerId;


              this.lokace3 = item.coordinates.x + ';' + item.coordinates.y;
              this.puck_type = item.type;
              this.goalieTouch = item.goalieTouch;
              this.time2 = this.getCasomira(item.time);
              if (this.time2.length == 4) {
                this.time2 = '0' + this.time2;
              }

              setTimeout(() => {
                this.player_name = this.getPlayerTemplate(Number(this.player));
                this.player2_name = this.getPlayerTemplate(Number(this.player2));

                this.player_team = this.getPlayerTeam(Number(this.player))

              }, 200);
              if (this.player === undefined) {
                this.player = '';
              }
              if (this.player2 == undefined) {
                this.player2 = '';
              }

            }

            this.underPressure = item.underPressure;


          });


          this.loading = false;

        }, (error) => {
          this.loading = false;
        });
        */
    }
  }

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
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

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  formatTime2(seconds: number) {
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

  formatPosition(position: string) {
    if (position == 'forward') {
      return 'Ú';
    } else if (position == 'backward') {
      return 'O';
    } else if (position == 'goalkeeper') {
      return 'B';
    }
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

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  focusTime2() {
    this.time2 =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
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
    }, 100);
  }

  close() {
    this.closeCanvas.emit(this.after_zone_exit);
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.zoneExitId,
      type: 'zoneExit',
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

  checkXY2() {
    this.lokace2_active = true;
  }

  uncheckXY2() {
    setTimeout(() => {
      this.lokace2_active = false;
    }, 500);
  }

  checkXY3() {
    this.lokace3_active = true;
  }

  uncheckXY3() {
    setTimeout(() => {
      this.lokace3_active = false;
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
    if (this.lokace3_active) {
      this.lokace3 = x + ';' + y;
      this.lokace3_active = false;
    }
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

  onMapClick(event): void {
    console.log('Event', event);
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

    console.log('Lokace test', this.lokace2_active);
    if (this.lokace2_active == false) {
      if (xx < 1) {
        xx = -24;
        this.x = -24;
      } else {
        xx = 24;
        this.x = 24;
      }
    }

    if (coordinate == 'x') {
      return Math.round(xx);
    } else if (coordinate == 'y') {
      return Math.round(yy);
    }
  }

  getCoordinatesMap(lokace: string, axis: string, type: number) {
    let coordinates = [];
    coordinates = lokace.split(';');

    if (type != 1 && !this.lokace2_active) {
      if (parseInt(coordinates[0]) < 1) {
        coordinates[0] = -24;
        this.x = -24;
      } else {
        coordinates[0] = 24;
        this.x = 24;
      }
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

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
  }

  selectPlayerByClick(id: string) {
    if (this.player_active) {
      this.player = id;
      this.player_active = false;
    }
    if (this.player2_active) {
      this.player2 = id;
      this.player2_active = false;
    }

    (document.activeElement as HTMLElement).blur();
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
    this.zoneExitService.updateSupervize(this.matchId, id, data).subscribe(
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
    if (Object.keys(this.editData).length === 0 && !this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;

        this.loading = true;
        this.createZoneExit();
      }
    } else if (!this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;

        this.loading = true;
        this.updateZoneExit();
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
        'Pole hráč, který puk vyvezl nemůže být prázdné.'
      );
    }

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

    //detekce prazdneho presunu puku
    if (this.type == '') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit druh přesunu puku přes modrou čáru.'
      );
    }
    if (this.type == 'pass') {
      if (this.stretchPass == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Je nutné vyplnit přihrávku za červenou čárou.'
        );
      }

      if (this.received == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Je nutné vyplnit zda hráč zpracoval přihrávku.'
        );
      }
    }

    if (this.followingEvent == '') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit, co následovalo po výstupu z pásma.'
      );
    }

    if (this.followingEvent == 'denial') {
      if (this.time == '') {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Čas časomíry nemůže být prázdný.');
      }

      //detekce prazdne lokace
      if (this.lokace2 == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace ztráty puku nemůže být prázdná.'
        );
      }

      //detekce nesmyslne lokace
      let lokace2 = [];
      lokace2 = this.lokace2.split(';');
      if (lokace2[0] == undefined || lokace2[1] == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace ztráty puku není vyplněna správně.'
        );
      }
    }

    return ok;
  }

  createZoneExit() {
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

    let player = String(this.player);
    if (player == '') {
      player = null;
    }
    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }

    if (player == 'null') {
      player = null;
    }
    if (player2 == 'null') {
      player2 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let lokace2 = [];
    lokace2 = this.lokace2.split(';');
    if (lokace2[1] == undefined) {
      lokace2[0] = 0;
      lokace2[1] = 0;
    }

    if (this.underPressure == undefined) {
      this.underPressure = false;
    }

    if (this.stretchPass == undefined) {
      this.stretchPass = false;
    }

    if (this.received == undefined) {
      this.received = false;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      type: this.type,
      playerId: player,
      passingPlayerId: null,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      success: true,
      underPressure: this.underPressure,
      stretchPass: this.stretchPass,
      received: this.received,
      denialCoordinates: {
        x: lokace2[0],
        y: lokace2[1],
      },
      denialTime: time,
      denialPlayerId: player2,
      followingEvent: this.followingEvent,
      participation: [],
      app: app,
    };

    this.zoneExitService.createZoneExit(this.matchId, data).subscribe(
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
          'Během přidávání nového výstupu z pásma došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }

  updateZoneExit() {
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

    let player = String(this.player);
    if (player == '') {
      player = null;
    }
    let player2 = String(this.player2);
    if (player2 == '') {
      player2 = null;
    }

    if (player == 'null') {
      player = null;
    }
    if (player2 == 'null') {
      player2 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let lokace2 = [];
    lokace2 = this.lokace2.split(';');
    if (lokace2[1] == undefined) {
      lokace2[0] = 0;
      lokace2[1] = 0;
    }

    if (this.underPressure == undefined) {
      this.underPressure = false;
    }

    if (this.stretchPass == undefined) {
      this.stretchPass = false;
    }

    if (this.received == undefined) {
      this.received = false;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      type: this.type,
      playerId: player,
      passingPlayerId: this.passingPlayerId,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      success: this.success,
      underPressure: this.underPressure,
      stretchPass: this.stretchPass,
      received: this.received,
      denialCoordinates: {
        x: lokace2[0],
        y: lokace2[1],
      },
      denialTime: time,
      denialPlayerId: player2,
      followingEvent: this.followingEvent,
      participation: this.participation,
      app: app,
    };

    this.zoneExitService
      .updateZoneExit(this.matchId, this.zoneExitId, data)
      .subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);

          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla přidána.'
          );
          this.updateSupervize(this.zoneExitId);
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
            'Během úpravy výstupu z pásma došlo k chybě. Zkuste to znovu.'
          );
        }
      );
  }
}
