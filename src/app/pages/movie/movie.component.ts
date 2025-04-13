import { Component, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TitleResponse } from "@core/interfaces/title";
import { HomeService } from "@core/services/home.service";
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
    private homeService: HomeService,
  ) {}

  movieID: string = "";
  movie = signal<TitleResponse | null>(null);
  playerData = signal<PlayerData>({
    file: "",
    poster: "",
    autoplay: 0,
  });

  ngOnInit() {
    this.movieID = this.route.snapshot.paramMap.get("id")!;
    this.homeService.getMovie(this.movieID).subscribe((res) => {
      this.movie.set(res);

      this.playerData.set({
        file: this.movie()!.title.videos[0].src || null,
        poster: this.movie()?.title.backdrop || null,
        autoplay: 0,
      });
    });
  }
}
