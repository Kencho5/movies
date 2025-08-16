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
import { ActivatedRoute, Router } from "@angular/router";
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
import { TranslocoModule } from "@jsverse/transloco";
import { ImageSizePipe } from "@core/pipes/image-size.pipe";

@Component({
  selector: "app-watch",
  imports: [
    SharedModule,
    PlayerComponent,
    ImageComponent,
    LoadingDotsComponent,
    TranslocoModule,
    ImageSizePipe,
  ],
  templateUrl: "./watch.component.html",
})
export class WatchComponent implements OnDestroy {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();

  @ViewChild("playerContainer") playerContainer!: ElementRef;

  readonly movieLoading = signal(false);
  readonly episodesLoading = signal(false);

  readonly selectedSeasonNumber = signal(1);
  readonly selectedEpisodeNumber = signal(1);
  readonly selectedEpisode = signal<Episode | null>(null);

  private readonly titleId$ = this.route.paramMap.pipe(
    map((params) => params.get("id")!),
    takeUntil(this.destroy$),
  );

  private readonly movieData$ = this.titleId$.pipe(
    tap(() => this.movieLoading.set(true)),
    switchMap((id) => this.movieService.getMovie(id)),
    tap(() => this.movieLoading.set(false)),
    shareReplay(1),
  );

  private readonly seasonData$ = combineLatest([
    this.titleId$,
    toObservable(this.selectedSeasonNumber),
  ]).pipe(
    tap(() => this.episodesLoading.set(true)),
    switchMap(([id, seasonNum]) => this.getSeasonEpisodes(id, seasonNum)),
    tap(() => this.episodesLoading.set(false)),
    startWith([]),
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
    this.seasons().find((s) => s.number === this.selectedSeasonNumber()),
  );

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const movie = this.movie();
    if (!movie) return null;

    const video = this.getActiveVideo(movie);
    if (!video?.src) return null;

    let src = video.src;
    
    if (movie.is_series && this.selectedEpisode()) {
      const episode = this.selectedEpisode()!;
      const url = new URL(src);
      
      if (url.searchParams.has('season') && url.searchParams.has('episode')) {
        url.searchParams.set('season', episode.season_number.toString());
        url.searchParams.set('episode', episode.episode_number.toString());
        src = url.toString();
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
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
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const urlSeason = params['season'];
      const urlEpisode = params['episode'];
      
      if (urlSeason) {
        const seasonNum = parseInt(urlSeason, 10);
        if (!isNaN(seasonNum)) {
          this.selectedSeasonNumber.set(seasonNum);
        }
      }
      
      if (urlEpisode) {
        const episodeNum = parseInt(urlEpisode, 10);
        if (!isNaN(episodeNum)) {
          this.selectedEpisodeNumber.set(episodeNum);
        }
      }
    });

    effect(() => {
      const episodes = this.episodesForSeason();
      const targetEpisodeNumber = this.selectedEpisodeNumber();
      
      if (episodes?.length) {
        const targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);
        this.selectedEpisode.set(targetEpisode || episodes[0]);
        
        if (targetEpisode) {
          this.selectedEpisodeNumber.set(targetEpisode.episode_number);
        } else if (episodes[0]) {
          this.selectedEpisodeNumber.set(episodes[0].episode_number);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: Season): void {
    this.selectedSeasonNumber.set(season.number);
    this.selectedEpisodeNumber.set(1);
    this.updateUrlParams();
  }

  onEpisodeClick(episode: Episode): void {
    this.selectedEpisode.set(episode);
    this.selectedEpisodeNumber.set(episode.episode_number);
    this.updateUrlParams();
  }

  watchNow(): void {
    this.playerContainer.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  private updateUrlParams(): void {
    const queryParams = {
      season: this.selectedSeasonNumber().toString(),
      episode: this.selectedEpisodeNumber().toString()
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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
    isEmbed: boolean = true,
  ): Video | undefined {
    const typeFilter = isEmbed ? (v: Video) => v.type === "embed" : (v: Video) => v.type !== "embed";
    
    if (movie.is_series) {
      const episode = this.selectedEpisode();
      if (!episode) return undefined;

      let video = movie.videos?.find(
        (v) =>
          v.episode_id === episode.id && typeFilter(v)
      );

      if (!video) {
        video = movie.videos?.find(
          (v) =>
            v.season_num === episode.season_number &&
            v.episode_num === episode.episode_number &&
            typeFilter(v)
        );
      }

      if (!video) {
        video = movie.videos?.find(
          (v) =>
            v.season_num === episode.season_number && typeFilter(v)
        );
      }

      if (!video) {
        video = movie.videos?.find(typeFilter);
      }

      return video;
    }

    return movie.videos?.find(typeFilter);
  }
}
