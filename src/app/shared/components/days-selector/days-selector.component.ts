import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PlayerService } from "@core/services/player.service";
import { SharedModule } from "@shared/shared.module";
import { isSameDay } from "app/utils/compareDates";

interface Day {
  dateNumber: string;
  month: string;
  weekDay: string;
  timestamp: number;
}

@Component({
  selector: "app-days-selector",
  imports: [SharedModule],
  templateUrl: "./days-selector.component.html",
})
export class DaysSelectorComponent implements OnInit {
  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute,
  ) {}

  @ViewChild("scrollContainer") scrollContainer!: ElementRef;

  @Output() daySelected = new EventEmitter<void>();

  buttonMinWidth = 120;
  days: Day[] = [];
  activeDay = signal<Day | null>(null);

  private readonly DAYS_TO_DISPLAY = 30;
  private readonly SCROLL_ITEMS = 3;

  ngOnInit(): void {
    this.days = this.generateDaysArray();
  }

  scroll(dir: "left" | "right"): void {
    this.scrollContainer.nativeElement.scrollBy({
      left:
        (dir == "left" ? -this.buttonMinWidth : this.buttonMinWidth) *
        this.SCROLL_ITEMS,
      behavior: "smooth",
    });
  }

  selectDay(day: Day): void {
    this.playerService.dayOffset = day.timestamp;
    this.activeDay.set(day);
    this.daySelected.emit();
  }

  private generateDaysArray(): Day[] {
    const days: Day[] = [];
    const today = new Date();
    const paramTimestamp = this.route.snapshot.queryParams["start"] * 1000;
    const paramDate = paramTimestamp ? new Date(paramTimestamp) : null;

    for (let i = this.DAYS_TO_DISPLAY - 1; i >= 0; i--) {
      const date = this.getDateWithOffset(today, -i);
      const dayObject = this.createDayObject(date);
      days.push(dayObject);

      if (paramDate && isSameDay(paramDate, date)) {
        this.activeDay.set(dayObject);
      } else if (!paramDate && isSameDay(date, today)) {
        this.activeDay.set(dayObject);
      }
    }
    return days.reverse();
  }

  private getDateWithOffset(referenceDate: Date, offsetDays: number): Date {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() + offsetDays);
    return date;
  }

  private createDayObject(date: Date): Day {
    return {
      dateNumber: this.formatDayOfMonth(date),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekDay: date.toLocaleDateString("en-US", { weekday: "short" }),
      timestamp: date.getTime(),
    };
  }

  private formatDayOfMonth(date: Date): string {
    return date.getDate().toString().padStart(2, "0");
  }
}
