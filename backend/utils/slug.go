package utils

import (
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// Slugify converts a string to a URL-friendly slug
func Slugify(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)

	// Remove accents (diacritics)
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	s, _, _ = transform.String(t, s)

	// Replace non-alphanumeric characters with hyphens
	re := regexp.MustCompile("[^a-z0-9]+")
	s = re.ReplaceAllString(s, "-")

	// Trim leading and trailing hyphens
	s = strings.Trim(s, "-")

	return s
}

// CleanCollectionSlug removes "collection" related words before slugifying
func CleanCollectionSlug(name string) string {
	re := regexp.MustCompile(`(?i)\b(collection|coleccion|colección)\b`)
	cleaned := re.ReplaceAllString(name, "")
	return Slugify(strings.TrimSpace(cleaned))
}
