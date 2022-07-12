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

import { ShotService } from '../../../services/shot.service';
import { PuckWonService } from '../../../services/puckWon.service';
import { PassService } from '../../../services/pass.service';

import { MapComponent } from '../../common/map/map.component';
import { DefaultService } from '../../../services/default.service';
import * as data from '../../../../lang.json';

@Component({
  selector: 'shot-canvas',
  templateUrl: './shot.component.html',
  styleUrls: ['./shot.component.scss'],
  providers: [ShotService, PuckWonService, PassService, DefaultService],
})
export class ShotComponent implements OnInit {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();
  @Input() invalidCasomira: boolean;

  show_playground: boolean = false;
  editPage: boolean = false;

  shot_active: string = '';

  puckWon_list: any = [];

  //rosters
  @Input() roster_home: any = [];
  @Input() roster_away: any = [];
  roster_all: any = [];

  goalkeepers_all: any = [];
  goalkeepers_home: any = [];
  goalkeepers_away: any = [];

  @Input() period: number;
  @Input() minute: number;
  @Input() second: number;
  @Input() casomira: number;
  @Input() editData: any;
  @Input() reversed_sides: boolean = false;

  @Input() activeFormation: any = [];
  @Output() reloadVideo = new EventEmitter<any>();
  @Output() saveType = new EventEmitter<any>();

  player1: string = '';
  player2: string = '';
  player3: string = '';
  player4: string = '';
  player5: string = '';
  player6: string = '';
  player7: string = '';

  blockerId: string = '';

  player1_active: boolean = false;
  player2_active: boolean = false;
  player3_active: boolean = false;
  player4_active: boolean = false;
  player5_active: boolean = false;
  player6_active: boolean = false;
  player7_active: boolean = false;

  player1_name: string;
  player2_name: string;
  player3_name: string;
  player4_name: string;
  player5_name: string;
  player6_name: string;
  player7_name: string;

  player1_team: string;
  player4_team: string;

  matchId: number;

  lokace: string = '';
  lokace_active: boolean = false;
  lokace2: string = '';
  lokace_active2: boolean = false;
  lokace3: string = '';
  lokace_active3: boolean = false;

  result: string = '';

  oneTimer: boolean = false;
  forecheck: boolean = false;
  quickAttack: boolean = false;
  oddManRush: boolean = false;
  completeToSlot: boolean = false;
  nonCompleteToSlot: boolean = false;
  blockedToSlot: boolean = false;

  rebound: boolean = false;
  screeningPlayer: boolean = false;
  blocked: boolean = false;

  show_coordinates: boolean = false;

  loading: boolean = false;

  shotId: number;

  overtimeLength: number = 0;

  time: string = '';
  puck_type: string = '';
  puck_time2: string = '';
  puck_time3: string = '';

  passes_list: any = [];
  prihravka_na_strelu: boolean = undefined;

  puckWon_exist: boolean = false;
  pass_exist: boolean = false;

  puckWonId: number;
  passId: number;

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  contextmenu_attribute: string = '';
  showhelp: boolean = false;
  help_title: string = '';
  help_desc: string = '';
  active_supervize: string = 'shot';

  zoneExitId: number;
  goalieTouch: string = '';

  underPressure: boolean = false;
  participation: any = [];

  realDate_shot: string = '';
  realDate_puckWon: string = '';

  attacking_players: number = undefined;
  defending_players: number = undefined;
  show_tooltyp: boolean = false;

  save_type: string = '';
  goal = false;
  langData: any;

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  supervize: any = {
    playerId: false,
    timeOnIce: false,
    goalkeeperId: false,
    time: false,
    result: false,
    coordinates: false,
    rebound: false,
    screeningPlayer: false,
    oneTimer: false,
    blocked: false,
    quickAttack: false,
    forecheck: false,
    oddManRush: false,
    gateZone: false,
  };

  supervize_zisk: any = {
    time: false,
    playerId: false,
    gainSharePlayerId: false,
    puckLostPlayerId: false,
    coordinates: false,
    shotId: false,
    zoneExitId: false,
    dumpOutId: false,
    realDate: false,
    type: false,
    goalieTouch: false,
    underPressure: false,
    participation: false,
  };

  supervize_pass: any = {
    time: false,
    playerId: false,
    blockerId: false,
    shotId: false,
    coordinates: false,
    quickAttack: false,
    forecheck: false,
    oddManRush: false,
    completeToSlot: false,
    nonCompleteToSlot: false,
    blockedToSlot: false,
  };

  obranne_pasmo_strilejiciho_tymu: boolean = false;

  @ViewChild(MapComponent) mapComponent: MapComponent;

  constructor(
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private shotService: ShotService,
    private puckWonService: PuckWonService,
    private passService: PassService,
    private defaultService: DefaultService
  ) {
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.overtimeLength = Number(localStorage.getItem('overtimeLength'));
  }

  ngOnInit(): void {
    this.langData = (data as any).default;
    this.formatRosters();
    this.parseEditData(this.editData);
  }

  setAttackingPlayers() {}

  parseEditData(data: any) {
    console.log('Data', data);
    if (Object.keys(data).length != 0) {
      this.editPage = true;
      if (data.supervision != null) {
        this.supervize = data.supervision;
      }
      this.goal = data.result == 'goal';
      console.log('Goal', this.goal);
      this.time = this.getCasomira(data.time);
      if (this.time.length == 4) {
        this.time = '0' + this.time;
      }

      this.shotId = data.shotId;

      this.player1 = data.playerId;
      this.player2 = data.blockerId;
      this.player3 = data.goalkeeperId;

      //Sem napojit dáta o útočiacich hráčov
      if (data.attackersCount != null && data.defendersCount != null) {
        this.attacking_players = data.attackersCount;
        this.defending_players = data.defendersCount;
      }

      this.realDate_shot = data.realDate;

      setTimeout(() => {
        this.player1_name = this.getPlayerTemplate(Number(this.player1));
        this.player1_team = this.getPlayerTeam(Number(this.player1));

        this.player2_name = this.getPlayerTemplate(Number(this.player2));
        this.player3_name = this.getPlayerTemplate(Number(this.player3));
      }, 200);

      if (this.player1 === undefined) {
        this.player1 = '';
      }
      if (this.player2 === undefined) {
        this.player2 = '';
      }
      if (this.player3 === undefined) {
        this.player3 = '';
      }

      this.lokace = data.coordinates.x + ';' + data.coordinates.y;
      this.result = data.result;
      this.shot_active = data.attributes.gateZone;

      this.oneTimer = data.attributes.oneTimer;
      this.oddManRush = data.attributes.oddManRush;
      this.forecheck = data.attributes.forecheck;
      this.quickAttack = data.attributes.quickAttack;
      this.rebound = data.attributes.rebound;
      this.screeningPlayer = data.attributes.screeningPlayer;
      this.blocked = data.attributes.blocked;

      if (data.attributes.attackersCount != null) {
        this.attacking_players = data.attributes.attackersCount;
      }
      if (data.attributes.defendersCount != null) {
        this.defending_players = data.attributes.defendersCount;
      }

      this.puckWonService.getPuckWon(this.matchId).subscribe(
        (data: any) => {
          this.puckWon_list = data;

          /*
          if (data[0].supervision != null) {
            this.supervize_zisk = data[0].supervision;
          } else {
            if (data.supervision != null) {
              this.supervize_zisk = data.supervision;
            }
          }
          */

          this.puckWon_list.forEach((item, index) => {
            if (item.shotId == this.shotId) {
              this.puckWon_exist = true;
              this.puckWonId = item.puckWonId;
              this.zoneExitId = item.zoneExitId;
              this.goalieTouch = item.goalieTouch;
              this.underPressure = item.underPressure;
              this.participation = item.participation;
              this.realDate_puckWon = data.realDate;

              this.player4 = item.playerId;
              setTimeout(() => {
                this.player4_name = this.getPlayerTemplate(
                  Number(this.player4)
                );
                this.player4_team = this.getPlayerTeam(Number(this.player4));
              }, 200);
              if (this.player4 == undefined) {
                this.player4 = '';
              }

              this.puck_time2 = this.getCasomira(item.time);
              if (this.puck_time2.length == 4) {
                this.puck_time2 = '0' + this.puck_time2;
              }

              this.puck_type = item.type;
              this.lokace2 = item.coordinates.x + ';' + item.coordinates.y;

              this.player5 = item.gainSharePlayerId;
              setTimeout(() => {
                this.player5_name = this.getPlayerTemplate(
                  Number(this.player5)
                );
              }, 200);
              if (this.player5 == undefined) {
                this.player5 = '';
              }

              this.player6 = item.puckLostPlayerId;
              setTimeout(() => {
                this.player6_name = this.getPlayerTemplate(
                  Number(this.player6)
                );
              }, 200);
              if (this.player6 == undefined) {
                this.player6 = '';
              }
            }
          });
        },
        (error) => {
          this.puckWon_exist = false;
        }
      );

      this.passService.getPass(this.matchId).subscribe(
        (data: any) => {
          /*
          if (data[0].supervision != null) {
            this.supervize_pass = data[0].supervision;
          } else {
            if (data.supervision != null) {
              this.supervize_pass = data.supervision;
            }
          }
          */

          this.passes_list = data;
          this.passes_list.forEach((item, index) => {
            if (item.shotId == this.shotId) {
              this.pass_exist = true;
              this.prihravka_na_strelu = true;
              this.passId = item.passId;
              this.completeToSlot = item.completeToSlot;
              this.nonCompleteToSlot = item.nonCompleteToSlot;
              this.blockedToSlot = item.blockedToSlot;
              this.player7 = item.playerId;

              this.player7 = item.playerId;

              setTimeout(() => {
                this.player7_name = this.getPlayerTemplate(
                  Number(this.player7)
                );
              }, 200);
              if (this.player7 == undefined) {
                this.player7 = '';
              }

              this.puck_time3 = this.getCasomira(item.time);
              if (this.puck_time3.length == 4) {
                this.puck_time3 = '0' + this.puck_time3;
              }
              this.lokace3 = item.coordinates.x + ';' + item.coordinates.y;
            }
          });

          if (this.prihravka_na_strelu == undefined) {
            this.prihravka_na_strelu = false;
          }
        },
        (error) => {
          this.pass_exist = false;
          this.prihravka_na_strelu = false;
        }
      );
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
    if (this.player3_active) {
      this.player3 = id;
      this.player3_active = false;
    }
    if (this.player4_active) {
      this.player4 = id;
      this.player4_active = false;
    }
    if (this.player5_active) {
      this.player5 = id;
      this.player5_active = false;
    }
    if (this.player6_active) {
      this.player6 = id;
      this.player6_active = false;
    }
    if (this.player7_active) {
      this.player7 = id;
      this.player7_active = false;
    }

    (document.activeElement as HTMLElement).blur();
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

  setResult(result: string) {
    this.result = result;
    this.mapComponent.disableCeInit();

    if (result == 'saved') {
      this.player2 = '';
      this.player2_name = '';
    }

    if (result == 'missed') {
      this.shotChange('');
      this.mapComponent.toggle('');
      this.player2 = '';
      this.player2_name = '';

      this.player3 = '';
      this.player3_name = '';
    }

    if (result == 'goal') {
      this.player2 = '';
      this.player2_name = '';
      this.mapComponent.disableCe();
      this.shot_active = '';
    }

    if (result == 'deflected') {
      this.player3 = '';
      this.player3_name = '';

      this.shotChange('');
      this.mapComponent.toggle('');
    }
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
    } else if (this.period == 45) {
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

    this.roster_all.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_all.push(item);
      }
    });
    this.roster_home.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_home.push(item);
      }
    });
    this.roster_away.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_away.push(item);
      }
    });
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

  togglePuckType(type: string) {
    this.puck_type = type;

    if (type == 'no_battle') {
      this.player5 = '';
      this.player5_name = '';
      this.player6 = '';
      this.player6_name = '';
    }
  }

  prihravkaNaStreluToggle(val: boolean) {
    this.prihravka_na_strelu = val;

    if (val == false) {
      this.player7 = '';
      this.puck_time3 = '';
      this.lokace3 = '';
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

  close() {
    this.closeCanvas.emit();
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.shotId,
      type: 'shot',
    });
  }

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
  }

  shotChange(shot_type: any) {
    this.shot_active = shot_type;
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
    this.lokace_active2 = true;
  }

  uncheckXY2() {
    setTimeout(() => {
      let coordinates = [];
      coordinates = this.lokace2.split(';');

      let type = this.getPlayerTeam(Number(this.player1));

      if (type == 'home') {
        if (Number(coordinates[0]) <= -29) {
          this.obranne_pasmo_strilejiciho_tymu = true;
          if (this.puck_type == 'blocked') {
            this.puck_type = '';
          }
        } else {
          this.obranne_pasmo_strilejiciho_tymu = false;
        }
      } else if (type == 'away') {
        if (Number(coordinates[0]) >= 29) {
          this.obranne_pasmo_strilejiciho_tymu = true;
          if (this.puck_type == 'blocked') {
            this.puck_type = '';
          }
        } else {
          this.obranne_pasmo_strilejiciho_tymu = false;
        }
      }
    }, 200);

    setTimeout(() => {
      this.lokace_active2 = false;
    }, 500);
  }

  checkXY3() {
    this.lokace_active3 = true;
  }

  uncheckXY3() {
    setTimeout(() => {
      this.lokace_active3 = false;
    }, 500);
  }

  sendCoordinates(x: number, y: number) {
    if (this.lokace_active) {
      this.lokace = x + ';' + y;
      this.lokace_active = false;
    }
    if (this.lokace_active2) {
      this.lokace2 = x + ';' + y;
      this.lokace_active2 = false;
    }
    if (this.lokace_active3) {
      this.lokace3 = x + ';' + y;
      this.lokace_active3 = false;
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

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  focusPuckTime2() {
    this.puck_time2 =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  focusPuckTime3() {
    this.puck_time3 =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
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

  selectOpponentGoalie(opponentPlayerId: string) {
    let team = '';
    let goalies = [];
    this.roster_all.forEach((player) => {
      if (player.id == opponentPlayerId) {
        team = player.team;
      }
    });

    if (team == 'home') {
      let count = 0;
      this.roster_away.forEach((player) => {
        if (player.position == 'goalkeeper') {
          goalies.push(player.id);
        }
      });
    } else if (team == 'away') {
      let count = 0;
      this.roster_home.forEach((player) => {
        if (player.position == 'goalkeeper') {
          goalies.push(player.id);
        }
      });
    }

    let goalieId;
    if (this.activeFormation.includes(goalies[0])) {
      goalieId = goalies[0];
    }
    if (this.activeFormation.includes(goalies[1])) {
      goalieId = goalies[1];
    }

    if (goalieId === undefined) {
      goalieId = 10000000000;
    }

    if (this.result != 'missed' && this.result != 'deflected') {
      this.player3 = goalieId;
      this.player3_name = this.getPlayerTemplate(Number(goalieId));
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

  getOpponentGoalkeepers(player: string) {
    let type = this.getPlayerTeam(Number(player));

    let roster = [];

    if (type == 'home') {
      roster = this.goalkeepers_away;

      let found = false;
      roster.forEach((player) => {
        if (player.id == 0) {
          found = true;
        }
      });
      if (found == false) {
        roster.push({
          id: 10000000000,
          name: '',
          surname: 'Prázdná branka',
          jersey: null,
          position: 'goalkeeper',
          stick: '',
          lineUp: null,
          team_shortcut: '',
          team_id: null,
          lajna: null,
          team: '',
          search: 'Prázdná branka',
        });
      }

      return roster;
    } else if (type == 'away') {
      roster = this.goalkeepers_home;

      let found = false;
      roster.forEach((player) => {
        if (player.id == 0) {
          found = true;
        }
      });
      if (found == false) {
        roster.push({
          id: 10000000000,
          name: '',
          surname: 'Prázdná branka',
          jersey: null,
          position: 'goalkeeper',
          stick: '',
          lineUp: null,
          team_shortcut: '',
          team_id: null,
          lajna: null,
          team: '',
          search: 'Prázdná branka',
        });
      }

      return roster;
    } else {
      roster = this.goalkeepers_all;

      let found = false;
      roster.forEach((player) => {
        if (player.id == 0) {
          found = true;
        }
      });
      if (found == false) {
        roster.push({
          id: 0,
          name: '',
          surname: 'Prázdná branka',
          jersey: null,
          position: 'goalkeeper',
          stick: '',
          lineUp: null,
          team_shortcut: '',
          team_id: null,
          lajna: null,
          team: '',
          search: 'Prázdná branka',
        });
      }

      return roster;
    }
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

  changePlayer1() {
    setTimeout(() => {
      let coordinates = [];
      coordinates = this.lokace2.split(';');

      let type = this.getPlayerTeam(Number(this.player1));

      if (type == 'home') {
        if (Number(coordinates[0]) <= -29) {
          this.obranne_pasmo_strilejiciho_tymu = true;
          if (this.puck_type == 'blocked') {
            this.puck_type = '';
          }
        } else {
          this.obranne_pasmo_strilejiciho_tymu = false;
        }
      } else if (type == 'away') {
        if (Number(coordinates[0]) >= 29) {
          this.obranne_pasmo_strilejiciho_tymu = true;
          if (this.puck_type == 'blocked') {
            this.puck_type = '';
          }
        } else {
          this.obranne_pasmo_strilejiciho_tymu = false;
        }
      }
      this.player1Changed(this.player1);
    }, 200);
  }

  player1Changed(newVal) {
    this.player1_team = newVal.team;

    let player1_team = this.getPlayerTeamShortcut(Number(this.player1));
    let player2_team = this.getPlayerTeamShortcut(Number(this.player2));
    let player4_team = this.getPlayerTeamShortcut(Number(this.player4));
    let player5_team = this.getPlayerTeamShortcut(Number(this.player5));

    if (player1_team != '') {
      if (player1_team == player2_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Střílející hráč nemůže být ze stejného týmu jako blokující hráč.'
        );
        setTimeout(() => {
          this.player1 = '';
          this.player1_name = '';
          this.player1_team = '';
        }, 100);
      } else {
        this.selectOpponentGoalie(this.player1);
      }

      if (player1_team != '' && player4_team != '') {
        if (player1_team != player4_team) {
          this.sendToast(
            'error',
            'Chyba!',
            'Střílející hráč musí být z opačného týmu než hráč, který získal puk.'
          );
          setTimeout(() => {
            this.player1 = '';
            this.player1_name = '';
            this.player1_team = '';
          }, 100);
        }
      }
    }
  }

  player1ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player1 = '';
      this.player1_team = '';
    }
  }

  player2Changed(newVal) {
    this.player2 = newVal.id;

    let player2_team = this.getPlayerTeamShortcut(Number(this.player2));
    let player1_team = this.getPlayerTeamShortcut(Number(this.player1));

    if (player2_team != '') {
      if (player1_team == player2_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Blokující hráč nemůže být ze stejného týmu jako střílející hráč.'
        );
        setTimeout(() => {
          this.player2_name = '';
          this.player1_team = '';
        }, 100);
      }
    }
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

  player4Changed(newVal) {
    this.player4 = newVal.id;
    this.player4_team = newVal.team;

    let player4_team = this.getPlayerTeamShortcut(Number(this.player4));
    let player5_team = this.getPlayerTeamShortcut(Number(this.player5));

    if (player4_team != '' && player5_team != '') {
      if (player4_team != player5_team) {
        this.sendToast(
          'error',
          'Chyba!',
          'Hráč, který získal puk a hráč s podílem na zisku puku musí být ze stejného týmu.'
        );
        setTimeout(() => {
          this.player4 = '';
          this.player4_name = '';
          this.player4_team = '';
        }, 100);
      }
    }
  }

  player4ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player4 = '';
      this.player4_team = '';
    }
  }

  player5Changed(newVal) {
    this.player5 = newVal.id;
  }

  player5ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player5 = '';
    }
  }

  player6Changed(newVal) {
    this.player6 = newVal.id;
  }

  player6ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player6 = '';
    }
  }

  player7Changed(newVal) {
    this.player7 = newVal.id;
  }

  player7ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player7 = '';
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
      if (this.player4 == undefined) {
        this.player4_name = '';
      }
      if (this.player5 == undefined) {
        this.player5_name = '';
      }
      if (this.player6 == undefined) {
        this.player6_name = '';
      }
      if (this.player7 == undefined) {
        this.player7_name = '';
      }
    }, 100);
  }

  toggleOneTimer() {
    if (this.oneTimer) {
      this.oneTimer = false;
    } else {
      this.oneTimer = true;
    }
  }

  toggleQuickAttack() {
    if (this.quickAttack) {
      this.quickAttack = false;
    } else {
      this.quickAttack = true;
    }
  }

  toggleOddManRush() {
    if (this.oddManRush) {
      this.oddManRush = false;
      this.show_tooltyp = false;
    } else {
      this.oddManRush = true;
      this.show_tooltyp = true;
    }
  }

  toggleForecheck() {
    if (this.forecheck) {
      this.forecheck = false;
    } else {
      this.forecheck = true;
    }
  }

  stringy(data: any) {
    return JSON.stringify(data);
  }

  logError(data: any) {
    this.defaultService.error(data).subscribe((data: any) => {});
  }

  // Pokud je rozdíl mezi zadaným časem střely a časem
  // zisku puku na střelu vyšší než 31 a více vteřin,
  // tak se další pole Zisk puku na střelu zneaktivní a
  // je možno zápis uložit bez vyplnění podrobností zisku puku.
  checkTimeDiffs() {
    /*
    let ok = true;

    if (this.time == "") {
      ok = false;
    }
    let times = [];
    times = this.time.split(':');
    let time = (Number(times[0]) * 60) + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = ((time - 1200) * -1) + 1200;
    } else if (this.period == 3) {
      time = ((time - 2400) * -1) + 1200;
    } else if (this.period == 4) {
      time = ((time - 3600) * -1) + this.overtimeLength;
    }
    if (isNaN(time)) {
      ok = false;
    }

    if (this.puck_time2 == "") {
      ok = false;
    }
    let times2 = [];
    times2 = this.puck_time2.split(':');
    let time2 = (Number(times2[0]) * 60) + Number(times2[1]);
    if (this.period == 1) {
      time2 = (time2 - 1200) * -1;
    } else if (this.period == 2) {
      time2 = ((time2 - 1200) * -1) + 1200;
    } else if (this.period == 3) {
      time2 = ((time2 - 2400) * -1) + 1200;
    } else if (this.period == 4) {
      time2 = ((time2 - 3600) * -1) + 1200;
    }
    if (isNaN(time2)) {
      ok = false;
    }


    if (ok) {
      if ((time - time2) > 31) {
        this.player4 = "";
        this.lokace2 = "";
        this.puck_type = "";
        this.player5 = "";
        this.player6 = "";

        return true;
      } else {
        return false
      }
    } else {
      return false
    }
    */
    return false;
  }

  toggleMenu(event, contextmenu_attribute: string) {
    this.contextmenuX = event.pageX;
    this.contextmenuY = event.pageY;
    this.contextmenu_attribute = contextmenu_attribute;
    this.contextmenu = true;
    this.showhelp = false;
    this.active_supervize = 'shot';
  }

  toggleMenuZisk(event, contextmenu_attribute: string) {
    this.contextmenuX = event.pageX;
    this.contextmenuY = event.pageY;
    this.contextmenu_attribute = contextmenu_attribute;
    this.contextmenu = true;
    this.showhelp = false;
    this.active_supervize = 'zisk';
  }

  toggleMenuPass(event, contextmenu_attribute: string) {
    this.contextmenuX = event.pageX;
    this.contextmenuY = event.pageY;
    this.contextmenu_attribute = contextmenu_attribute;
    this.contextmenu = true;
    this.showhelp = false;
    this.active_supervize = 'pass';
  }

  changeGoalie(data: any) {
    if (data.id == 10000000000) {
      this.shotChange('');
      this.mapComponent.toggle('');
    }
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
    if (this.active_supervize == 'shot') {
      let attribute = this.contextmenu_attribute;
      if (this.supervize[attribute]) {
        this.supervize[attribute] = false;
      } else {
        this.supervize[attribute] = true;
      }
    } else if (this.active_supervize == 'zisk') {
      let attribute = this.contextmenu_attribute;
      if (this.supervize_zisk[attribute]) {
        this.supervize_zisk[attribute] = false;
      } else {
        this.supervize_zisk[attribute] = true;
      }
    } else if (this.active_supervize == 'pass') {
      let attribute = this.contextmenu_attribute;
      if (this.supervize_pass[attribute]) {
        this.supervize_pass[attribute] = false;
      } else {
        this.supervize_pass[attribute] = true;
      }
    }
  }

  updateSupervizeShot(shotId: number) {
    let data = this.supervize;
    this.shotService.updateSupervize(this.matchId, shotId, data).subscribe(
      (data: any) => {
        this.loading = false;
        this.close();
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  updateSupervizePuckWon(id: number) {
    /*
    let data = this.supervize_zisk;
    this.puckWonService.updateSupervize(this.matchId, id, data)
      .subscribe((data: any) => {
        //this.loading = false;
      }, (error) => {
        //this.loading = false;
      });
      */
  }

  updateSupervizePass(id: number) {
    /*
    let data = this.supervize_pass;
    this.passService.updateSupervize(this.matchId, id, data)
      .subscribe((data: any) => {
        //this.loading = false;
      }, (error) => {
        //this.loading = false;
      });
      */
  }

  submit(type: string) {
    if (this.invalidCasomira) {
      this.sendToast('error', this.langData.invalidCasomira, 'Chybná hodnota');
    } else {
      if (Object.keys(this.editData).length == 0) {
        if (this.validace()) {
          this.save_type = type;

          this.loading = true;
          this.createShot();
        }
      } else {
        if (this.validace()) {
          this.save_type = type;

          this.loading = true;
          this.updateShot();
        }
      }
    }
  }

  validace() {
    let ok = true;

    //detekce prazdneho viteze
    if (this.player1 == '' || this.player1 == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole střílející hráč nemůže být prázdné.'
      );
    }

    //detekce nevyplneného počtu hráčov z prečíslenia
    if (this.oddManRush) {
      if (
        this.defending_players == undefined ||
        this.attacking_players == undefined
      ) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'V přečíslení je nutné vybrat počet hráču.'
        );
      }
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

    //detekce prazdneho druhu strely
    if (this.result == '') {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Je nutné vybrat druh střely.');
    }

    //detekce logiky druhu střely
    if (this.result == 'saved') {
      if (
        String(this.player3) == null ||
        String(this.player3) == 'null' ||
        this.player3 == null
      ) {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Pole brankář nemůže být prázdné.');
      }

      if (this.shot_active == '') {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Je nutné vyplnit zónu branky.');
      }
    }

    if (this.result == 'goal') {
      if (
        String(this.player3) == null ||
        String(this.player3) == 'null' ||
        this.player3 == null
      ) {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Pole brankář nemůže být prázdné.');
      }

      if (this.shot_active == '' && this.player3 != '10000000000') {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Je nutné vyplnit zónu branky.');
      }
    }

    if (this.result == 'deflected') {
      /*
      if (this.player2 == "" || this.player2 == undefined) {
        ok = false;
        this.sendToast("error", "Chyba!", "Pole blokující hráč nemůže být prázdné.");
      }
      */
    }

    let coordinates = [];
    coordinates = this.lokace.split(';');
    let type = this.getPlayerTeam(Number(this.player1));
    let strela_z_obranneho_pasma = false;

    if (type == 'home') {
      if (Number(coordinates[0]) <= -29) {
        strela_z_obranneho_pasma = true;
      } else {
        strela_z_obranneho_pasma = false;
      }
    } else if (type == 'away') {
      if (Number(coordinates[0]) >= 29) {
        strela_z_obranneho_pasma = true;
      } else {
        strela_z_obranneho_pasma = false;
      }
    }

    if (strela_z_obranneho_pasma) {
      if (
        confirm(
          'Opravdu byla střela vyslána z obranné poloviny týmu, jehož hráč střelu vyslal?'
        )
      ) {
      } else {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Pokud střela nebyla vyslána z obranné poloviny týmu, prosím opravte lokaci střely.'
        );
      }
    }

    if (this.checkTimeDiffs()) {
      if (
        confirm(
          'Rozdíl mezi časem zisku puku na střelu a časem střely je 31 vteřin a více?'
        )
      ) {
      } else {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Opravte údaje o času zisku puku.');
      }
    }

    if (
      (this.player4 != '' && this.player4 != undefined) ||
      this.puck_time2 != '' ||
      this.lokace2 != ''
    ) {
      //detekce prazdne casomiry
      if (this.puck_time2 == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Čas časomíry u zisku puku nemůže být prázdný.'
        );
      }

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
      //detekce nesmyslneho casu
      let times2 = [];
      times2 = this.puck_time2.split(':');
      let time2 = Number(times2[0]) * 60 + Number(times2[1]);
      if (this.period == 1) {
        time2 = (time2 - 1200) * -1;
      } else if (this.period == 2) {
        time2 = (time2 - 1200) * -1 + 1200;
      } else if (this.period == 3) {
        time2 = (time2 - 2400) * -1 + 1200;
      } else if (this.period == 4) {
        time2 = (time2 - 3600) * -1 + 1200;
      } else if (this.period == 5) {
        time2 = (time2 - 4800) * -1 + 1200;
      } else if (this.period == 6) {
        time2 = (time2 - 6000) * -1 + 1200;
      }
      if (isNaN(time2)) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Časomíra u zisku puku musí být ve správném formátu. (MM:SS)'
        );
      }
      if (time2 < 0) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Časomíra je zadaná chybně. Musí být v rozmezí od 20:00 do 00:00'
        );
      }

      if (time - time2 > 30) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Rozdíl mezi časem zisku střely a časem střely nesmí být výšší než 30 vteřin.'
        );
      }

      //detekce prazdne lokace
      if (this.lokace2 == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace u zisku puku nemůže být prázdná.'
        );
      }

      //detekce nesmyslne lokace
      let lokace = [];
      lokace = this.lokace2.split(';');
      if (lokace[0] == undefined || lokace[1] == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace u zisku puku není vyplněna správně.'
        );
      }

      if (this.player4 == '' || this.player4 == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Hráč, který získal puk nemůže být prázdné.'
        );
      }

      //detekce druhu zisku puku
      if (this.puck_type == '') {
        ok = false;
        this.sendToast('error', 'Chyba!', 'Je nutné vyplnit druh zisku puku.');
      }
    }

    if (this.prihravka_na_strelu == true) {
      if (this.player7 == '' || this.player7 == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Pole přihrávající hráč nemůže být prázdné.'
        );
      }

      //detekce prazdne casomiry
      if (this.puck_time3 == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Čas časomíry u přihrávky nemůže být prázdný.'
        );
      }

      //detekce nesmyslneho casu
      let times = [];
      times = this.puck_time3.split(':');
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
      } else if (this.period == 6) {
        time = (time - 6000) * -1 + this.overtimeLength;
      }
      if (isNaN(time)) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Časomíra u přihrávky musí být ve správném formátu. (MM:SS)'
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
      if (this.lokace3 == '') {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace u přihrávky nemůže být prázdná.'
        );
      }

      //detekce nesmyslne lokace
      let lokace = [];
      lokace = this.lokace3.split(';');
      if (lokace[0] == undefined || lokace[1] == undefined) {
        ok = false;
        this.sendToast(
          'error',
          'Chyba!',
          'Lokace u přihrávky není vyplněna správně.'
        );
      }
    }

    if (this.player3 == '10000000000' && this.result != 'goal') {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Střela na branku bez brankáře může být jedině gól.'
      );
    }

    if (this.result == 'deflected' && this.player4 == '') {
      this.sendToast(
        'info',
        'Info',
        'Právě uložená zblokovaná střela nemá vyplněného protihráče ztrácejícího držení puku. Pokud došlo k zisku puku mimo obranné pásmo, je nutné informace doplnit.'
      );
    }

    if (
      this.result == 'saved' &&
      (this.player3 == '' || this.player3 == '10000000000')
    ) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Chycená střela musí mít vybraného brankáře z týmu soupeře střelce.'
      );
    }

    if (this.result != 'deflected' && this.result != 'missed') {
      if (
        !this.activeFormation.includes(this.player3) &&
        this.player3 != '' &&
        this.player3 != '10000000000'
      ) {
        if (
          confirm(
            'Byl vybrán brankář, který v zadaném čase není na ledě. Chcete skutečně jeho výběr potvrdit?'
          )
        ) {
        } else {
          this.sendToast('error', 'Chyba!', 'Vyberte správného brankáře.');
          ok = false;
        }
      }
    }

    return ok;
  }

  createShot() {
    let times = [];
    let attackersCount = null;
    let defendersCount = null;

    if (this.oddManRush) {
      attackersCount = this.attacking_players;
      defendersCount = this.defending_players;
    }

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

    let player3 = String(this.player3);
    if (player3 == '') {
      player3 = null;
    }
    if (this.player3 == '10000000000') {
      player3 = null;
    }
    if (player3 == 'null') {
      player3 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let forecheck = this.forecheck;
    if (forecheck == null) {
      forecheck = false;
    }

    let gateZone = this.shot_active;
    if (gateZone == '') {
      gateZone = null;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      playerId: player1,
      blockerId: player2,
      goalkeeperId: player3,
      result: this.result,
      realDate: new Date(),
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      attributes: {
        rebound: this.rebound,
        screeningPlayer: this.screeningPlayer,
        oneTimer: this.oneTimer,
        blocked: this.blocked,
        quickAttack: this.quickAttack,
        forecheck: forecheck,
        oddManRush: this.oddManRush,
        gateZone: gateZone,
        attackersCount: attackersCount,
        defendersCount: defendersCount,
      },
      app: app,
    };

    if (this.player4 == '' || this.puck_time2 == '' || this.lokace2 == '') {
      this.shotService.createShot(this.matchId, data).subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);
          this.updateSupervizeShot(data.id);
          this.close();
          this.loading = false;

          let id_shot = data.id;

          if (this.prihravka_na_strelu) {
            let puck_times3 = [];
            puck_times3 = this.puck_time3.split(':');
            let puck_time3 =
              Number(puck_times3[0]) * 60 + Number(puck_times3[1]);
            if (this.period == 1) {
              puck_time3 = (puck_time3 - 1200) * -1;
            } else if (this.period == 2) {
              puck_time3 = (puck_time3 - 1200) * -1 + 1200;
            } else if (this.period == 3) {
              puck_time3 = (puck_time3 - 2400) * -1 + 1200;
            } else if (this.period == 4) {
              puck_time3 = (puck_time3 - 3600) * -1 + this.overtimeLength;
            } else if (this.period == 5) {
              puck_time3 = (puck_time3 - 4800) * -1 + this.overtimeLength;
            } else if (this.period === 6) {
              puck_time3 = (puck_time3 - 6000) * -1 + this.overtimeLength ;
            }

            let lokace3 = [];
            lokace3 = this.lokace3.split(';');

            if (this.blockerId == '') {
              this.blockerId = null;
            }

            let app = 'tracking';
            if (this.page_type === 'supervize') {
              app = 'supervision';
            }

            let pass = {
              playerId: this.player7,
              blockerId: this.blockerId,
              shotId: id_shot,
              quickAttack: this.quickAttack,
              forecheck: this.forecheck,
              oddManRush: this.oddManRush,
              completeToSlot: this.completeToSlot,
              nonCompleteToSlot: this.nonCompleteToSlot,
              blockedToSlot: this.blockedToSlot,
              coordinates: {
                x: lokace3[0],
                y: lokace3[1],
              },
              time: puck_time3,
              app: app,
            };

            this.passService.createPass(this.matchId, pass).subscribe(
              (data: any) => {
                this.updateSupervizePass(data.id);

                this.close();
                this.sendToast(
                  'success',
                  'Výborně!',
                  'Přihrávka byla vytvořena.'
                );
                this.loading = false;
              },
              (error) => {
                this.logError({
                  error: JSON.stringify(error),
                  match: this.matchId,
                  data: JSON.stringify(pass),
                });

                console.log(JSON.stringify(error));
                this.loading = false;
                this.sendToast(
                  'error',
                  'Chyba!',
                  'Během přidávání přihrávky došlo k chybě. Zkuste to znovu.'
                );
              }
            );
          } else {
            this.close();
            this.sendToast(
              'success',
              'Výborně!',
              'Vybraná událost byla vytvořena.'
            );
            this.loading = false;
          }
        },
        (error) => {
          this.logError({
            error: JSON.stringify(error),
            match: this.matchId,
            data: JSON.stringify(data),
          });
          this.loading = false;
          this.sendToast(
            'error',
            'Chyba!',
            'Během přidávání střely došlo k chybě. Zkuste to znovu.'
          );
        }
      );
    } else {
      this.shotService.createShot(this.matchId, data).subscribe(
        (data: any) => {
          this.sendCasomiraAfterEventEdit(this.time);
          let id_shot = data.id;
          this.updateSupervizeShot(data.id);

          let puck_times2 = [];
          puck_times2 = this.puck_time2.split(':');
          let puck_time2 = Number(puck_times2[0]) * 60 + Number(puck_times2[1]);
          if (this.period == 1) {
            puck_time2 = (puck_time2 - 1200) * -1;
          } else if (this.period == 2) {
            puck_time2 = (puck_time2 - 1200) * -1 + 1200;
          } else if (this.period == 3) {
            puck_time2 = (puck_time2 - 2400) * -1 + 1200;
          } else if (this.period == 4) {
            puck_time2 = (puck_time2 - 3600) * -1 + this.overtimeLength;
          } else if (this.period == 5) {
            puck_time2 = (puck_time2 - 4800) * -1 + this.overtimeLength;
          } else if (this.period == 6) {
            puck_time2 = (puck_time2 - 6000) * -1 + this.overtimeLength;
          }

          let lokace2 = [];
          lokace2 = this.lokace2.split(';');

          let player4 = String(this.player4);
          if (player4 == '') {
            player4 = null;
          }
          if (player4 == 'null') {
            player4 = null;
          }

          let player5 = String(this.player5);
          if (player5 == '') {
            player5 = null;
          }
          if (player5 == 'null') {
            player5 = null;
          }

          let player6 = String(this.player6);
          if (player6 == '') {
            player6 = null;
          }
          if (player6 == 'null') {
            player6 = null;
          }

          if (this.goalieTouch == '') {
            this.goalieTouch = 'none';
          }

          let app = 'tracking';
          if (this.page_type === 'supervize') {
            app = 'supervision';
          }

          let puckWon = {
            time: puck_time2,
            playerId: player4,
            gainSharePlayerId: player5,
            puckLostPlayerId: player6,
            shotId: id_shot,
            zoneExitId: this.zoneExitId,
            coordinates: {
              x: lokace2[0],
              y: lokace2[1],
            },
            type: this.puck_type,
            goalieTouch: this.goalieTouch,
            underPressure: this.underPressure,
            realDate: new Date(),
            participation: this.participation,
            app: app,
          };

          this.puckWonService.createPuckWon(this.matchId, puckWon).subscribe(
            (data: any) => {
              if (this.prihravka_na_strelu) {
                let puck_times3 = [];
                puck_times3 = this.puck_time3.split(':');
                let puck_time3 =
                  Number(puck_times3[0]) * 60 + Number(puck_times3[1]);
                if (this.period == 1) {
                  puck_time3 = (puck_time3 - 1200) * -1;
                } else if (this.period == 2) {
                  puck_time3 = (puck_time3 - 1200) * -1 + 1200;
                } else if (this.period == 3) {
                  puck_time3 = (puck_time3 - 2400) * -1 + 1200;
                } else if (this.period == 4) {
                  puck_time3 = (puck_time3 - 3600) * -1 + this.overtimeLength;
                } else if (this.period == 5) {
                  puck_time3 = (puck_time3 - 4800) * -1 + this.overtimeLength;
                } else if (this.period === 6) {
                  puck_time3 = (puck_time3 - 6000) * -1 + this.overtimeLength;
                }

                let lokace3 = [];
                lokace3 = this.lokace3.split(';');

                if (this.blockerId == '') {
                  this.blockerId = null;
                }

                let app = 'tracking';
                if (this.page_type === 'supervize') {
                  app = 'supervision';
                }

                let pass = {
                  playerId: this.player7,
                  blockerId: this.blockerId,
                  shotId: id_shot,
                  quickAttack: this.quickAttack,
                  forecheck: this.forecheck,
                  oddManRush: this.oddManRush,
                  completeToSlot: this.completeToSlot,
                  nonCompleteToSlot: this.nonCompleteToSlot,
                  blockedToSlot: this.blockedToSlot,
                  coordinates: {
                    x: lokace3[0],
                    y: lokace3[1],
                  },
                  time: puck_time3,
                  app: app,
                };

                this.updateSupervizePuckWon(data.id);

                this.passService.createPass(this.matchId, pass).subscribe(
                  (data: any) => {
                    this.updateSupervizePass(data.id);

                    this.close();
                    this.sendToast(
                      'success',
                      'Výborně!',
                      'Vybraná událost byla vytvořena.'
                    );
                    this.loading = false;
                  },
                  (error) => {
                    this.logError({
                      error: JSON.stringify(error),
                      match: this.matchId,
                      data: JSON.stringify(pass),
                    });

                    this.loading = false;
                    this.sendToast(
                      'error',
                      'Chyba!',
                      'Během přidávání přihrávky došlo k chybě. Zkuste to znovu.'
                    );
                  }
                );
              } else {
                this.close();
                this.sendToast(
                  'success',
                  'Výborně!',
                  'Vybraná událost byla vytvořena.'
                );
                this.loading = false;
              }
            },
            (error) => {
              this.logError({
                error: JSON.stringify(error),
                match: this.matchId,
                data: JSON.stringify(puckWon),
              });

              console.log(JSON.stringify(error));
              this.loading = false;
              this.sendToast(
                'error',
                'Chyba!',
                'Během přidávání zisku puku došlo k chybě. Zkuste to znovu.'
              );
            }
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
            'Během přidávání střely došlo k chybě. Zkuste to znovu.'
          );
        }
      );
    }
  }

  updateShot() {
    let times = [];
    let attackersCount = null;
    let defendersCount = null;

    if (this.oddManRush) {
      attackersCount = this.attacking_players;
      defendersCount = this.defending_players;
    }
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
    if (player2 == '' || player2 == 'null') {
      player2 = null;
    }

    let player3 = String(this.player3);
    if (player3 == '' || player3 == 'null') {
      player3 = null;
    }
    if (this.player3 == '10000000000') {
      player3 = null;
    }
    if (player3 == 'null') {
      player3 = null;
    }

    let lokace = [];
    lokace = this.lokace.split(';');

    let forecheck = this.forecheck;
    if (forecheck == null) {
      forecheck = false;
    }

    let gateZone = this.shot_active;
    if (gateZone == '') {
      gateZone = null;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let data = {
      time: time,
      playerId: player1,
      blockerId: player2,
      goalkeeperId: player3,
      result: this.result,
      realDate: this.realDate_shot,
      coordinates: {
        x: lokace[0],
        y: lokace[1],
      },
      attributes: {
        rebound: this.rebound,
        screeningPlayer: this.screeningPlayer,
        oneTimer: this.oneTimer,
        blocked: this.blocked,
        quickAttack: this.quickAttack,
        forecheck: forecheck,
        oddManRush: this.oddManRush,
        gateZone: gateZone,
        attackersCount: attackersCount,
        defendersCount: defendersCount,
      },
      app: app,
    };

    this.shotService.updateShot(this.matchId, this.shotId, data).subscribe(
      (data: any) => {
        this.updateSupervizeShot(this.shotId);
        this.saveAndNext();

        //alert(this.puckWon_exist);

        //vyhra puku existuje upravim ji
        if (this.puckWon_exist) {
          let puck_times2 = [];
          puck_times2 = this.puck_time2.split(':');
          let puck_time2 = Number(puck_times2[0]) * 60 + Number(puck_times2[1]);
          if (this.period == 1) {
            puck_time2 = (puck_time2 - 1200) * -1;
          } else if (this.period == 2) {
            puck_time2 = (puck_time2 - 1200) * -1 + 1200;
          } else if (this.period == 3) {
            puck_time2 = (puck_time2 - 2400) * -1 + 1200;
          } else if (this.period == 4) {
            puck_time2 = (puck_time2 - 3600) * -1 + this.overtimeLength;
          } else if (this.period == 5) {
            puck_time2 = (puck_time2 - 4800) * -1 + this.overtimeLength;
          } else if (this.period === 6) {
            puck_time2 = (puck_time2 - 6000) * -1 + this.overtimeLength;
          }

          let lokace2 = [];
          lokace2 = this.lokace2.split(';');

          let player4 = String(this.player4);
          if (player4 == '') {
            player4 = null;
          }
          if (player4 == 'null') {
            player4 = null;
          }

          let player5 = String(this.player5);
          if (player5 == '') {
            player5 = null;
          }
          if (player5 == 'null') {
            player5 = null;
          }

          let player6 = String(this.player6);
          if (player6 == '') {
            player6 = null;
          }
          if (player6 == 'null') {
            player6 = null;
          }

          if (this.goalieTouch == '') {
            this.goalieTouch = 'none';
          }

          let app = 'tracking';
          if (this.page_type === 'supervize') {
            app = 'supervision';
          }

          let puckWon = {
            time: puck_time2,
            playerId: player4,
            gainSharePlayerId: player5,
            puckLostPlayerId: player6,
            shotId: this.shotId,
            zoneExitId: this.zoneExitId,
            coordinates: {
              x: lokace2[0],
              y: lokace2[1],
            },
            type: this.puck_type,
            goalieTouch: this.goalieTouch,
            underPressure: this.underPressure,
            realDate: this.realDate_puckWon,
            participation: this.participation,
            app: app,
          };

          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );

          if (
            this.player4 == '' ||
            this.puck_time2 == '' ||
            this.lokace2 == ''
          ) {
            this.puckWonService
              .removePuckWon(this.matchId, this.puckWonId)
              .subscribe(
                (data: any) => {
                  this.close();
                  this.sendToast(
                    'success',
                    'Výborně!',
                    'Zisk puku byl smazán.'
                  );
                },
                (error) => {
                  this.logError({
                    error: JSON.stringify(error),
                    match: this.matchId,
                    data: 'remove puckwon error',
                  });

                  console.log(JSON.stringify(error));
                  this.loading = false;
                  this.sendToast(
                    'error',
                    'Chyba!',
                    'Během mazání zisku puku došlo k chybě. Zkuste to znovu.'
                  );
                }
              );
          } else {
            this.puckWonService
              .updatePuckWon(this.matchId, this.puckWonId, puckWon)
              .subscribe(
                (data: any) => {
                  this.updateSupervizePuckWon(this.puckWonId);

                  this.close();
                  this.sendToast(
                    'success',
                    'Výborně!',
                    'Zisk puku byl upraven.'
                  );
                },
                (error) => {
                  this.logError({
                    error: JSON.stringify(error),
                    match: this.matchId,
                    data: JSON.stringify(puckWon),
                  });

                  console.log(JSON.stringify(error));
                  this.loading = false;
                  this.sendToast(
                    'error',
                    'Chyba!',
                    'Během úpravy zisku puku došlo k chybě. Zkuste to znovu.'
                  );
                }
              );
          }
        } else {
          //vyhra puku neexituje vytvorim ji
          let puck_times2 = [];
          puck_times2 = this.puck_time2.split(':');
          let puck_time2 = Number(puck_times2[0]) * 60 + Number(puck_times2[1]);
          if (this.period == 1) {
            puck_time2 = (puck_time2 - 1200) * -1;
          } else if (this.period == 2) {
            puck_time2 = (puck_time2 - 1200) * -1 + 1200;
          } else if (this.period == 3) {
            puck_time2 = (puck_time2 - 2400) * -1 + 1200;
          } else if (this.period == 4) {
            puck_time2 = (puck_time2 - 3600) * -1 + this.overtimeLength;
          } else if (this.period == 5) {
            puck_time2 = (puck_time2 - 4800) * -1 + this.overtimeLength;
          } else if (this.period === 6) {
            puck_time2 = (puck_time2 - 6000) * -1 + this.overtimeLength;
          }

          let lokace2 = [];
          lokace2 = this.lokace2.split(';');

          let player4 = String(this.player4);
          if (player4 == '') {
            player4 = null;
          }
          if (player4 == 'null') {
            player4 = null;
          }

          let player5 = String(this.player5);
          if (player5 == '') {
            player5 = null;
          }
          if (player5 == 'null') {
            player5 = null;
          }

          let player6 = String(this.player6);
          if (player6 == '') {
            player6 = null;
          }
          if (player6 == 'null') {
            player6 = null;
          }

          if (this.goalieTouch == '') {
            this.goalieTouch = 'none';
          }

          let app = 'tracking';
          if (this.page_type === 'supervize') {
            app = 'supervision';
          }

          let puckWon = {
            time: puck_time2,
            playerId: player4,
            gainSharePlayerId: player5,
            puckLostPlayerId: player6,
            shotId: this.shotId,
            zoneExitId: this.zoneExitId,
            coordinates: {
              x: lokace2[0],
              y: lokace2[1],
            },
            type: this.puck_type,
            goalieTouch: this.goalieTouch,
            underPressure: this.underPressure,
            realDate: new Date(),
            participation: this.participation,
            app: app,
          };

          this.puckWonService.createPuckWon(this.matchId, puckWon).subscribe(
            (data: any) => {
              this.updateSupervizePuckWon(data.id);

              //this.close();
              this.sendToast('success', 'Výborně!', 'Zisk puku byl vytvořen.');
            },
            (error) => {
              this.logError({
                error: JSON.stringify(error),
                match: this.matchId,
                data: JSON.stringify(puckWon),
              });

              console.log(JSON.stringify(error));
              this.loading = false;
              //this.sendToast("error", "Chyba!", "Během přidávání zisku puku došlo k chybě. Zkuste to znovu.");
            }
          );
        }

        if (this.prihravka_na_strelu) {
          //prihravka existuje upravim ji
          if (this.pass_exist) {
            let puck_times3 = [];
            puck_times3 = this.puck_time3.split(':');
            let puck_time3 =
              Number(puck_times3[0]) * 60 + Number(puck_times3[1]);
            if (this.period == 1) {
              puck_time3 = (puck_time3 - 1200) * -1;
            } else if (this.period == 2) {
              puck_time3 = (puck_time3 - 1200) * -1 + 1200;
            } else if (this.period == 3) {
              puck_time3 = (puck_time3 - 2400) * -1 + 1200;
            } else if (this.period == 4) {
              puck_time3 = (puck_time3 - 3600) * -1 + this.overtimeLength;
            } else if (this.period == 5) {
              puck_time3 = (puck_time3 - 4800) * -1 + this.overtimeLength;
            } else if (this.period === 6) {
              puck_time3 = (puck_time3 - 6000) * -1 + this.overtimeLength;
            }

            let lokace3 = [];
            lokace3 = this.lokace3.split(';');

            if (this.blockerId == '') {
              this.blockerId = null;
            }

            let app = 'tracking';
            if (this.page_type === 'supervize') {
              app = 'supervision';
            }

            let pass = {
              playerId: this.player7,
              blockerId: this.blockerId,
              shotId: this.shotId,
              quickAttack: this.quickAttack,
              forecheck: this.forecheck,
              oddManRush: this.oddManRush,
              completeToSlot: this.completeToSlot,
              nonCompleteToSlot: this.nonCompleteToSlot,
              blockedToSlot: this.blockedToSlot,
              coordinates: {
                x: lokace3[0],
                y: lokace3[1],
              },
              time: puck_time3,
              app: app,
            };

            this.passService
              .updatePass(this.matchId, this.passId, pass)
              .subscribe(
                (data: any) => {
                  this.updateSupervizePass(this.passId);

                  this.close();
                  this.sendToast(
                    'success',
                    'Výborně!',
                    'Přihrávka byla upravena.'
                  );
                  this.loading = false;
                },
                (error) => {
                  this.logError({
                    error: JSON.stringify(error),
                    match: this.matchId,
                    data: JSON.stringify(pass),
                  });

                  console.log(JSON.stringify(error));
                  this.loading = false;
                  this.sendToast(
                    'error',
                    'Chyba!',
                    'Během úpravy přihrávky došlo k chybě. Zkuste to znovu.'
                  );
                }
              );
          } else {
            let puck_times3 = [];
            puck_times3 = this.puck_time3.split(':');
            let puck_time3 =
              Number(puck_times3[0]) * 60 + Number(puck_times3[1]);
            if (this.period == 1) {
              puck_time3 = (puck_time3 - 1200) * -1;
            } else if (this.period == 2) {
              puck_time3 = (puck_time3 - 1200) * -1 + 1200;
            } else if (this.period == 3) {
              puck_time3 = (puck_time3 - 2400) * -1 + 1200;
            } else if (this.period == 4) {
              puck_time3 = (puck_time3 - 3600) * -1 + this.overtimeLength;
            } else if (this.period == 5) {
              puck_time3 = (puck_time3 - 4800) * -1 + this.overtimeLength;
            } else if (this.period === 6) {
              puck_time3 = (puck_time3 - 6000) * -1 + this.overtimeLength;
            }

            let lokace3 = [];
            lokace3 = this.lokace3.split(';');

            if (this.blockerId == '') {
              this.blockerId = null;
            }

            let app = 'tracking';
            if (this.page_type === 'supervize') {
              app = 'supervision';
            }

            let pass = {
              playerId: this.player7,
              blockerId: this.blockerId,
              shotId: this.shotId,
              quickAttack: this.quickAttack,
              forecheck: this.forecheck,
              oddManRush: this.oddManRush,
              completeToSlot: this.completeToSlot,
              nonCompleteToSlot: this.nonCompleteToSlot,
              blockedToSlot: this.blockedToSlot,
              coordinates: {
                x: lokace3[0],
                y: lokace3[1],
              },
              time: puck_time3,
              app: app,
            };

            this.passService.createPass(this.matchId, pass).subscribe(
              (data: any) => {
                this.updateSupervizePass(data.id);

                this.close();
                this.sendToast(
                  'success',
                  'Výborně!',
                  'Přihrávka byla vytvořena.'
                );
                this.loading = false;
              },
              (error) => {
                this.logError({
                  error: JSON.stringify(error),
                  match: this.matchId,
                  data: JSON.stringify(pass),
                });

                console.log(JSON.stringify(error));
                this.loading = false;
                this.sendToast(
                  'error',
                  'Chyba!',
                  'Během přidávání přihrávky došlo k chybě. Zkuste to znovu.'
                );
              }
            );
          }
        } else {
          if (this.pass_exist) {
            this.passService.removePass(this.matchId, this.passId).subscribe(
              (data: any) => {
                this.close();
                this.sendToast(
                  'success',
                  'Výborně!',
                  'Přihrávka na střelu byla smazána'
                );
              },
              (error) => {
                this.logError({
                  error: JSON.stringify(error),
                  match: this.matchId,
                  data: 'remove pass error',
                });

                console.log(JSON.stringify(error));
                this.loading = false;
                this.sendToast(
                  'error',
                  'Chyba!',
                  'Během mazání přihrávky na střelu došlo k chybě. Zkuste to znovu.'
                );
              }
            );
          } else {
            this.close();
          }
        }
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
          'Během úpravy střely došlo k chybě. Zkuste to znovu.'
        );
      }
    );
  }
}
