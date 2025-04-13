import { Component, signal, OnInit, effect } from "@angular/core";
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
  sidebarOpen = signal<boolean>(false);

  constructor(private tvService: TvService) {
    effect(() => {
      const channel = this.activeChannel();
      if (channel) {
        this.playerData.set({
          file: channel.stream,
          poster: channel.thumbnail,
          autoplay: 1,
        });
      }
    });
  }

  ngOnInit(): void {
    this.tvService.getChannels().subscribe((res) => {
      this.channels.set(res);
      this.activeChannel.set(res[0]);
      this.loading.set(false);
    });
  }

  changeChannel(id: number) {
    this.activeChannel.set(this.channels().find((c) => c.id === id)!);
    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update((current) => !current);
  }
}
