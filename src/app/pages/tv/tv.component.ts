import { Component, signal, OnInit } from "@angular/core";
import { PlayerData } from "@core/interfaces/player";
import { Channel } from "@core/interfaces/tv";
import { TvService } from "@core/services/tv.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-tv",
  imports: [SharedModule, PlayerComponent],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit {
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  loading = signal<boolean>(true);
  playerData = signal<PlayerData>({
    file: "",
    poster: "",
    autoplay: 0,
  });

  constructor(private tvService: TvService) {}

  ngOnInit(): void {
    this.tvService.getChannels().subscribe((res) => {
      this.channels.set(res);
      this.activeChannel.set(res[0]);
      this.loading.set(false);

      this.playerData.set({
        file: this.activeChannel()!.stream,
        poster: this.activeChannel()!.thumbnail,
        autoplay: 1,
      });
    });
  }

  changeChannel(id: number) {
    this.activeChannel.set(this.channels().find((c) => c.id === id)!);
  }
}
