import { Component, computed, effect, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { combineLatest } from "rxjs";
import { map, switchMap, shareReplay, tap, startWith } from "rxjs/operators";
import { MovieService } from "@core/services/movie.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { ImageComponent } from "@shared/components/ui/image/image.component";
import { SharedModule } from "@shared/shared.module";
import { PlayerData } from "@core/interfaces/player";
import { Episode, Season } from "@core/interfaces/title";

@Component({
  selector: "app-watch",
  imports: [SharedModule, PlayerComponent, ImageComponent],
  templateUrl: "./watch.component.html",
})
export class WatchComponent {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);

  private readonly titleId$ = this.route.paramMap.pipe(
    map((params) => params.get("id")!),
  );

  private readonly movieData$ = this.titleId$.pipe(
    switchMap((id) => this.movieService.getMovie(id)),
    shareReplay(1),
  );

  readonly selectedSeasonNumber = signal(1);
  readonly episodesLoading = signal(false);
  readonly selectedEpisode = signal<Episode | null>(null);

  private readonly seasonData$ = combineLatest([
    this.titleId$,
    toObservable(this.selectedSeasonNumber),
  ]).pipe(
    tap(() => this.episodesLoading.set(true)),
    switchMap(([id, seasonNum]) => {
      if (seasonNum === 1) {
        return this.movieData$.pipe(map((data) => data.episodes?.data || []));
      }
      return this.movieService
        .getSeason(id, seasonNum)
        .pipe(map((data) => data.episodes?.data || []));
    }),
    tap(() => this.episodesLoading.set(false)),
    startWith([]),
  );

  private readonly movieData = toSignal(this.movieData$);
  readonly episodesForSeason = toSignal(this.seasonData$);

  readonly movie = computed(() => this.movieData()?.title);

  readonly seasons = computed(() => {
    const seasonsData = this.movieData()?.seasons?.data;
    return seasonsData
      ? [...seasonsData].sort((a, b) => a.number - b.number)
      : [];
  });

  readonly selectedSeason = computed(() =>
    this.seasons().find((s) => s.number === this.selectedSeasonNumber()),
  );

  readonly playerData = computed<PlayerData>(() => {
    const currentMovie = this.movie();
    if (!currentMovie) {
      return { file: "", poster: "", autoplay: 0 };
    }

    if (currentMovie.is_series) {
      const episode = this.selectedEpisode();
      const video = currentMovie.videos?.find(
        (v) => v.episode_id === episode?.id,
      );
      return {
        file: video?.src ?? "",
        poster: episode?.poster ?? currentMovie.backdrop ?? "",
        autoplay: 0,
      };
    }

    return {
      file: currentMovie.videos?.[0]?.src ?? "",
      poster: currentMovie.backdrop ?? "",
      autoplay: 0,
    };
  });

  constructor() {
    effect(() => {
      const episodes = this.episodesForSeason();
      if (episodes && episodes.length > 0) {
        this.selectedEpisode.set(episodes[0]);
      }
    });
  }

  onSeasonChange(season: Season): void {
    this.selectedSeasonNumber.set(season.number);
  }

  onEpisodeClick(episode: Episode): void {
    this.selectedEpisode.set(episode);
  }
}

