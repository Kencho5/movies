import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
  isDevMode,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { requestInterceptor } from "@core/interceptors/request.interceptor";
import { TranslocoHttpLoader } from "./transloco-loader";
import { provideTransloco } from "@jsverse/transloco";

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([requestInterceptor])),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ["en", "ru"],
        defaultLang: "ru",
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
