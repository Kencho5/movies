import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { PersonResponse } from "@core/interfaces/person";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: "app-people",
  imports: [SharedModule, TranslocoModule],
  templateUrl: "./people.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleComponent implements OnInit {
  private personId = signal<string | null>(null);
  personData = signal<PersonResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<"acting" | "directing" | "writing" | "production" | null>(
    "acting"
  );
  biographyExpanded = signal(false);

  person = computed(() => this.personData()?.person || null);

  setActiveTab(
    tab: "acting" | "directing" | "writing" | "production" | null
  ): void {
    this.activeTab.set(this.activeTab() === tab ? null : tab);
  }

  isTabActive(tab: "acting" | "directing" | "writing" | "production"): boolean {
    return this.activeTab() === tab;
  }

  toggleBiography(): void {
    this.biographyExpanded.set(!this.biographyExpanded());
  }

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.personId.set(id);

    if (id) {
      this.loadPerson(id);
    } else {
      this.error.set("Invalid person ID");
    }
  }

  private loadPerson(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.movieService.getPerson(id).subscribe({
      next: (response: PersonResponse) => {
        this.personData.set(response);
        this.loading.set(false);
      },
      error: (_) => {
        this.error.set("Failed to load person data");
        this.loading.set(false);
      },
    });
  }
}