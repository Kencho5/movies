import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-player-controls",
  imports: [],
  templateUrl: "./player-controls.component.html",
})
export class PlayerControlsComponent {
  @Input() isPlaying: boolean = false;
  @Output() togglePlayer = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();

  onTogglePlayer(): void {
    this.togglePlayer.emit();
  }

  onSeek(seconds: number): void {
    this.seek.emit(seconds);
  }
}
