import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MoviesResponse } from "@core/interfaces/movies";
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

  getMovie(id: string): Observable<any> {
    return this.http.get<any>(apiUrl(`titles/${id}?loader=titlePage`));
  }

  getPerson(id: string): Observable<any> {
    return this.http.get<any>(apiUrl(`people/${id}`));
  }

  getSeries(page: number = 1): Observable<any> {
    return this.http.get<any>(
      apiUrl(
        `channel/series?channelType=channel&restriction=&loader=channelPage&page=${page}`,
      ),
    );
  }
}
