import { Component, ElementRef, ViewChild } from "@angular/core";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-days-selector",
  imports: [SharedModule],
  templateUrl: "./days-selector.component.html",
})
export class DaysSelectorComponent {
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;
  buttonMinWidth = 120;

  days: any[] = [];

  ngOnInit() {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      let current = false;

      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateNumber = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const weekDay = date.toLocaleDateString("en-US", { weekday: "short" });
      const key = date.toISOString().split("T")[0];

      current =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({ key, dateNumber, month, weekDay, current });
    }
    this.days = days.reverse();
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -this.buttonMinWidth * 3,
      behavior: "smooth",
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: this.buttonMinWidth * 3,
      behavior: "smooth",
    });
  }
}
