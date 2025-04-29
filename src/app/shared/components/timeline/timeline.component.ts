import { Component, Input } from "@angular/core";
import { Program } from "@core/interfaces/tv";

@Component({
  selector: "app-timeline",
  imports: [],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent {
  @Input() programs!: Program[];

  convertTimestampToHours(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}
