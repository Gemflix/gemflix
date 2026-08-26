package api

import "strings"

type TMDBTranslation struct {
	Iso639_1  string `json:"iso_639_1"`
	Iso3166_1 string `json:"iso_3166_1"`
	Data      struct {
		Title string `json:"title"`
		Name  string `json:"name"`
	} `json:"data"`
}

type TMDBTranslations struct {
	Translations []TMDBTranslation `json:"translations"`
}

type TMDBReleaseDateItem struct {
	Certification string `json:"certification"`
}

type TMDBReleaseDateResult struct {
	Iso3166_1    string                `json:"iso_3166_1"`
	ReleaseDates []TMDBReleaseDateItem `json:"release_dates"`
}

type TMDBReleaseDates struct {
	Results []TMDBReleaseDateResult `json:"results"`
}

type TMDBContentRatingResult struct {
	Iso3166_1 string `json:"iso_3166_1"`
	Rating    string `json:"rating"`
}

type TMDBContentRatings struct {
	Results []TMDBContentRatingResult `json:"results"`
}

func extractMovieTitles(translations TMDBTranslations) (lat, esp, eng string) {
	for _, t := range translations.Translations {
		lang := strings.ToLower(t.Iso639_1)
		cc := strings.ToUpper(t.Iso3166_1)
		title := strings.TrimSpace(t.Data.Title)
		if title == "" {
			continue
		}
		if lang == "es" {
			if cc == "MX" && lat == "" {
				lat = title
			} else if cc == "ES" && esp == "" {
				esp = title
			} else if lat == "" {
				lat = title
			}
		}
		if lang == "en" && eng == "" {
			eng = title
		}
	}
	return
}

func extractSerieTitles(translations TMDBTranslations) (lat, esp, eng string) {
	for _, t := range translations.Translations {
		lang := strings.ToLower(t.Iso639_1)
		cc := strings.ToUpper(t.Iso3166_1)
		name := strings.TrimSpace(t.Data.Name)
		if name == "" {
			continue
		}
		if lang == "es" {
			if cc == "MX" && lat == "" {
				lat = name
			} else if cc == "ES" && esp == "" {
				esp = name
			} else if lat == "" {
				lat = name
			}
		}
		if lang == "en" && eng == "" {
			eng = name
		}
	}
	return
}

func extractMovieCertification(releaseDates TMDBReleaseDates) string {
	fallback := ""
	for _, r := range releaseDates.Results {
		for _, d := range r.ReleaseDates {
			if d.Certification != "" {
				if strings.ToUpper(r.Iso3166_1) == "US" {
					return d.Certification
				}
				if fallback == "" {
					fallback = d.Certification
				}
			}
		}
	}
	return fallback
}

func extractSerieCertification(contentRatings TMDBContentRatings) string {
	fallback := ""
	for _, r := range contentRatings.Results {
		if r.Rating != "" {
			if strings.ToUpper(r.Iso3166_1) == "US" {
				return r.Rating
			}
			if fallback == "" {
				fallback = r.Rating
			}
		}
	}
	return fallback
}
