import { Component, EventEmitter, Output } from "@angular/core";
import { PlayerService } from "@core/services/player.service";

@Component({
  selector: "app-player-controls",
  imports: [],
  templateUrl: "./player-controls.component.html",
})
export class PlayerControlsComponent {
  constructor(public playerService: PlayerService) {}

  @Output() togglePlayer = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();

  onTogglePlayer(): void {
    this.togglePlayer.emit();
  }

  onSeek(seconds: number): void {
    this.seek.emit(seconds);
  }
}
