import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { Program } from "@core/interfaces/tv";
import { PlayerService } from "@core/services/player.service";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-timeline",
  imports: [SharedModule],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent implements OnInit, OnDestroy {
  constructor(private playerService: PlayerService) {}

  @Input() programs!: Program[];
  @Output() timeSet = new EventEmitter<number>();

  // constants
  private readonly DAY_MINUTES = 1440;
  private readonly TOTAL_HOURS = 24;

  private timer: any;

  // signals
  tooltipX = signal<number>(0);
  tooltipText = signal<string>("");
  tooltipShown = signal<boolean>(false);
  progress = signal<number>(0);
  currentTimeText = signal<string>("");
  activeProgram = signal<Program | null>(null);
  hoveredProgram = signal<Program | null>(null);

  ngOnInit() {
    this.timer = setInterval(() => {
      if (!this.playerService.isPlaying()) return;
      this.updateTimeProgress();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  hover(event: MouseEvent): void {
    if (this.hoveredProgram()) return;

    const { relativeX, percent } = this.getPositionData(event);
    const minutes = Math.floor(percent * this.DAY_MINUTES);

    this.tooltipX.set(relativeX);
    this.tooltipText.set(this.formatTooltipTime(minutes));
    this.tooltipShown.set(true);
  }

  setTime(event: MouseEvent): void {
    if (this.hoveredProgram()) {
      this.setTimeToProgram();
      return;
    }

    const { percent } = this.getPositionData(event);
    this.progress.set(percent * 100);

    const timeInSeconds = Math.floor(percent * this.DAY_MINUTES * 60);
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const timestamp = this.createTimestamp(hours, minutes, seconds);
    this.updateCurrentTimeFromTimestamp(timestamp);

    this.playerService.start.set(timestamp);
    this.timeSet.emit(timestamp);
  }

  setTimeToProgram(): void {
    const program = this.hoveredProgram();
    if (!program) return;

    this.activeProgram.set(program);

    // Set timestamp to program start time
    const timestamp = program.start;
    this.updateCurrentTimeFromTimestamp(timestamp);

    // Calculate progress percentage
    const date = new Date(timestamp * 1000);
    const minutesPassed = date.getHours() * 60 + date.getMinutes();
    this.progress.set((minutesPassed / this.DAY_MINUTES) * 100);

    this.playerService.start.set(timestamp);
    this.timeSet.emit(timestamp);
  }

  getTimePosition(hourFraction: number): string {
    return `${(hourFraction / this.TOTAL_HOURS) * 100}%`;
  }

  getHourLabelStyle(hour: number): object {
    switch (hour) {
      case 0:
        return { left: "0%", transform: "none" };
      case this.TOTAL_HOURS:
        return { left: "100%", transform: "translateX(-100%)" };
      default:
        return {
          left: `${(hour / this.TOTAL_HOURS) * 100}%`,
          transform: "translateX(-50%)",
        };
    }
  }

  getProgramPosition(program: Program): string {
    const date = new Date(program.start * 1000);
    const totalMinutes = date.getHours() * 60 + date.getMinutes();
    return `${(totalMinutes / this.DAY_MINUTES) * 100}%`;
  }

  onProgramHover(event: MouseEvent, program: Program): void {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const parentElement = target.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();

    this.tooltipX.set(rect.left + rect.width / 2 - parentRect.left);

    const startDate = new Date(program.start * 1000);
    const timeString = this.formatTimeFromDate(startDate);
    this.tooltipText.set(`${timeString} - ${program.title.text}`);

    this.tooltipShown.set(true);
    this.hoveredProgram.set(program);
  }

  onProgramLeave(): void {
    this.hoveredProgram.set(null);
    this.tooltipShown.set(false);
  }

  private updateTimeProgress(): void {
    if (!this.playerService.isPlaying()) return;

    const currentTimestamp =
      this.playerService.start() || Math.floor(Date.now() / 1000);
    const now = new Date(currentTimestamp * 1000);

    // Calculate minutes passed in the current day
    const minutesPassed = now.getHours() * 60 + now.getMinutes();
    this.progress.set((minutesPassed / this.DAY_MINUTES) * 100);

    this.updateCurrentTimeFromTimestamp(currentTimestamp);
  }

  private updateCurrentTimeFromTimestamp(timestamp: number): void {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    this.currentTimeText.set(`${hours}:${minutes}:${seconds}`);
  }

  private createTimestamp(
    hours: number,
    minutes: number,
    seconds: number,
  ): number {
    const now = new Date();
    now.setHours(hours, minutes, seconds, 0);
    return Math.floor(now.getTime() / 1000);
  }

  private formatTooltipTime(totalMinutes: number): string {
    // Handle overflow
    totalMinutes = totalMinutes % this.DAY_MINUTES;
    if (totalMinutes < 0) totalMinutes += this.DAY_MINUTES;

    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private getPositionData(event: MouseEvent): {
    relativeX: number;
    percent: number;
  } {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, relativeX / rect.width));

    return { relativeX, percent };
  }

  private formatTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}
