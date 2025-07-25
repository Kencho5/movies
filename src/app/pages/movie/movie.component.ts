import { Component, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MovieService } from "@core/services/movie.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { SharedModule } from "@shared/shared.module";
import { PlayerData } from "@core/interfaces/player";

@Component({
  selector: "app-movie",
  imports: [SharedModule, PlayerComponent],
  templateUrl: "./movie.component.html",
})
export class MovieComponent {
  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) {}

  movieID: string = "";
  movie = signal<any | null>(null);
  playerData = signal<PlayerData>({
    file: "",
    poster: "",
    autoplay: 0,
  });

  ngOnInit() {
    this.movieID = this.route.snapshot.paramMap.get("id")!;
    this.movieService.getMovie(this.movieID).subscribe((res) => {
      this.movie.set(res);

      this.playerData.set({
        file: this.movie()!.title.videos[0].src || null,
        poster: this.movie()?.title.backdrop || null,
        autoplay: 0,
      });
    });
  }
}
