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
import { TimelineComponent } from "@shared/components/timeline/timeline.component";
import { PlayerControlsComponent } from "@shared/components/player-controls/player-controls.component";
import { TimelineSkeletonComponent } from "@shared/components/ui/timeline-skeleton/timeline-skeleton.component";

@Component({
  selector: "app-tv",
  imports: [
    SharedModule,
    PlayerComponent,
    ChannelsSkeletonComponent,
    ProgramsSkeletonComponent,
    InfiniteScrollDirective,
    TimelineComponent,
    TimelineSkeletonComponent,
    PlayerControlsComponent,
  ],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit, OnDestroy {
  @ViewChildren("programBtn") programButtons!: QueryList<ElementRef>;

  // Channel state signals
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  loading = signal<boolean>(true);

  // Program state signals
  programs = signal<Program[] | null>(null);
  activeProgram = signal<Program | null>(null);
  programsLoading = signal<boolean>(true);

  // Player and UI state signals
  playerData = signal<PlayerData | null>(null);
  sidebarOpen = signal<boolean>(false);
  programSidebarOpen = signal(false);

  // Time and navigation parameters
  tvParams: TvParams | null = null;
  dateOffset: number = (new Date().getTimezoneOffset() * 60 + 3 * 3600) * 1000;
  start: number = Math.floor((Date.now() + this.dateOffset) / 1000);
  end: number = Math.floor((Date.now() + this.dateOffset) / 1000);
  channelsPage = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private tvService: TvService,
    public playerService: PlayerService,
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

  // Channel-related methods
  loadChannels(): void {
    const channelSubscription = this.tvService
      .getChannels(this.channelsPage)
      .subscribe(this.handleChannelsLoaded.bind(this));

    this.channelsPage++;
    this.subscriptions.add(channelSubscription);
  }

  changeChannel(id: number): void {
    const selectedChannel = this.findChannelById(id);
    if (!selectedChannel) return;

    this.activeChannel.set(selectedChannel);
    this.tvParams = { channel: id, program: null };
    this.applyRouteParams();
    this.updatePlayer({ channel: selectedChannel });

    this.closeSidebarOnMobile();
  }

  // Program-related methods
  setProgram(program: Program): void {
    if (!this.activeChannel()) return;

    this.start = program.start;
    this.end = program.stop;

    this.activeProgram.set(program);
    this.updateTvParams(program);
    this.updatePlayer({ program });
    this.applyRouteParams();
    this.scrollToActiveProgram();

    if (this.programSidebarOpen()) {
      this.toggleSidebar("programs");
    }
  }

  setActiveProgram(program: Program): void {
    if (!program || !this.activeChannel()) return;

    this.activeProgram.set(program);
    this.scrollToActiveProgram();

    if (this.programSidebarOpen()) {
      this.toggleSidebar("programs");
    }
  }

  // UI-related methods
  toggleSidebar(type: "channels" | "programs") {
    if (type === "channels") {
      this.sidebarOpen.update((state) => !state);
    } else if (type === "programs") {
      this.programSidebarOpen.update((state) => !state);
    }
  }

  // Player control methods
  togglePlayer(): void {
    const action = this.playerService.isPlaying ? "pause" : "play";
    this.playerService.trigger(action);
  }

  seek(seconds: number): void {
    this.start += seconds;

    if (!this.activeChannel()) return;

    this.playerService.play(
      streamUrl(this.activeChannel()!.stream, this.start, this.end),
    );
  }

  // Utility methods
  convertTimestampToHours(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  get currentDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  // Private implementation methods
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

  private handleChannelsLoaded(channels: Channel[]): void {
    this.channels.update((prev) => [...prev, ...channels]);

    const initialChannel = this.tvParams?.channel
      ? this.findChannelById(this.tvParams.channel)
      : channels[0];

    this.activeChannel.set(initialChannel);
    this.loading.set(false);

    this.updatePlayer({ channel: initialChannel });
  }

  private loadPrograms(channelId: number): void {
    this.programsLoading.set(true);
    const date = this.currentDateString;

    this.tvService
      .getPrograms(channelId, date)
      .subscribe(this.handleProgramsLoaded.bind(this));
  }

  private handleProgramsLoaded(response: any): void {
    this.programs.set(response.tv.programs);

    const initialProgram = this.tvParams?.program
      ? this.findProgramByStartTime(this.tvParams.program)
      : this.findClosestProgram();

    if (initialProgram) this.setActiveProgram(initialProgram);

    this.programsLoading.set(false);
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

    const currentTime = Math.floor((Date.now() + this.dateOffset) / 1000);
    let minDifference = Number.MAX_SAFE_INTEGER;
    let closestIndex = 0;

    this.programs()?.forEach((program, index) => {
      const difference = program.start - currentTime;

      if (difference >= 0 && difference < minDifference) {
        minDifference = difference;
        closestIndex = index;
      }
    });

    return this.programs()![closestIndex];
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

  private updatePlayer(options: {
    channel?: Channel | null;
    program?: Program | null;
  }): void {
    const channel = options.channel || this.activeChannel();
    if (!channel) return;

    let file: string;

    if (options.program) file = streamUrl(channel.stream, this.start, this.end);
    else file = channel.stream;

    this.playerData.set({
      file,
      poster: channel.thumbnail,
      autoplay: 1,
    });
  }

  private updateTvParams(program: Program): void {
    if (!this.activeChannel()) return;

    this.tvParams = {
      channel: this.activeChannel()!.id,
      program: program.start,
    };
  }

  private closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }
}
