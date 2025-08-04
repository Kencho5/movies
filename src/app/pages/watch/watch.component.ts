import {
  Component,
  computed,
  effect,
  inject,
  signal,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Subject } from "rxjs";
import {
  map,
  switchMap,
  shareReplay,
  tap,
  startWith,
  takeUntil,
} from "rxjs/operators";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { MovieService } from "@core/services/movie.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { ImageComponent } from "@shared/components/ui/image/image.component";
import { LoadingDotsComponent } from "@shared/components/ui/loading-dots/loading-dots.component";
import { SharedModule } from "@shared/shared.module";

import { PlayerData } from "@core/interfaces/player";
import { Episode, Season, Title, Video } from "@core/interfaces/title";

@Component({
  selector: "app-watch",
  imports: [
    SharedModule,
    PlayerComponent,
    ImageComponent,
    LoadingDotsComponent,
  ],
  templateUrl: "./watch.component.html",
})
export class WatchComponent implements OnDestroy {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();

  @ViewChild("playerContainer") playerContainer!: ElementRef;

  readonly movieLoading = signal(false);
  readonly episodesLoading = signal(false);

  readonly selectedSeasonNumber = signal(1);
  readonly selectedEpisode = signal<Episode | null>(null);

  private readonly titleId$ = this.route.paramMap.pipe(
    map((params) => params.get("id")!),
    takeUntil(this.destroy$)
  );

  private readonly movieData$ = this.titleId$.pipe(
    tap(() => this.movieLoading.set(true)),
    switchMap((id) => this.movieService.getMovie(id)),
    tap(() => this.movieLoading.set(false)),
    shareReplay(1)
  );

  private readonly seasonData$ = combineLatest([
    this.titleId$,
    toObservable(this.selectedSeasonNumber),
  ]).pipe(
    tap(() => this.episodesLoading.set(true)),
    switchMap(([id, seasonNum]) => this.getSeasonEpisodes(id, seasonNum)),
    tap(() => this.episodesLoading.set(false)),
    startWith([])
  );

  readonly movieData = toSignal(this.movieData$);
  readonly episodesForSeason = toSignal(this.seasonData$);

  readonly movie = computed(() => this.movieData()?.title);
  readonly credits = computed(() => this.movieData()?.credits);

  readonly seasons = computed(() => {
    const seasonsData = this.movieData()?.seasons?.data;
    return seasonsData?.sort((a, b) => a.number - b.number) ?? [];
  });

  readonly selectedSeason = computed(() =>
    this.seasons().find((s) => s.number === this.selectedSeasonNumber())
  );

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const movie = this.movie();
    if (!movie) return null;

    const video = this.getActiveVideo(movie);
    return video?.src
      ? this.sanitizer.bypassSecurityTrustResourceUrl(video.src)
      : null;
  });

  readonly playerData = computed<PlayerData>(() => {
    const movie = this.movie();
    if (!movie || this.embedUrl()) {
      return { file: "", poster: "", autoplay: 0 };
    }

    const video = this.getActiveVideo(movie, false);
    const poster =
      movie.is_series && this.selectedEpisode()?.poster
        ? this.selectedEpisode()?.poster
        : movie.backdrop;

    return {
      file: video?.src ?? "",
      poster: poster ?? "",
      autoplay: 0,
    };
  });

  constructor() {
    effect(() => {
      const episodes = this.episodesForSeason();
      if (episodes?.length) {
        this.selectedEpisode.set(episodes[0]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: Season): void {
    this.selectedSeasonNumber.set(season.number);
  }

  onEpisodeClick(episode: Episode): void {
    this.selectedEpisode.set(episode);
  }

  watchNow(): void {
    this.playerContainer.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  private getSeasonEpisodes(id: string, seasonNum: number) {
    if (seasonNum === 1) {
      return this.movieData$.pipe(map((data) => data.episodes?.data ?? []));
    }
    return this.movieService
      .getSeason(id, seasonNum)
      .pipe(map((data) => data.episodes?.data ?? []));
  }

  private getActiveVideo(
    movie: Title,
    isEmbed: boolean = true
  ): Video | undefined {
    if (movie.is_series) {
      const episode = this.selectedEpisode();
      if (!episode) return undefined;

      return movie.videos?.find(
        (v) =>
          v.episode_id === episode.id &&
          (isEmbed ? v.type === "embed" : v.type !== "embed")
      );
    }

    return movie.videos?.find((v) =>
      isEmbed ? v.type === "embed" : v.type !== "embed"
    );
  }
}