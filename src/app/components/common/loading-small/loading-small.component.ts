import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'loading-small',
  templateUrl: './loading-small.component.html',
  styleUrls: ['./loading-small.component.scss']
})
export class LoadingSmallComponent implements OnInit {

  constructor(
    private router: Router
  ) {

  }

  ngOnInit(): void {
  }

}
