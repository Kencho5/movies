import { Injectable, signal } from "@angular/core";
import { PlayerData } from "@core/interfaces/player";

declare var Playerjs: any;

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  private player: any = null;
  isPlaying = signal<boolean>(false);

  dateOffset: number = (new Date().getTimezoneOffset() * 60 + 3 * 3600) * 1000;
  start = signal<number>(Math.floor((Date.now() + this.dateOffset) / 1000));
  end: number = Math.floor((Date.now() + this.dateOffset) / 1000);

  initialize(data: PlayerData): void {
    this.destroy();

    this.player = new Playerjs({
      id: "player",
      file: data.file,
      poster: data.poster,
      autoplay: data.autoplay ?? 1,
    });
  }

  destroy(): void {
    if (this.player) {
      this.player.api("stop");
      this.player.api("destroy");
      this.player = null;
    }
  }

  trigger(command: string) {
    this.isPlaying.set(command === "play");
    return this.player.api(command);
  }

  play(url: string): void {
    this.player.api("play", url);
  }
}
