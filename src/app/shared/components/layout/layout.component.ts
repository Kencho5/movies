import { Component } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { FooterComponent } from "../footer/footer.component";
import { LoadingDotsComponent } from "../ui/loading-dots/loading-dots.component";
import { LoadingService } from "@core/services/loading.service";

@Component({
  selector: "app-layout",
  imports: [
    SharedModule,
    TitlebarComponent,
    FooterComponent,
    LoadingDotsComponent,
  ],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {
  constructor(public loadingService: LoadingService) {}
}
