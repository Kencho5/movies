import { Injectable } from "@angular/core";
import { signal } from "@angular/core";
import { TranslocoService } from "@jsverse/transloco";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  constructor(private translate: TranslocoService) {}
  private lang = signal(localStorage.getItem("lang") || "ru");

  get currentLang() {
    return this.lang();
  }

  setLanguage(lang: string) {
    this.lang.set(lang);
    this.translate.setActiveLang(lang);
    localStorage.setItem("lang", lang);
  }
}
