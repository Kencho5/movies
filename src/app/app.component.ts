import { Component } from "@angular/core";
import { CommonModule, ViewportScroller } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { NavigationEnd, Router } from "@angular/router";
import { LanguageService } from "@core/services/language.service";

@Component({
  selector: "app-root",
  imports: [CommonModule, SharedModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  constructor(
    private viewportScroller: ViewportScroller,
    private router: Router,
    private languageService: LanguageService,
  ) {
    this.languageService.setLanguage(this.languageService.currentLang);
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }
}
