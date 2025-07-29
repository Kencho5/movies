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

  getMovies(page: number = 1, genres?: string[], fromYear?: number | null, toYear?: number | null, countries?: string[], languages?: string[]): Observable<any> {
    let url = `channel/movies?channelType=channel&restriction=&loader=channelPage&page=${page}`;

    if (genres && genres.length > 0) {
      url += `&genre=${genres.join(',')}`;
    }
    if (fromYear && toYear) {
      url += `&released=${fromYear},${toYear}`;
    } else if (fromYear) {
      url += `&released=${fromYear},`;
    } else if (toYear) {
      url += `&released=,${toYear}`;
    }
    if (countries && countries.length > 0) {
      url += `&country=${countries.join(',')}`;
    }
    if (languages && languages.length > 0) {
      url += `&language=${languages.join(',')}`;
    }

    console.log('API URL:', apiUrl(url));
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

  getSeries(page: number = 1): Observable<any> {
    return this.http.get<any>(
      apiUrl(
        `channel/series?channelType=channel&restriction=&loader=channelPage&page=${page}`,
      ),
    );
  }
}
