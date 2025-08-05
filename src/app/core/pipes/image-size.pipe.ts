import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "imageSize",
})
export class ImageSizePipe implements PipeTransform {
  transform(url: string | undefined, size: string = "w185"): string {
    if (!url) return "";
    return url.replace("/original/", `/${size}/`);
  }
}
