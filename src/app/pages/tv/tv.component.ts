import { Component, signal, OnInit, OnDestroy } from "@angular/core";
import { Channel } from "@core/interfaces/tv";
import { TvService } from "@core/services/tv.service";
import { SharedModule } from "@shared/shared.module";
declare var Playerjs: any;

@Component({
  selector: "app-tv",
  imports: [SharedModule],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit, OnDestroy {
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  loading = signal<boolean>(true);
  player: any = null;

  constructor(private tvService: TvService) {}

  ngOnInit(): void {
    this.tvService.getChannels().subscribe((res) => {
      this.channels.set(res);
      this.activeChannel.set(res[0]);
      this.loading.set(false);
      setTimeout(() => this.initPlayer(), 0);
    });
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  destroyPlayer() {
    if (this.player) {
      this.player.api("stop");
      this.player.api("destroy");
      this.player = null;
    }
  }

  initPlayer() {
    this.destroyPlayer();

    this.player = new Playerjs({
      id: "player",
      file: this.activeChannel()?.stream,
      poster: this.activeChannel()?.thumbnail,
      autoplay: 1,
    });
  }

  changeChannel(id: number) {
    this.activeChannel.set(this.channels().find((c) => c.id === id)!);
    setTimeout(() => this.initPlayer(), 100);
  }
}
