import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { requestInterceptor } from "@core/interceptors/request.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([requestInterceptor])),
  ],
};
