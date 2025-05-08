import { Component, Input, signal } from "@angular/core";
import { Program } from "@core/interfaces/tv";
import { PlayerService } from "@core/services/player.service";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-timeline",
  imports: [SharedModule],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent {
  constructor(private playerService: PlayerService) {}

  @Input() programs!: Program[];

  // Constants
  private readonly DAY_MINUTES = 1440;
  private readonly TOTAL_HOURS = 24;

  private timer: any;
  private isManuallySet: boolean = false;
  private manualTimeOffsetMinutes: number = 0;

  // UI state
  tooltipX = 0;
  tooltipText = "";
  tooltipShown: boolean = false;
  progress = 0;
  currentTimeText = signal<string>("");
  activeProgram: Program | null = null;
  hoveredProgram: Program | null = null;

  ngOnInit() {
    this.updateTimeProgress();

    this.timer = setInterval(() => {
      this.updateTimeProgress();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  hover(event: MouseEvent): void {
    if (this.hoveredProgram) return;

    const { relativeX, percent } = this.getPositionData(event);
    const minutes = Math.floor(percent * this.DAY_MINUTES);

    this.tooltipX = relativeX;
    this.tooltipText = this.formatTooltipTime(minutes);
    this.tooltipShown = true;
  }

  setTime(event: MouseEvent): void {
    if (this.hoveredProgram) {
      this.setTimeToProgram();
      return;
    }

    const { percent } = this.getPositionData(event);
    const selectedMinutes = Math.floor(percent * this.DAY_MINUTES);
    const now = new Date();
    const currentMinutes = now.getMinutes() + now.getHours() * 60;

    // Calculate the offset between selected time and current time
    this.manualTimeOffsetMinutes = selectedMinutes - currentMinutes;
    this.isManuallySet = true;

    this.progress = percent * 100;
    this.updateCurrentTimeText();
  }

  setTimeToProgram(): void {
    this.activeProgram = this.hoveredProgram;
    const totalMinutes = this.getProgramTotalMinutes(this.hoveredProgram!);

    // Calculate the offset between program time and current time
    const now = new Date();
    const currentMinutes = now.getMinutes() + now.getHours() * 60;
    this.manualTimeOffsetMinutes = totalMinutes - currentMinutes;
    this.isManuallySet = true;

    this.progress = (totalMinutes / this.DAY_MINUTES) * 100;
    this.updateCurrentTimeText();
  }

  // Reset to current time
  resetToCurrentTime(): void {
    this.isManuallySet = false;
    this.manualTimeOffsetMinutes = 0;
    this.activeProgram = null;
    this.updateTimeProgress();
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
    const totalMinutes = this.getProgramTotalMinutes(program);
    return `${(totalMinutes / this.DAY_MINUTES) * 100}%`;
  }

  onProgramHover(event: MouseEvent, program: Program): void {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const parentElement = target.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();

    this.tooltipX = rect.left + rect.width / 2 - parentRect.left;

    const startDate = new Date(program.start * 1000);
    const timeString = this.formatTimeFromDate(startDate);
    this.tooltipText = `${timeString} - ${program.title.text}`;

    this.tooltipShown = true;
    this.hoveredProgram = program;
  }

  onProgramLeave(): void {
    this.hoveredProgram = null;
    this.tooltipShown = false;
  }

  private updateTimeProgress(): void {
    const now = new Date();
    let minutesPassed = now.getMinutes() + now.getHours() * 60;

    if (this.isManuallySet) {
      minutesPassed += this.manualTimeOffsetMinutes;

      minutesPassed = minutesPassed % this.DAY_MINUTES;
      if (minutesPassed < 0) minutesPassed += this.DAY_MINUTES;
    }

    this.progress = (minutesPassed / this.DAY_MINUTES) * 100;
    this.updateCurrentTimeText(minutesPassed);
  }

  private updateCurrentTimeText(minutesPassed?: number): void {
    const now = new Date();
    let minutes: number;
    let seconds: string;

    if (this.isManuallySet && minutesPassed !== undefined) {
      minutes = minutesPassed;
      seconds = now.getSeconds().toString().padStart(2, "0");
    } else {
      minutes = now.getMinutes() + now.getHours() * 60;
      seconds = now.getSeconds().toString().padStart(2, "0");

      if (this.isManuallySet) {
        minutes += this.manualTimeOffsetMinutes;
        // Handle overflow (next day)
        minutes = minutes % this.DAY_MINUTES;
        if (minutes < 0) minutes += this.DAY_MINUTES;
      }
    }

    this.currentTimeText.set(this.formatTooltipTime(minutes) + `:${seconds}`);
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
    const percent = relativeX / rect.width;

    return { relativeX, percent };
  }

  private formatTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private getProgramTotalMinutes(program: Program): number {
    const date = new Date(program.start * 1000);
    return date.getHours() * 60 + date.getMinutes();
  }
}
