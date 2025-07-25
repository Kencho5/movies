import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { apiUrl } from "app/utils/buildUrl";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  constructor(private http: HttpClient) {}

  searchAutocomplete(text: string): Observable<any> {
    return this.http.get<any>(
      apiUrl(`search/${text}?loader=searchAutocomplete`),
    );
  }
}
