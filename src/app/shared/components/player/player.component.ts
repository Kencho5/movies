import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { PlayerService } from "@core/services/player.service";
import { PlayerData } from "@core/interfaces/player";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() playerData: PlayerData | null = null;
  @Input() playerClass: string = "";

  constructor(public playerService: PlayerService) {}

  ngOnInit(): void {
    if (this.playerData) setTimeout(() => this.initPlayer(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["playerData"] && !changes["playerData"].firstChange) {
      setTimeout(() => this.initPlayer(), 0);
    }
  }

  ngOnDestroy(): void {
    this.playerService.destroy();
  }

  private initPlayer(): void {
    this.playerService.initialize(this.playerData!);
  }
}
