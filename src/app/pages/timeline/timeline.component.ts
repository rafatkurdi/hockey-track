import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { DefaultService } from '../../services/default.service';
import { TimelineService } from '../../services/timeline.service';
import { ShiftService } from '../../services/shift.service';
import * as data from '../../../lang.json';
import { EventType } from '../../enums/match-type.enum';
import { EventFlowService } from '../../services/eventflow.service';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';
import { stringify } from 'querystring';
declare var $: any;

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  providers: [DefaultService, TimelineService, ShiftService, EventFlowService],
})
export class TimelineComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private defaultService: DefaultService,
    private timelineService: TimelineService,
    private shiftService: ShiftService,
    private eventFlowService: EventFlowService
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }
  @ViewChild('scrollView') private scrollView: ElementRef;

  id: number;

  width: number = 300;
  left: number = 20;
  public style: object = {};

  show_edit_dialog: boolean = false;
  show_addshift_dialog: boolean = false;
  dialog_x: number;
  dialog_y: number;
  edit_player: boolean = false;
  edit_event: boolean = false;
  new_shift: boolean = false;
  from: string = '';
  to: string = '';
  selected_slot: number;

  disabledWatch: boolean = false;

  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string = '';
  awayTeamName: string = '';
  selected_team: string = 'home';
  gameState: any = [];
  shots: any = [];
  faceOffs: any = [];
  blocks = [];
  hits = [];

  matchData: any = [];

  gameLength: number = 0;

  slots: any = [];

  roster_home: any = [];
  roster_away: any = [];

  loading: boolean = false;

  homeShifts: any = [];
  awayShifts: any = [];

  selected_player: string = '';
  selected_shift: any = [];

  slots_list: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  active_camera: number = 1;

  problem_seconds: any = [];
  faceOff_seconds: any = [];
  shots_seconds: any = [];

  raw_move_time_from = '00:00';
  raw_move_time_to = '00:00';
  move_time_from = 0;
  move_time_to = 0;
  timeline = [];
  autosave = true;
  to_update = [];
  select_mode = false;
  select_from = 0;
  select_to = 0;
  selected_shifts = [];
  show_selected = false;

  selected_problem: number = 0;

  clicked_shift: number = null;
  langData: any;
  eventFlowData: any = [];
  eventTimeLineData: any = [];
  EXCLAMATION_MARK = '\u{0021}';

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.disabledWatch = true;
    this.defaultService.removeWatch(this.id).subscribe(
      (data: any) => {
        this.toastr.success(
          'Sběr dat byl ukončen a zápas uzamčen.',
          'Výborně!',
          {
            progressBar: true,
          }
        );
      },
      (error) => {
        this.toastr.error('Během zamykání zápasu došlo k chybě.', 'Chyba!', {
          progressBar: true,
        });
      }
    );

    return false;
    // I have used return false but you can your other functions or any query or condition
  }

  ngOnInit(): void {
    this.langData = (data as any).default;
    this.loadData();
  }

  switchAutosave(save: boolean) {
    if (!save) {
      this.to_update = [];
    }
    this.autosave = save;
  }

  formatTimeFrom(time) {
    let times = [];
    times = time.split(':');
    let formated_time = Number(times[0]) * 60 + Number(times[1]);
    this.select_from = formated_time;
  }
  formatTimeTo(time) {
    let times = [];
    times = time.split(':');
    let formated_time = Number(times[0]) * 60 + Number(times[1]);
    this.select_to = formated_time;
  }

  moveAllShifts() {
    let filtered_data = [];
    let id = [];
    this.timeline.forEach((shift) => {
      shift.slots.forEach((item) => {
        let raw_data = {};
        if (item.length != 0) {
          if (id.length != 0 && !id.includes(item[0].shift.id)) {
            id.push(item[0].shift.id);
            raw_data['time'] = {};
            raw_data['playerId'] = item[0].playerId;
            raw_data['shiftId'] = item[0].shift.id;
            raw_data['time']['start'] =
              item[0].shift.start + this.move_time_from;
            if (raw_data['time']['start'] < 0) {
              raw_data['time']['start'] = 0;
            }
            raw_data['time']['end'] = item[0].shift.end + this.move_time_to;
            filtered_data.push(raw_data);
          } else if (id.length == 0) {
            id.push(item[0].shift.id);
            raw_data['time'] = {};
            raw_data['playerId'] = item[0].playerId;
            raw_data['shiftId'] = item[0].shift.id;
            raw_data['time']['start'] =
              item[0].shift.start + this.move_time_from;
            if (raw_data['time']['start'] < 0) {
              raw_data['time']['start'] = 0;
            }
            raw_data['time']['end'] = item[0].shift.end + this.move_time_to;
            filtered_data.push(raw_data);
          }
        }
      });
    });
    //this.changeAllShifts(filtered_data);
  }

  changeAllShifts(data: any) {
    /* this.shiftService.getShift(this.id).subscribe((data: any) => {
      console.log('Data', data);
      data.forEach((element) => {
        if (element.time.start < 0) {
          console.log('Shit data:', element);
        }
      });
    }); */
    this.loading = true;
    console.log('Data:', data);
    this.shiftService.updateShifts(data, this.id).subscribe(
      (data: any) => {
        this.toastr.success('Úprava všech střídání byla úspěšně uložena.');

        this.loading = false;
        this.reloadTimeline();
        this.to_update = [];
        this.selected_shifts = [];
      },
      (error) => {
        this.loading = false;
        this.reloadTimeline();
        this.toastr.error('Během úpravy střídání došlo k chybě.', 'Chyba!');
        this.to_update = [];
        this.selected_shifts = [];
      }
    );
  }

  showSelected() {
    this.show_selected = !this.show_selected;
  }

  deleteShift(i) {
    this.selected_shifts.splice(i, 1);
  }

  orderByName(names) {
    names.sort((a, b) => {
      if (a.surname < b.surname) {
        return -1;
      }
      if (a.surname > b.surname) {
        return 1;
      }
      return 0;
    });
    return names;
  }

  moveSelectedShifts() {
    console.log('Selected_Shifts:', this.selected_shifts);
    this.selected_shifts.forEach((shift) => {
      if (shift.start + this.move_time_from < 0) {
        shift.start = 0;
      } else {
        shift.time.start = shift.time.start + this.move_time_from;
      }
      shift.time.end = shift.time.end + this.move_time_to;
    });

    this.changeAllShifts(this.selected_shifts);
  }

  activeShiftSelect() {
    this.select_mode = !this.select_mode;
    if (this.select_mode) {
      this.autosave = true;
    }
  }

  selectSelected() {
    let filtered_data = [];
    let id = [];
    this.selected_shifts = [];
    this.timeline.forEach((shift) => {
      shift.slots.forEach((item) => {
        let raw_data = {};
        if (item.length != 0) {
          if (!id.includes(item[0].shift.id)) {
            if (
              item[0].shift.start >= this.select_from &&
              item[0].shift.end <= this.select_to
            ) {
              id.push(item[0].shift.id);
              raw_data['time'] = {};
              raw_data['playerId'] = item[0].playerId;
              raw_data['shiftId'] = item[0].shift.id;
              raw_data['time']['start'] = item[0].shift.start;
              raw_data['time']['end'] = item[0].shift.end;
              this.selected_shifts.push(raw_data);
            }
          }
        }
      });
    });
  }

  loadData() {
    this.loading = true;
    forkJoin([
      this.eventFlowService.getEventflow(this.id),
      this.defaultService.getMatch(this.id),
    ]).subscribe(
      (forkData) => {
        console.log('Loaded Data Event', forkData[0], ' Data: ', forkData[1]);
        this.eventFlowData = forkData[0];
        this.matchData = forkData[1];
        this.roster_home = this.orderByName(this.matchData.roster.home);
        this.roster_away = this.orderByName(this.matchData.roster.away);
        this.homeTeamId = this.matchData.gameData.homeTeam.id;
        this.awayTeamId = this.matchData.gameData.awayTeam.id;
        this.homeTeamName = this.matchData.gameData.homeTeam.name;
        this.awayTeamName = this.matchData.gameData.awayTeam.name;
        this.loadHomeTimeline();
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  checkFaceOffs() {
    let shifts = [];
    let fixed_shifts = [];
    this.shiftService.getShift(this.id).subscribe((data: any) => {
      console.log('Shifts', data);
      data.forEach((shift) => {
        shifts.push(shift);
      });

      this.faceOffs.forEach((faceOff) => {
        console.log('Shift');
        shifts.forEach((shift) => {
          if (
            shift.playerId == faceOff.winnerId ||
            shift.playerId == faceOff.loserId
          ) {
            if (
              shift.time.end < faceOff.time &&
              shift.time.end > faceOff.time - 5
            ) {
              console.log('Fixing...');
              console.log('Shift.id', shift.playerId);
              console.log('faceOff.winner', faceOff.winnerId);
              shift.time.end = faceOff.time;
              fixed_shifts.push(shift);
            }
          }
        });
      });
      console.log('Faceoffs', this.faceOffs);
      console.log('fixed', fixed_shifts);
      if (fixed_shifts.length > 0) {
        this.changeAllShifts(fixed_shifts);
      }
      //this.changeAllShifts(fexed_shifts);
    });

    //
    //this.faceOffs.forEach((faceoff) => {});
  }

  checkDuplicates(toCheck) {
    let checked = [];
    toCheck.forEach((item, index) => {
      if (!checked.includes(item.shiftId)) {
        checked.push(item);
      } else checked.splice(index, 1);
    });
  }

  loadHomeTimeline() {
    this.loading = true;
    this.faceOff_seconds = [];
    this.shots_seconds = [];

    /**
     * call for timeline API for home team (blocks, faceOff, gameState, hits, shot, timeLIne)
     */
    this.timelineService.getTimeline(this.id, this.homeTeamId).subscribe(
      (data: any) => {
        console.log('Games data home team:', data);
        this.gameLength = data.gameState[data.gameState.length - 1].end;
        this.gameState = data.gameState;
        this.shots = data.shot;
        this.faceOffs = data.faceOff;
        // faceOffs = "stridani" udelame clone a k nemu pridame eventy
        //this.eventTimeLineData = cloneDeep(this.faceOffs);
        this.eventTimeLineData = [];
        console.log('faceOffs home', data.faceOff);
        console.log('eventTimeLineData home', this.eventTimeLineData);
        this.eventFlowData.forEach((event) => {
          this.eventTimeLineData.push({
            event: this.getEventTypeInCzech(event.event),
            eventEn: event.event,
            winnerId: this.getWinnerAndLoserIdByEvent(event, true),
            loserId: this.getWinnerAndLoserIdByEvent(event, false),
            time: event.time,
            passingPlayerId: event.passingPlayerId,
            playerId: event.playerId,
            stopperPlayerId: event.stopperPlayerId,
            hitter: event.hitter,
            denialPlayerId: event.denialPlayerId,
            puckLostPlayerId: event.puckLostPlayerId,
            gainSharePlayerId: event.gainSharePlayerId,
            goalkeeperId: event.goalkeeperId,
            players: this.getPlayersByEvent(event),
          });
        });
        this.eventTimeLineData.sort((a, b) => (a.time <= b.time ? -1 : 0));
        this.eventTimeLineData = this.eventTimeLineData.filter(
          (e) => e.time <= this.gameLength
        );
        this.eventTimeLineData = this.eventTimeLineData.filter((event) => {
          return this.roster_home.some((rosterHome) => {
            const players = Object.keys(event.players).map(
              (key) => event.players[key]
            );
            // event.event undefined je pro stridani, kde neni nastavene
            return (
              players.indexOf(rosterHome.id) > -1 || event.event === undefined
            );
          });
        });
        console.log(
          'eventTimeLineData po zmene home team',
          this.eventTimeLineData
        );
        if (data.hits) {
          this.hits = data.hits;
        }
        if (data.blocks) {
          this.blocks = data.blocks;
        }

        this.faceOffs.forEach((faceoff) => {
          this.faceOff_seconds.push(faceoff.time);
        });
        this.shots.forEach((shot) => {
          this.shots_seconds.push(shot.time);
        });
        this.timeline = data.timeLine;

        this.checkFaceOffs();

        this.timelineService.getSlot(this.id, this.homeTeamId).subscribe(
          (data: any) => {
            this.slots = data;

            this.timelineService
              .getTimelineOfShifts(this.id, this.homeTeamId)
              .subscribe(
                (data: any) => {
                  console.log('Data1', data);
                  this.homeShifts = data;

                  this.homeShifts.forEach((shift, index) => {
                    if (index <= this.homeShifts.length - 1) {
                      if (typeof this.homeShifts[index + 1] != 'undefined') {
                        shift.timeTo = this.homeShifts[index + 1].time;
                      } else {
                        shift.timeTo = 1000000;
                      }
                    }
                  });

                  this.findProblems();

                  this.loading = false;
                },
                (error) => {
                  this.loading = false;
                }
              );
          },
          (error) => {
            this.loading = false;
          }
        );
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  getEventTypeInCzech(eventType: string): string {
    const eventEnum = Object.keys(EventType);
    let type;
    eventEnum.forEach((e) => {
      if (e === eventType.toUpperCase()) {
        type = EventType[eventType.toUpperCase()];
      }
    });
    return type;
  }

  getWinnerAndLoserIdByEvent(event: any, winner: boolean): number {
    const eventEnum = Object.keys(EventType);
    switch (event.event.toUpperCase()) {
      case eventEnum[9]:
        return winner ? event.winnerId : event.loserId;
      case eventEnum[3]:
      case eventEnum[4]:
      case eventEnum[5]:
      case eventEnum[6]:
        return event.playerId;
      case eventEnum[7]:
      case eventEnum[2]:
        return winner ? event.playerId : event.puckLostPlayerId;
      case eventEnum[1]:
        return event.playerId;
      case eventEnum[0]:
        return winner ? event.playerId : event.passingPlayerId;
      case eventEnum[10]:
        return winner ? event.hitter : event.hitted;
    }
  }

  loadAwayTimeline() {
    this.loading = true;
    this.faceOff_seconds = [];
    this.shots_seconds = [];

    /**
     * call for timeline API for away team (blocks, faceOff, gameState, hits, shot, timeLIne)
     */
    this.timelineService.getTimeline(this.id, this.awayTeamId).subscribe(
      (data: any) => {
        console.log('Games data away team:', data);
        this.gameLength = data.gameState[data.gameState.length - 1].end;
        this.gameState = data.gameState;
        this.shots = data.shot;
        this.faceOffs = data.faceOff;
        //this.eventTimeLineData = cloneDeep(this.faceOffs);
        this.eventTimeLineData = [];
        console.log('faceOffs away', data.faceOff);
        console.log('eventTimeLineData away', this.eventTimeLineData);
        this.eventFlowData.forEach((event) => {
          this.eventTimeLineData.push({
            event: this.getEventTypeInCzech(event.event),
            winnerId: this.getWinnerAndLoserIdByEvent(event, true),
            loserId: this.getWinnerAndLoserIdByEvent(event, false),
            players: this.getPlayersByEvent(event),
            time: event.time,
          });
        });
        this.eventTimeLineData.sort((a, b) => (a.time <= b.time ? -1 : 0));
        this.eventTimeLineData = this.eventTimeLineData.filter(
          (e) => e.time <= this.gameLength
        );
        this.eventTimeLineData = this.eventTimeLineData.filter((event) => {
          return this.roster_away.some((rosterAway) => {
            const players = Object.keys(event.players).map(
              (key) => event.players[key]
            );
            // event.event undefined je pro stridani, kde neni nastavene
            return (
              players.indexOf(rosterAway.id) > -1 || event.event === undefined
            );
          });
        });
        console.log(
          'eventTimeLineData po zmene away team',
          this.eventTimeLineData
        );
        if (data.hits) {
          this.hits = data.hits;
        }
        if (data.blocks) {
          this.blocks = data.blocks;
        }

        this.faceOffs.forEach((faceoff) => {
          this.faceOff_seconds.push(faceoff.time);
        });
        this.shots.forEach((shot) => {
          this.shots_seconds.push(shot.time);
        });

        this.timelineService.getSlot(this.id, this.awayTeamId).subscribe(
          (data: any) => {
            this.slots = data;

            this.timelineService
              .getTimelineOfShifts(this.id, this.awayTeamId)
              .subscribe(
                (data: any) => {
                  this.awayShifts = data;

                  this.awayShifts.forEach((shift, index) => {
                    if (index <= this.awayShifts.length - 1) {
                      if (typeof this.awayShifts[index + 1] != 'undefined') {
                        shift.timeTo = this.awayShifts[index + 1].time;
                      } else {
                        shift.timeTo = 1000000;
                      }
                    }
                  });

                  this.loading = false;
                  this.findProblems();
                },
                (error) => {
                  this.loading = false;
                }
              );
          },
          (error) => {
            this.loading = false;
          }
        );
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  reloadTimeline() {
    this.edit_player = false;
    this.edit_event = false;
    this.new_shift = false;

    this.from = '';
    this.to = '';
    this.selected_player = '';

    this.show_addshift_dialog = false;
    this.show_edit_dialog = false;

    if (this.selected_team == 'home') {
      this.loadHomeTimeline();
    } else {
      this.loadAwayTimeline();
    }
  }

  openVideo(second: number) {
    this.timelineService.getVideoTime(this.id, second).subscribe(
      (data: any) => {
        window.open(
          'https://php.laura.esports.cz/tracking-app/video.php?starttime=' +
            data.videoTime +
            '&id=' +
            this.matchData.videoId,
          'mywindow',
          'menubar=1,resizable=1,width=736,height=415'
        );

        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  findProblems() {
    let problems = [];
    this.problem_seconds = [];

    this.slots.forEach((slot) => {
      slot.forEach((shift) => {
        if (shift.to - shift.from == 1) {
          problems.push(shift.from);
        }
      });
    });

    this.slots.forEach((slot) => {
      slot.forEach((shift) => {
        if (shift.overlayFrom > 4) {
          problems.push(shift.from);
        }
      });
    });

    // if (this.selected_team === 'home') {
    //   this.shots.forEach((shot) => {
    //     this.homeShifts.forEach((shift) => {
    //       if (shot.time >= shift.time && shot.time <= shift.timeTo) {
    //         let slots = [];
    //         shift.slots.forEach((slot) => {
    //           slot.forEach((slot2) => {
    //             slots.push(slot2);
    //           });
    //         });
    //         if (slots.includes(shot.player)) {
    //           //console.log("uff")
    //         } else {
    //           problems.push(shot.time);
    //         }
    //       }
    //     });
    //   });
    // } else if (this.selected_team === 'away') {
    //   this.shots.forEach((shot) => {
    //     this.awayShifts.forEach((shift) => {
    //       if (shot.time >= shift.time && shot.time <= shift.timeTo) {
    //         let slots = [];
    //         shift.slots.forEach((slot) => {
    //           slot.forEach((slot2) => {
    //             slots.push(slot2);
    //           });
    //         });
    //         if (slots.includes(shot.player)) {
    //           //console.log("uff")
    //         } else {
    //           console.log('problem');
    //           problems.push(shot.time);
    //         }
    //       }
    //     });
    //   });
    // }

    console.log('Problems before new code: ' + problems);

    if (this.selected_team === 'home') {
      this.eventTimeLineData.forEach((event) => {
        let AllActiveHomePlayers = [];
        this.homeShifts.forEach((shift) => {
          if (event.time + 1 >= shift.time && event.time + 1 <= shift.timeTo) {
            shift.slots.forEach((slot) => {
              slot.forEach((slot2) => {
                AllActiveHomePlayers.push(slot2);
              });
            });
          }
        });

        for (const [playerType, playerId] of Object.entries(event.players)) {
          if (
            !AllActiveHomePlayers.includes(playerId) &&
            this.roster_home.some((rosterAway) => {
              return rosterAway.id == playerId;
            })
          ) {
            problems.push(event.time);
            console.log(
              'faultPlayer at ' +
                event.time +
                ' is ' +
                this.getPlayerNumber(playerId as number) +
                ' player id: ' +
                playerId +
                ' HomePlayers: ' +
                AllActiveHomePlayers
            );
            break;
          }
        }
      });
    }

    if (this.selected_team === 'away') {
      this.eventTimeLineData.forEach((event) => {
        let AllActiveAwayPlayers = [];
        this.awayShifts.forEach((shift) => {
          if (event.time + 1 >= shift.time && event.time + 1 <= shift.timeTo) {
            shift.slots.forEach((slot) => {
              slot.forEach((slot2) => {
                AllActiveAwayPlayers.push(slot2);
              });
            });
          }
        });

        for (const [playerType, playerId] of Object.entries(event.players)) {
          if (
            !AllActiveAwayPlayers.includes(playerId) &&
            this.roster_away.some((rosterAway) => {
              return rosterAway.id == playerId;
            })
          ) {
            problems.push(event.time);
            console.log(
              'faultPlayer at ' +
                event.time +
                ' is ' +
                this.getPlayerNumber(playerId as number) +
                ' player id: ' +
                playerId +
                ' AwayPlayers: ' +
                AllActiveAwayPlayers
            );
            break;
          }
        }
      });
    }

    // if (this.selected_team === 'home') {
    //   this.faceOffs.forEach((faceOff) => {
    //     this.homeShifts.forEach((shift) => {
    //       if (
    //         faceOff.time + 1 >= shift.time &&
    //         faceOff.time + 1 <= shift.timeTo
    //       ) {
    //         let slots = [];
    //         shift.slots.forEach((slot) => {
    //           slot.forEach((slot2) => {
    //             slots.push(slot2);
    //           });
    //         });
    //         if (
    //           slots.includes(faceOff.winnerId) ||
    //           slots.includes(faceOff.loserId)
    //         ) {
    //           //console.log("uff")
    //         } else {
    //           console.log('problem');
    //           console.log(
    //             JSON.stringify(shift) + '   ' + JSON.stringify(faceOff)
    //           );
    //           problems.push(faceOff.time);
    //         }
    //       }
    //     });
    //   });
    // } else if (this.selected_team === 'away') {
    //   this.faceOffs.forEach((faceOff) => {
    //     this.awayShifts.forEach((shift) => {
    //       if (
    //         faceOff.time + 1 >= shift.time &&
    //         faceOff.time + 1 <= shift.timeTo
    //       ) {
    //         let slots = [];
    //         shift.slots.forEach((slot) => {
    //           slot.forEach((slot2) => {
    //             slots.push(slot2);
    //           });
    //         });
    //         if (
    //           slots.includes(faceOff.winnerId) ||
    //           slots.includes(faceOff.loserId)
    //         ) {
    //           //console.log("uff")
    //         } else {
    //           console.log('problem');
    //           console.log(
    //             JSON.stringify(shift) + '   ' + JSON.stringify(faceOff)
    //           );
    //           problems.push(faceOff.time);
    //         }
    //       }
    //     });
    //   });
    // }

    this.problem_seconds = problems;
  }

  checkProblem(second: number) {
    if (this.problem_seconds.includes(second)) {
      return true;
    } else {
      return false;
    }
  }

  checkFaceOff(second: number) {
    if (this.faceOff_seconds.includes(second)) {
      return true;
    } else {
      return false;
    }
  }

  checkShot(second: number) {
    if (this.shots_seconds.includes(second)) {
      return true;
    } else {
      return false;
    }
  }

  jumpToProblem() {
    let problem_seconds = this.problem_seconds;
    problem_seconds.sort((a, b) => {
      return a - b;
    });

    if (this.selected_problem + 1 > problem_seconds.length) {
      this.selected_problem = 0;
    }

    if (problem_seconds.length > 0) {
      this.selected_problem = this.selected_problem + 1;
      this.scrollView.nativeElement.scrollTo({
        left: problem_seconds[this.selected_problem - 1] * 20,
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  onTeamChange($event) {
    if (this.selected_team == 'home') {
      this.loadHomeTimeline();
    } else {
      this.loadAwayTimeline();
    }
  }

  getRoster() {
    if (this.selected_team == 'home') {
      return this.roster_home;
    } else {
      return this.roster_away;
    }
  }

  getSlot(slot: number) {
    return this.slots[slot - 1];
  }

  getGameLength() {
    return Array.from(Array(this.gameLength).keys());
  }

  formatTime(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  getPlayerName(id: number) {
    let name = '';
    this.roster_home.forEach((player) => {
      if (player.id == id) {
        name = player.surname;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        name = player.surname;
      }
    });

    return name;
  }

  selectShift(id: number) {
    if (this.clicked_shift == id) {
      this.clicked_shift = null;
    } else {
      setTimeout(() => {
        this.clicked_shift = id;
      }, 300);
    }
  }

  getEventType(): string {
    return EventType.SHIFT;
  }

  getPlayerNumber(id: number) {
    let jersey = '';
    this.roster_home.forEach((player) => {
      if (player.id == id) {
        jersey = player.jersey;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        jersey = player.jersey;
      }
    });

    return jersey;
  }

  calcPos(seconds: number) {
    return seconds * 20;
  }

  calcWidth(seconds: number) {
    return seconds * 20;
  }

  onResizeEnd(
    event: ResizeEvent,
    shift: any,
    slot: number,
    index: number
  ): void {
    console.log('Event:', event);
    console.log('Shift:', shift);
    console.log('Slot:', slot);
    console.log('index:', index);
    this.style = {
      position: 'absolute',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };

    this.width = event.rectangle.width;
    this.left = event.rectangle.left;

    let start = 0;
    let end = 0;

    if (event.rectangle.left > 0) {
      start = event.rectangle.left / 20;
    }

    if (event.rectangle.width > 0) {
      end = start + event.rectangle.width / 20;
    }

    this.slots[slot - 1][index]['from'] = start;
    this.slots[slot - 1][index]['to'] = end;

    if (this.autosave) {
      this.updateShift(shift.player, shift.shift, start, end);
    } else {
      let wasChenged = false;
      this.to_update.forEach((item) => {
        if (item.shiftId == shift.shift) {
          wasChenged = true;
          item.time.start = start;
          item.time.end = end;
        }
      });
      if (!wasChenged) {
        this.to_update.push({
          playerId: shift.player,
          shiftId: shift.shift,
          time: {
            start: start,
            end: end,
          },
        });
      }
    }
  }

  saveSelected() {
    console.log('To update:', this.to_update);
    /* this.to_update.forEach((shift) => {
      this.updateShift(shift.player, shift.shift, shift.start, shift.end);
    }); */

    this.changeAllShifts(this.to_update);
  }

  updateShift(playerId: any, shift: number, start: number, end: number) {
    let data = {
      playerId: playerId,
      time: {
        start,
        end,
      },
      app: 'tracking',
    };

    this.loading = true;
    this.shiftService.updateShift(this.id, shift, data).subscribe(
      (data: any) => {
        this.toastr.success(
          'Úprava střídání byla úspěšně uložena.',
          'Výborně!'
        );

        this.loading = false;
        this.reloadTimeline();
      },
      (error) => {
        this.loading = false;
        this.reloadTimeline();
        this.toastr.error('Během úpravy střídání došlo k chybě.', 'Chyba!');
      }
    );
  }

  addNewShift(playerId: any, start: number, end: number) {
    let problem = false;

    if (playerId == '') {
      problem = true;
      this.toastr.error('Není vyplěný hráč.', 'Chyba!');
    }
    if (start == null) {
      problem = true;
      this.toastr.error('Začátek střídání není správně vyplněn.', 'Chyba!');
    }
    if (end == null) {
      problem = true;
      this.toastr.error('Konec střídání není správně vyplněn.', 'Chyba!');
    }

    let data = {
      playerId: playerId,
      time: {
        start,
        end,
      },
      app: 'tracking',
    };

    if (!problem) {
      this.loading = true;
      this.shiftService.createShift(this.id, data).subscribe(
        (data: any) => {
          this.toastr.success(
            'Nové střídání bylo úspěšně přidáno.',
            'Výborně!'
          );

          this.loading = false;
          this.reloadTimeline();
        },
        (error) => {
          this.loading = false;
          this.reloadTimeline();
          this.toastr.error(
            'Během přidávání nového střídání došlo k chybě.',
            'Chyba!'
          );
        }
      );
    }
  }

  submitNewShift() {
    let froms = [];
    froms = this.from.split(':');
    let from = Number(froms[0]) * 60 + Number(froms[1]);

    let tos = [];
    tos = this.to.split(':');
    let to = Number(tos[0]) * 60 + Number(tos[1]);

    this.addNewShift(this.selected_player, from, to);
  }

  resizing(event: ResizeEvent) {
    /*
    this.style = {
      position: 'absolute',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`
    };

    this.width = event.rectangle.width;
    this.left = event.rectangle.left;
    */
  }

  goToSelect() {
    this.router.navigate(['/select']);
  }

  getShiftWidthClass(width: number) {
    if (width <= 60) {
      return 'small2';
    } else if (width <= 160) {
      return 'small';
    } else {
      return 'normal';
    }
  }

  editShift(event, slot: any) {
    this.edit_player = false;
    this.edit_event = false;
    this.new_shift = false;

    this.show_edit_dialog = true;
    this.show_addshift_dialog = false;
    this.new_shift = false;
    this.dialog_x = event.clientX;
    this.dialog_y = event.clientY - 100;

    this.from = this.formatTime(
      Math.ceil(
        (event.clientX + this.scrollView.nativeElement.scrollLeft - 140) / 20
      ) - 1
    );

    //this.selected_slot = selected_slot;

    this.selected_player = slot.player;
    this.selected_shift = slot;

    return false;
  }

  toggleEditPlayer() {
    if (this.edit_player) {
      this.edit_player = false;
    } else {
      this.edit_player = true;
    }
  }

  toggleNewShift() {
    if (this.new_shift) {
      this.new_shift = false;
    } else {
      this.new_shift = true;
    }
  }

  toggleEditEvent() {
    alert('TOTO SE MÁ ZOBRAZIT JEN U CHYBNÉ UDÁLOSTI.');
    if (this.edit_event) {
      this.edit_event = false;
    } else {
      this.edit_event = true;
    }
  }

  removeShift() {
    if (confirm('Opravdu chcete vybrané střídání smazat?')) {
      this.shiftService
        .removeShift(this.id, this.selected_shift.shift)
        .subscribe(
          (data: any) => {
            this.toastr.success('Střídání bylo úspěšně smazáno.', 'Výborně!');

            this.loading = false;
            this.reloadTimeline();
          },
          (error) => {
            this.loading = false;
            this.reloadTimeline();
            this.toastr.error('Během mazání střídání došlo k chybě.', 'Chyba!');
          }
        );
    }
  }

  changePlayer() {
    this.updateShift(
      this.selected_player,
      this.selected_shift.shift,
      this.selected_shift.from,
      this.selected_shift.to
    );
  }

  //@HostListener('document:click', ['$event'])
  documentClick() {
    //let target = (event.target as Element).parentElement.className;
    //alert(target);

    //if (target != 'event-box' && target != 'event-row' && target != 'event-more' && target != 'event-select' && target != 'event-time') {
    //this.show_edit_dialog = false;
    //this.show_addshift_dialog = false;
    //}

    this.show_edit_dialog = false;
    this.show_addshift_dialog = false;
    this.clicked_shift = null;
    //console.log(event);
  }

  addShift(event: MouseEvent) {
    //this.selected_slot = selected_slot;
    this.new_shift = false;
    setTimeout(() => {
      this.show_addshift_dialog = true;
    }, 1);
    this.dialog_x = event.clientX;
    this.dialog_y = event.clientY + 10;
    this.from = this.formatTime(
      Math.ceil(
        (event.clientX + this.scrollView.nativeElement.scrollLeft - 140) / 20
      ) - 1
    );
    //this.to = '0:00';

    return false;
  }

  getPlayerPost(id: number) {
    let name = '';
    this.roster_home.forEach((player) => {
      if (player.id == id) {
        name = player.position;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        name = player.position;
      }
    });

    return name;
  }

  renderProblemSlot() {
    let data = this.getSlot(1);

    console.log(JSON.stringify(data));
  }

  canDeactivate() {
    if (confirm('Přejete si opustit zápas a uzamknout ho?')) {
      this.defaultService.removeWatch(this.id).subscribe(
        (data: any) => {
          this.toastr.success(
            'Sběr dat byl ukončen a zápas uzamčen.',
            'Výborně!',
            {
              progressBar: true,
            }
          );
        },
        (error) => {
          this.toastr.error('Během zamykání zápasu došlo k chybě.', 'Chyba!', {
            progressBar: true,
          });
        }
      );

      return true;
    } else {
      return false;
    }
  }

  /**
   * Get a object containing all the players by event
   * @param {any} event
   */
  getPlayersByEvent(event: any): any {
    let eventEnum: string[] = Object.keys(EventType);
    let players: any = {};
    let eventKey = event.event.toUpperCase();

    switch (eventKey) {
      case eventEnum[9]: {
        event.winnerId && (players.winnerId = event.winnerId);
        event.loserId && (players.loserId = event.loserId);
      }
      case eventEnum[3]: {
        event.passingPlayerId &&
          (players.passingPlayerId = event.passingPlayerId);
        event.playerId && (players.playerId = event.playerId);
        event.stopperPlayerId &&
          (players.stopperPlayerId = event.stopperPlayerId);
      }
      case eventEnum[4]: {
        event.passingPlayerId &&
          (players.passingPlayerId = event.passingPlayerId);
        event.playerId && (players.playerId = event.playerId);
        event.denialPlayerId && (players.denialPlayerId = event.denialPlayerId);
      }
      case eventEnum[5]:
      case eventEnum[6]: {
        event.playerId && (players.playerId = event.playerId);
      }
      case eventEnum[7]:
      case eventEnum[2]: {
        event.playerId && (players.playerId = event.playerId);
        event.puckLostPlayerId &&
          (players.puckLostPlayerId = event.puckLostPlayerId);
        event.gainSharePlayerId &&
          (players.gainSharePlayerId = event.gainSharePlayerId);
      }
      case eventEnum[1]: {
        event.playerId && (players.playerId = event.playerId);
      }
      case eventEnum[0]: {
        event.playerId && (players.playerId = event.playerId);
        event.goalkeeperId && (players.goalkeeperId = event.goalkeeperId);
        event.blockerId && (players.blockerId = event.blockerId);
      }
      case eventEnum[10]: {
        event.hitter && (players.hitter = event.hitter);
        event.hitted && (players.hitted = event.hitted);
      }
    }
    //console.log(players);
    return players;
  }

  /**
   * Get player full name [player number + player name] by player id
   * @param {number} playerId
   */
  getPlayerFullName(playerId: number) {
    return (
      this.getPlayerNumber(playerId) +
      ' ' +
      this.getPlayerName(playerId) +
      ' / '
    );
  }

  /**
   * Get available shot Players
   * @param {event time line} event
   */
  getShotPlayers(event) {
    let str = '';
    if (event.playerId != undefined)
      str +=
        this.getPlayerNumber(event.playerId) +
        ' ' +
        this.getPlayerName(event.playerId) +
        ' / ';
    if (event.goalkeeperId != undefined)
      str +=
        this.getPlayerNumber(event.goalkeeperId) +
        ' ' +
        this.getPlayerName(event.goalkeeperId) +
        ' / ';

    return this.removeEndsLettersFromLabel(str);
  }

  /**
   * Get available Puck Won Players
   * @param {event time line} event
   */
  getPuckWonPlayers(event) {
    let str = '';
    if (event.gainSharePlayerId != undefined)
      str += this.getPlayerFullName(event.gainSharePlayerId);
    if (event.playerId != undefined)
      str += this.getPlayerFullName(event.playerId);
    if (event.puckLostPlayerId != undefined)
      str += this.getPlayerFullName(event.puckLostPlayerId);

    return this.removeEndsLettersFromLabel(str);
  }

  /**
   * Get available Zone Entry Players
   * @param {event time line} event
   */
  getZoneEntryPlayers(event) {
    let str = '';
    if (event.passingPlayerId != undefined)
      str += this.getPlayerFullName(event.passingPlayerId);
    if (event.playerId != undefined)
      str += this.getPlayerFullName(event.playerId);
    if (event.stopperPlayerId != undefined)
      str += this.getPlayerFullName(event.stopperPlayerId);

    return this.removeEndsLettersFromLabel(str);
  }

  /**
   * Get available Zone Exit Players
   * @param {event time line} event
   */
  getZoneExitPlayers(event) {
    let str = '';
    if (event.passingPlayerId != undefined)
      str += this.getPlayerFullName(event.passingPlayerId);
    if (event.playerId != undefined)
      str += this.getPlayerFullName(event.playerId);
    if (event.denialPlayerId != undefined)
      str += this.getPlayerFullName(event.denialPlayerId);

    return this.removeEndsLettersFromLabel(str);
  }

  /**
   * Remove unnecessary end letters from the label of popup event players
   * @param {string} str
   */
  removeEndsLettersFromLabel(str: string) {
    return str.endsWith(' / ') ? str.substring(0, str.length - 3) : str;
  }

  /**
   * Manage width and postion shapes if I get more than one event
   * at the same time
   * @param {number, number} time,index
   */
  ManageEventTimeLineShape(time: number, index: number) {
    var target = $('#_event_' + index);
    if (
      !this.eventTimeLineData[index - 1] ||
      time !== this.eventTimeLineData[index - 1].time
    ) {
      return this.calcPos(time);
    } else {
      if (index > 0) {
        let nearEventIndex = index - 1;
        let nearEvent = $('#_event_' + nearEventIndex);
        target.css({ width: '10px' });
        nearEvent.css({ width: '10px' });
        return parseInt(nearEvent.css('left')) + 10;
      }
    }
  }
}
