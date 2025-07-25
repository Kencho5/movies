import { NgModule } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { LoadingDotsComponent } from "./components/ui/loading-dots/loading-dots.component";

@NgModule({
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    InfiniteScrollDirective,
    LoadingDotsComponent,
  ],
  exports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    InfiniteScrollDirective,
    LoadingDotsComponent,
  ],
})
export class SharedModule {}
