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

import { DumpInService } from '../../../services/dumpIn.service';
import { DefaultService } from '../../../services/default.service';

@Component({
  selector: 'dumpIn-canvas',
  templateUrl: './dumpIn.component.html',
  styleUrls: ['./dumpIn.component.scss'],
  providers: [DumpInService],
})
export class DumpInComponent implements OnInit, OnChanges {
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

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

  @Output() reloadVideo = new EventEmitter<any>();
  @Output() saveType = new EventEmitter<any>();

  lokace: string = '';
  lokace_active: boolean = false;

  player: string = '';
  player_name: string;
  player_active: boolean = false;

  x: number;
  y: number;
  show_coordinates: boolean = false;

  overtimeLength: number = 0;
  matchId: number;

  loading: boolean = false;
  dumpInId: number;

  battleWon: boolean = undefined;
  battleWonTeam: string = '';

  homeTeamId: number;
  awayTeamId: number;

  bad_pos = false;

  time: string = '';

  @Input() selected_x: number;
  @Input() selected_y: number;

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

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
    battleWon: false,
    realDate: false,
  };

  constructor(
    private _sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private dumpInService: DumpInService,
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

  parseEditData(data: any) {
    console.log('Data,', data);
    if (Object.keys(data).length != 0) {
      this.editPage = true;

      this.time = this.getCasomira(data.time);
      if (this.time.length == 4) {
        this.time = '0' + this.time;
      }

      if (data.supervision != null) {
        this.supervize = data.supervision;
      }

      this.dumpInId = data.dumpInId;

      this.player = data.playerId;

      this.realDate = data.realDate;

      setTimeout(() => {
        this.player_name = this.getPlayerTemplate(Number(this.player));
      }, 200);

      if (this.player == undefined) {
        this.player = '';
      }

      this.battleWon = data.battleWon;

      if (data.battleWonTeamId == this.getPlayerTeamId(Number(this.player))) {
        this.battleWonTeam = 'utocici';
      } else {
        this.battleWonTeam = 'branici';
      }

      this.lokace = data.coordinates.x + ';' + data.coordinates.y;
      this.checkPlayer();
    } else {
      this.checkXY();
    }
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

  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  sendCasomiraAfterEventEdit(time: string) {
    this.changeCasomira.emit({ time: time, period: this.period });
  }

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.dumpInId,
      type: 'dumpIn',
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

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
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

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
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

  playerChanged(newVal) {
    this.player = newVal.id;
  }

  playerChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player = '';
    }
  }

  checkUndefinedPlayer() {
    setTimeout(() => {
      if (this.player == undefined) {
        this.player_name = '';
      }
      /*
      if (this.loser == undefined) {
        this.loser_name = "";
      }
      */
    }, 100);
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

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  onMapClick(event): void {
    const rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

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

    console.log('Recounting...');
    if (xx < 1) {
      xx = -24;
      this.x = -24;
    } else {
      xx = 24;
      this.x = 24;
    }

    if (coordinate == 'x') {
      console.log('xx', xx);
      return Math.round(xx);
    } else if (coordinate == 'y') {
      return Math.round(yy);
    }
  }

  checkPlayer() {
    this.bad_pos = false;
    if (this.player && this.x) {
      this.roster_all.forEach((player) => {
        if (this.player == player.id) {
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
    if (this.contextmenu_attribute === 'playerId') {
      this.help_title = 'Hráč nahazující puk';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'battleWon') {
      this.help_title = 'Následoval po nahození souboj o puk?';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'battleWonTeamId') {
      this.help_title = 'Tým, který získal puk do držení';
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

  updateSupervize(faceOffId: number) {
    let data = this.supervize;
    this.dumpInService.updateSupervize(this.matchId, faceOffId, data).subscribe(
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
        this.createDumpIn();
      }
    } else if (!this.bad_pos) {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.updateDumpIn();
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

    //detekce prazdneho viteze
    if (this.player == '' || this.player == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole hráč nahazující puk nemůže být prázdné.'
      );
    }

    //detekce soboje o puk
    if (this.battleWon == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit, zda po vyhození následoval souboj o puk.'
      );
    }

    return ok;
  }

  createDumpIn() {
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

    let lokace = [];
    lokace = this.lokace.split(';');

    let battleWonTeamId;
    if (this.battleWonTeam == 'utocici') {
      battleWonTeamId = this.getPlayerTeamId(Number(player));
    } else {
      if (this.getPlayerTeamId(Number(player)) == this.homeTeamId) {
        battleWonTeamId = this.awayTeamId;
      } else {
        battleWonTeamId = this.homeTeamId;
      }
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
      battleWon: this.battleWon,
      realDate: new Date(),
      app: app,
    };

    this.dumpInService.createDumpIn(this.matchId, data).subscribe(
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
          'Během přidávání nového nahození došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }

  updateDumpIn() {
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
    let player = String(this.player);
    if (player == '') {
      player = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let battleWonTeamId;
    if (this.battleWonTeam == 'utocici') {
      battleWonTeamId = this.getPlayerTeamId(Number(player));
    } else {
      if (this.getPlayerTeamId(Number(player)) == this.homeTeamId) {
        battleWonTeamId = this.awayTeamId;
      } else {
        battleWonTeamId = this.homeTeamId;
      }
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
      battleWon: this.battleWon,
      realDate: this.realDate,
      app: app,
    };

    this.dumpInService
      .updateDumpIn(this.matchId, this.dumpInId, data)
      .subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);

          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );
          this.updateSupervize(this.dumpInId);
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
