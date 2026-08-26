package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// MetadataProvider interface defines how to fetch extra images
type MetadataProvider interface {
	GetExtraImages(tmdbID int64, mediaType string) ([]MediaImage, error)
}

// MediaImage is the normalized struct for our DB
type MediaImage struct {
	FilePath    string
	Type        string // 'poster', 'backdrop', 'tvthumb', 'logo', 'clearart'
	Source      string // 'tmdb', 'fanart', 'tvdb'
	LanguageISO string
	IsMain      bool
}

// FanartProvider implements MetadataProvider for Fanart.tv
type FanartProvider struct {
	client *http.Client
}

func NewFanartProvider() *FanartProvider {
	return &FanartProvider{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (fp *FanartProvider) GetExtraImages(tmdbID int64, mediaType string) ([]MediaImage, error) {
	apiKey := os.Getenv("FANART_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("FANART_API_KEY not configured")
	}

	var endpoint string
	switch mediaType {
	case "movie":
		endpoint = fmt.Sprintf("http://webservice.fanart.tv/v3/movies/%d?api_key=%s", tmdbID, apiKey)
	case "serie":
		endpoint = fmt.Sprintf("http://webservice.fanart.tv/v3/tv/%d?api_key=%s", tmdbID, apiKey)
	default:
		return nil, fmt.Errorf("unsupported media type")
	}

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := fp.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fanart api returned status %d", resp.StatusCode)
	}

	var rawResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rawResponse); err != nil {
		return nil, err
	}

	var results []MediaImage

	// Helper to extract image arrays
	extractImages := func(key string, imgType string) {
		if arr, ok := rawResponse[key].([]interface{}); ok {
			for _, item := range arr {
				if imgMap, ok := item.(map[string]interface{}); ok {
					url, _ := imgMap["url"].(string)
					lang, _ := imgMap["lang"].(string)
					if url != "" {
						results = append(results, MediaImage{
							FilePath:    url,
							Type:        imgType,
							Source:      "fanart",
							LanguageISO: lang,
							IsMain:      false,
						})
					}
				}
			}
		}
	}

	if mediaType == "movie" {
		extractImages("movieposter", "poster")
		extractImages("moviebackground", "backdrop")
		extractImages("hdmovieclearart", "clearart")
		extractImages("hdmovielogo", "logo")
	} else {
		extractImages("tvposter", "poster")
		extractImages("showbackground", "backdrop")
		extractImages("tvthumb", "tvthumb")
		extractImages("hdtvlogo", "logo")
		extractImages("clearart", "clearart")
	}

	return results, nil
}
