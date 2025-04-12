import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-titlebar",
  imports: [SharedModule, RouterModule],
  templateUrl: "./titlebar.component.html",
})
export class TitlebarComponent {}
