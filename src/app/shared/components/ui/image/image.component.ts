import { Component, Input } from "@angular/core";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-image",
  imports: [SharedModule],
  templateUrl: "./image.component.html",
})
export class ImageComponent {
  @Input() src?: string;
  @Input() width?: number = 200;
  @Input() height?: number = 200;
  @Input() loading?: string;
  @Input() customClass: string = "";
  @Input() alt?: string;

  imageLoaded = false;

  onImageLoad() {
    this.imageLoaded = true;
  }
}
