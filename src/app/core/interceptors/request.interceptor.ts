import { HttpInterceptorFn } from "@angular/common/http";

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes("kino")) return next(req);

  const modifiedReq = req.clone({
    headers: req.headers.set(
      "Authorization",
      "Bearer 41|19z1p9h8BIGeNHjVFSwcU9P6p1LXDIl8L4PG05GM974ae1d4",
    ),
  });

  return next(modifiedReq);
};
