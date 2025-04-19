import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Channel } from "@core/interfaces/tv";
import { delay, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TvService {
  constructor(private http: HttpClient) {}

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(
      "https://api.oho.ge/tv/streaming/channels/?page=1",
    );
    //.pipe(delay(800));
  }
}
