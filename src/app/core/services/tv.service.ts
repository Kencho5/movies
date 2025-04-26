import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Channel, ProgramsResponse } from "@core/interfaces/tv";
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
    //.pipe(delay(400));
  }

  getPrograms(id: number, date: string): Observable<ProgramsResponse> {
    const params = new HttpParams().set("channel_id", id).set("date", date);

    return this.http.get<ProgramsResponse>(
      "https://api.oho.ge/tv/streaming/programs/",
      {
        params,
      },
    );
    //.pipe(delay(700));
  }
}
