import {
  Component,
  signal,
  OnInit,
  effect,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";
import { PlayerData } from "@core/interfaces/player";
import { Channel, Program } from "@core/interfaces/tv";
import { PlayerService } from "@core/services/player.service";
import { TvService } from "@core/services/tv.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { ChannelsSkeletonComponent } from "@shared/components/ui/channels-skeleton/channels-skeleton.component";
import { ProgramsSkeletonComponent } from "@shared/components/ui/programs-skeleton/programs-skeleton.component";
import { SharedModule } from "@shared/shared.module";
import { streamUrl } from "app/utils/streamUrl";

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
  @ViewChildren("programBtn") programButtons!: QueryList<ElementRef>;

  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  programs = signal<Program[] | null>(null);
  activeProgram = signal<Program | null>(null);

  loading = signal<boolean>(true);
  programsLoading = signal<boolean>(true);
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
        this.getPrograms(channel.id);
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

  getPrograms(id: number): void {
    this.programsLoading.set(true);
    const date = new Date().toISOString().split("T")[0];

    this.tvService.getPrograms(id, date).subscribe((res) => {
      this.programs.set(res.tv.programs);
      this.setProgram(this.closestProgram()!);
      this.programsLoading.set(false);
    });
  }

  setProgram(program: Program): void {
    this.activeProgram.set(program);
    this.start = program.start;
    this.end = program.stop;

    this.playerData.set({
      file: streamUrl(this.activeChannel()!.stream, this.start, this.end),
      poster: this.activeChannel()!.thumbnail,
      autoplay: 1,
    });
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
      streamUrl(this.activeChannel()!.stream, this.start, this.end),
    );
  }

  convertTimestampToHours(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  closestProgram(): Program | null {
    if (!this.programs()?.length) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const currentTime = nowSeconds;

    let minDifference: number = nowSeconds;
    let lastIndex: number = 0;

    this.programs()?.forEach((program, index) => {
      const difference = Math.abs(program.start - currentTime);

      if (difference < minDifference) {
        minDifference = difference;
        lastIndex = index;
      }
    });
    setTimeout(() => {
      this.programButtons
        .toArray()
        [lastIndex - 1].nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);

    return this.programs()![lastIndex - 1];
  }
}
