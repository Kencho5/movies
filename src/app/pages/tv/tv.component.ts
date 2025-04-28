import {
  Component,
  signal,
  OnInit,
  effect,
  ViewChildren,
  QueryList,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { PlayerData } from "@core/interfaces/player";
import { Channel, Program, TvParams } from "@core/interfaces/tv";
import { PlayerService } from "@core/services/player.service";
import { TvService } from "@core/services/tv.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { ChannelsSkeletonComponent } from "@shared/components/ui/channels-skeleton/channels-skeleton.component";
import { ProgramsSkeletonComponent } from "@shared/components/ui/programs-skeleton/programs-skeleton.component";
import { SharedModule } from "@shared/shared.module";
import { streamUrl } from "app/utils/streamUrl";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

@Component({
  selector: "app-tv",
  imports: [
    SharedModule,
    PlayerComponent,
    ChannelsSkeletonComponent,
    ProgramsSkeletonComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit, OnDestroy {
  @ViewChildren("programBtn") programButtons!: QueryList<ElementRef>;

  // signals
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  programs = signal<Program[] | null>(null);
  activeProgram = signal<Program | null>(null);
  loading = signal<boolean>(true);
  programsLoading = signal<boolean>(true);
  playerData = signal<PlayerData | null>(null);
  sidebarOpen = signal<boolean>(false);
  programSidebarOpen = signal(false);
  isPlaying = signal<boolean>(true);

  // parameters and timing
  tvParams: TvParams | null = null;
  dateOffset: number = 10800;
  start: number = Math.floor((Date.now() + this.dateOffset) / 1000);
  end: number = Math.floor((Date.now() + this.dateOffset) / 1000);
  channelsPage = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private tvService: TvService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    effect(() => {
      const channel = this.activeChannel();
      if (channel) this.loadPrograms(channel.id);
    });
  }

  ngOnInit(): void {
    this.initializeQueryParams();
    this.loadChannels();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeChannel(id: number): void {
    const selectedChannel = this.findChannelById(id);
    if (!selectedChannel) return;

    this.activeChannel.set(selectedChannel);
    this.tvParams = { channel: id, program: null };
    this.applyRouteParams();

    if (window.innerWidth < 768) this.sidebarOpen.set(false);
  }

  setProgram(program: Program): void {
    if (!program || !this.activeChannel()) return;

    this.tvParams = {
      channel: this.activeChannel()!.id,
      program: program.start,
    };

    this.activeProgram.set(program);
    this.start = program.start;
    this.end = program.stop;

    this.playerData.set({
      file: streamUrl(this.activeChannel()!.stream, this.start, this.end),
      poster: this.activeChannel()!.thumbnail,
      autoplay: 0,
    });

    this.applyRouteParams();
    this.scrollToActiveProgram();
    if (this.programSidebarOpen()) this.toggleSidebar("programs");
  }

  toggleSidebar(type: "channels" | "programs") {
    if (type === "channels") {
      this.sidebarOpen.update((state) => !state);
    } else if (type === "programs") {
      this.programSidebarOpen.update((state) => !state);
    }
  }

  togglePlayer(): void {
    const action = this.isPlaying() ? "stop" : "play";
    this.playerService.trigger(action);
    this.isPlaying.set(this.playerService.trigger("playing"));
  }

  seek(seconds: number): void {
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

  loadChannels(): void {
    const channelSubscription = this.tvService
      .getChannels(this.channelsPage)
      .subscribe((channels) => {
        this.channels.update((prev) => [...prev, ...channels]);

        const initialChannel = this.tvParams?.channel
          ? this.findChannelById(this.tvParams.channel)
          : channels[0];

        this.activeChannel.set(initialChannel);
        this.loading.set(false);
      });

    this.channelsPage++;
    this.subscriptions.add(channelSubscription);
  }

  // Private methods
  private initializeQueryParams(): void {
    const paramSubscription = this.route.queryParams.subscribe((params) => {
      if (!params) return;
      this.tvParams = {
        channel: params["channel"],
        program: params["program"],
      };
    });
    this.subscriptions.add(paramSubscription);
  }

  private loadPrograms(channelId: number): void {
    this.programsLoading.set(true);
    const date = this.getCurrentDateString();

    const programsSubscription = this.tvService
      .getPrograms(channelId, date)
      .subscribe((response) => {
        this.programs.set(response.tv.programs);

        const initialProgram = this.tvParams?.program
          ? this.findProgramByStartTime(this.tvParams.program)
          : this.findClosestProgram();

        if (initialProgram) this.setProgram(initialProgram);

        this.programsLoading.set(false);
      });
    this.subscriptions.add(programsSubscription);
  }

  private findChannelById(id: number): Channel | null {
    return this.channels().find((channel) => channel.id == id) || null;
  }

  private findProgramByStartTime(startTime: number): Program | null {
    return (
      this.programs()?.find((program) => program.start == startTime) || null
    );
  }

  private findClosestProgram(): Program | null {
    if (!this.programs()?.length) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    let minDifference = Number.MAX_SAFE_INTEGER;
    let closestIndex = 0;

    this.programs()?.forEach((program, index) => {
      const difference = Math.abs(program.start - currentTime);
      if (difference < minDifference) {
        minDifference = difference;
        closestIndex = index;
      }
    });

    return this.programs()![closestIndex - 1];
  }

  private scrollToActiveProgram(): void {
    setTimeout(() => {
      const activeButton = this.programButtons
        .toArray()
        .find((button) =>
          button.nativeElement.classList.value.includes("bg-primary-500/10"),
        );

      if (activeButton) {
        activeButton.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }

  private applyRouteParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.tvParams,
      queryParamsHandling: "merge",
    });
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().split("T")[0];
  }
}
