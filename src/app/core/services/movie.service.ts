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

  getMovies(
    page: number = 1,
    filters?: string,
  ): Observable<any> {
    let url = `channel/movies?channelType=channel&restriction=&loader=channelPage&page=${page}`;

    if (filters) {
      url += `&filters=${encodeURIComponent(filters)}`;
    }

    console.log("API URL:", apiUrl(url));
    return this.http.get<any>(apiUrl(url));
  }

  getHomeMovies(): Observable<MoviesResponse> {
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

  getSeries(page: number = 1, filters?: string): Observable<any> {
    let url = `channel/series?channelType=channel&restriction=&loader=channelPage&page=${page}`;
    if (filters) {
      url += `&filters=${encodeURIComponent(filters)}`;
    }
    return this.http.get<any>(apiUrl(url));
  }

  getFilters(): Observable<any> {
    return this.http.get<any>(
      apiUrl(
        "value-lists/titleFilterLanguages,productionCountries,genres,titleFilterAgeRatings",
      ),
    );
  }
}
