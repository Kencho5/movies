import {
  Component,
  signal,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  computed,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from "rxjs";
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
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { TimelineComponent } from "@shared/components/timeline/timeline.component";
import { PlayerControlsComponent } from "@shared/components/player-controls/player-controls.component";
import { TimelineSkeletonComponent } from "@shared/components/ui/timeline-skeleton/timeline-skeleton.component";
import { DaysSelectorComponent } from "@shared/components/days-selector/days-selector.component";
import { PreviewSkeletonComponent } from "@shared/components/ui/preview-skeleton/preview-skeleton.component";
import { TranslocoModule } from "@jsverse/transloco";

declare var Hls: any;

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
    DaysSelectorComponent,
    PreviewSkeletonComponent,
    TranslocoModule,
    FormsModule,
  ],
  templateUrl: "./tv.component.html",
})
export class TvComponent implements OnInit {
  @ViewChildren("programBtn") programButtons!: QueryList<ElementRef>;
  @ViewChild("previewPlayer", { static: false })
  videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild("searchInput", { static: false })
  searchInputRef!: ElementRef<HTMLInputElement>;

  // signals
  channels = signal<Channel[]>([]);
  activeChannel = signal<Channel | null>(null);
  programs = signal<Program[] | null>(null);
  activeProgram = signal<Program | null>(null);
  loading = signal<boolean>(true);
  previewLoading = signal<boolean>(true);
  programsLoading = signal<boolean>(true);
  playerData = signal<PlayerData | null>(null);
  previewPlayerData = signal<PlayerData | null>(null);
  hoveredChannel = signal<Channel | null>(null);
  sidebarOpen = signal<boolean>(false);
  programSidebarOpen = signal(false);
  programsCollapsed = signal<boolean>(true);
  programProgress = signal<number>(0);
  isLive = computed(() => !this.playerService.start());

  // search signals
  searchQuery = signal<string>("");
  searchResults = signal<Channel[]>([]);
  searchLoading = signal<boolean>(false);
  showSearchInput = signal<boolean>(false);
  displayChannels = computed(() =>
    this.searchQuery() ? this.searchResults() : this.channels(),
  );

  // search subject for debouncing
  private searchSubject = new Subject<string>();

  // parameters and timing
  tvParams: TvParams | null = null;
  channelsPage = 0;

  hoveredChannelPosition: number = 0;

  constructor(
    private tvService: TvService,
    public playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeQueryParams();
    if (this.tvParams?.channel! > 100)
      this.channelsPage = Math.floor(Number(this.tvParams?.channel! / 100));

    this.setupSearchSubscription();
    this.loadChannels();
  }

  loadChannels(): void {
    this.tvService.getChannels(this.channelsPage).subscribe((channels) => {
      this.channels.set(channels);

      const initialChannel = this.tvParams?.channel
        ? this.findChannelById(this.tvParams.channel)
        : channels[0];

      this.activeChannel.set(initialChannel);
      this.loadPrograms(initialChannel?.id!);
      this.loading.set(false);

      this.playerData.set({
        file: this.activeChannel()!.stream,
        poster: this.activeChannel()!.cover,
        autoplay: 1,
      });
    });

    this.channelsPage++;
  }

  updateChannels(): void {
    this.tvService.getChannels(this.channelsPage).subscribe((channels) => {
      this.channels.update((prev) => [...prev, ...channels]);
      this.loading.set(false);
    });
    this.channelsPage++;
  }

  changeChannel(selectedChannel: Channel): void {
    this.activeChannel.set(selectedChannel);
    this.tvParams = { channel: selectedChannel.id, start: null, stop: null };
    this.loadPrograms(selectedChannel.id);

    if (window.innerWidth < 768) this.sidebarOpen.set(false);
  }

  setProgram(program: Program): void {
    this.tvParams = {
      channel: this.activeChannel()!.id,
      start: program.start,
      stop: program.stop,
    };

    this.activeProgram.set(program);
    this.playerService.start.set(program.start);
    this.playerService.end = program.stop;

    this.applyRouteParams();
    this.scrollToActiveProgram();
    if (this.programSidebarOpen()) this.toggleSidebar("programs");
  }

  setActiveProgram(program: Program): void {
    if (!program || !this.activeChannel()) return;

    this.activeProgram.set(program);
    this.scrollToActiveProgram();

    if (this.programSidebarOpen()) this.toggleSidebar("programs");
  }

  timeSet(timestamp: number): void {
    this.tvParams = {
      channel: this.activeChannel()!.id,
      start: timestamp,
      stop: this.playerService.end,
    };
    this.applyRouteParams();
    this.setActiveProgram(this.findClosestProgram(timestamp)!);
  }

  daySelected(): void {
    this.loadPrograms(this.activeChannel()?.id!);
  }

  toggleSidebar(type: "channels" | "programs") {
    if (type === "channels") {
      this.sidebarOpen.update((state) => !state);
    } else if (type === "programs") {
      this.programSidebarOpen.update((state) => !state);
    }
  }

  toggleProgramsCollapse(): void {
    this.programsCollapsed.update((state) => !state);
  }

  togglePlayer(): void {
    const action = this.playerService.isPlaying() ? "pause" : "play";
    this.playerService.trigger(action);
  }

  seek(seconds: number): void {
    this.playerService.start.update((prev) => {
      const prevValue = Number(prev);
      return (prevValue || Math.floor(Date.now() / 1000)) + Number(seconds);
    });

    this.tvParams = {
      channel: this.activeChannel()?.id!,
      start: this.playerService.start(),
      stop: this.playerService.end,
    };

    this.applyRouteParams();
  }

  convertTimestampToHours(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  resetPlayer(): void {
    this.tvParams = null;
    this.playerData.set({
      file: this.activeChannel()!.stream,
      poster: this.activeChannel()!.cover,
      autoplay: 1,
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: [],
    });
    this.setActiveProgram(this.findClosestProgram()!);
  }

  hover(channel: Channel, event: MouseEvent): void {
    if (window.innerWidth < 768) return;

    this.hoveredChannelPosition = event.clientY - 20;

    this.hoveredChannel.set(channel);
    this.previewPlayerData.set({
      file: channel.thumbnail,
      poster: channel.cover,
      autoplay: 1,
    });

    this.previewLoading.set(true);

    setTimeout(() => {
      if (!this.videoRef) return;
      const video = this.videoRef.nativeElement;
      video.muted = true;

      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.thumbnail);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.thumbnail;
        video.addEventListener("canplay", () => video.play());
      }
    });
  }

  clearHover(): void {
    this.hoveredChannel.set(null);
    this.previewPlayerData.set(null);
  }

  toggleSearch(): void {
    this.showSearchInput.set(!this.showSearchInput());
    if (!this.showSearchInput()) {
      this.clearSearch();
    } else {
      setTimeout(() => {
        if (this.searchInputRef) {
          this.searchInputRef.nativeElement.focus();
        }
      }, 0);
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery());
  }

  clearSearch(): void {
    this.searchQuery.set("");
    this.searchResults.set([]);
    this.showSearchInput.set(false);
    this.searchLoading.set(false);
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            return of([]);
          }
          this.searchLoading.set(true);
          return this.tvService.searchChannels(query.trim());
        }),
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.searchLoading.set(false);
        },
        error: () => {
          this.searchResults.set([]);
          this.searchLoading.set(false);
        },
      });
  }

  // Private methods
  private initializeQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params) return;
      this.tvParams = {
        channel: params["channel"],
        start: params["start"],
        stop: params["stop"],
      };
      this.playerService.start.set(params["start"]);
    });
  }

  private loadPrograms(channelId: number): void {
    this.programsLoading.set(true);
    const date = this.playerService.dayOffset
      ? (() => {
          const d = new Date(this.playerService.dayOffset!);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })()
      : this.currentDateString;

    this.tvService.getPrograms(channelId, date).subscribe((response) => {
      this.programs.set(response.tv.programs);

      const initialProgram = this.tvParams?.start
        ? this.findProgramByStartTime(this.tvParams.start)
        : this.findClosestProgram();

      if (initialProgram) this.setActiveProgram(initialProgram);
      else
        this.setActiveProgram(this.findClosestProgram(this.tvParams?.start!)!);

      this.applyRouteParams();
      this.programsLoading.set(false);
    });
  }

  private findChannelById(id: number): Channel | null {
    return this.channels().find((channel) => channel.id == id) || null;
  }

  private findProgramByStartTime(startTime: number): Program | null {
    return (
      this.programs()?.find((program) => program.start == startTime) || null
    );
  }

  private findClosestProgram(timestamp?: number): Program | null {
    if (!this.programs()?.length) return null;

    const currentTime = timestamp ? timestamp : Math.floor(Date.now() / 1000);

    let minDifference = Number.MAX_SAFE_INTEGER;
    let closestIndex = 0;

    this.programs()?.forEach((program, index) => {
      const difference = currentTime - program.start;

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
    if (!this.tvParams?.channel) return;

    this.playerData.set({
      file: this.tvParams.start
        ? streamUrl(
            this.activeChannel()!.stream,
            this.tvParams.start!,
            this.tvParams.stop!,
          )
        : this.activeChannel()!.stream,
      poster: this.activeChannel()!.cover,
      autoplay: 1,
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.tvParams,
      queryParamsHandling: "merge",
    });
  }

  get currentDateString(): string {
    return new Date().toISOString().split("T")[0];
  }
}
