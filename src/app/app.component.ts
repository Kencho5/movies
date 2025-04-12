import { Component } from "@angular/core";
import { CommonModule, ViewportScroller } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [CommonModule, SharedModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  constructor(
    private viewportScroller: ViewportScroller,
    private router: Router,
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }
}
