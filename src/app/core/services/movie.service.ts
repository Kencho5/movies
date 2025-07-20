import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MoviesResponse } from "@core/interfaces/movies";
import { TitleResponse } from "@core/interfaces/title";
import { apiUrl } from "app/utils/buildUrl";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MovieService {
  constructor(private http: HttpClient) {}

  getMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(
      apiUrl(
        "channel/11?restriction=&order=popularity:desc&page=1&paginate=simple&returnContentOnly=true",
      ),
    );
  }

  getMovie(id: string): Observable<TitleResponse> {
    return this.http.get<TitleResponse>(
      apiUrl(`titles/${id}?loader=titlePage`),
    );
  }
}
