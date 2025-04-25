import { Component, signal, OnInit, effect } from "@angular/core";
import { PlayerData } from "@core/interfaces/player";
import { Channel } from "@core/interfaces/tv";
import { PlayerService } from "@core/services/player.service";
import { TvService } from "@core/services/tv.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { ChannelsSkeletonComponent } from "@shared/components/ui/channels-skeleton/channels-skeleton.component";
import { ProgramsSkeletonComponent } from "@shared/components/ui/programs-skeleton/programs-skeleton.component";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-tv",
  imports: [
    SharedModule,
    PlayerComponent,
    ChannelsSkeletonComponent,
    ProgramsSkeletonComponent,
  ],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit {
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  loading = signal<boolean>(true);
  playerData = signal<PlayerData | null>(null);
  sidebarOpen = signal<boolean>(false);
  isPlaying = signal<boolean>(true);

  dateOffset: number = 10800;
  start: number = Math.floor((Date.now() + this.dateOffset) / 1000);
  end: number = Math.floor((Date.now() + this.dateOffset) / 1000);

  constructor(
    private tvService: TvService,
    private playerService: PlayerService,
  ) {
    effect(() => {
      const channel = this.activeChannel();

      if (channel) {
        this.playerData.set({
          file: channel.stream,
          poster: channel.thumbnail,
          autoplay: 0,
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

  togglePlayer() {
    this.playerService.trigger(this.isPlaying() ? "stop" : "play");
    this.isPlaying.set(this.playerService.trigger("playing"));
  }

  seek(seconds: number) {
    this.start += seconds;

    this.playerService.play(
      this.streamUrl(this.activeChannel()!.stream, this.start, this.end),
    );
  }

  streamUrl(url: string, start: number, end: number) {
    const [base, queryString] = url.split("?");
    const params = queryString.split("&");

    const idIndex = params.findIndex((p) => p.startsWith("id="));
    const idParam = params.splice(idIndex, 1)[0];

    params.push(`start=${encodeURIComponent(start)}`);
    params.push(`end=${encodeURIComponent(end)}`);

    params.push(idParam);

    return `${base}?${params.join("&")}`;
  }
}
