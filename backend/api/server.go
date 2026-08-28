package api

import (
	"net/http"

	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/redis/go-redis/v9"
)

// Server maneja las rutas de la API
type Server struct {
	db          *db.Queries
	redisClient *redis.Client
	router      chi.Router
}

// NewServer inicializa el servidor y el enrutador con Chi
func NewServer(db *db.Queries, redisClient *redis.Client) *Server {
	s := &Server{
		db:          db,
		redisClient: redisClient,
		router:      chi.NewRouter(),
	}
	s.setupMiddlewares()
	s.routes()
	return s
}

func (s *Server) setupMiddlewares() {
	s.router.Use(middleware.Logger)
	s.router.Use(middleware.Recoverer)

	// Configuración de CORS para desarrollo con Next.js
	s.router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://*.localhost:3000"}, // Permitir puertos locales
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}

func (s *Server) routes() {
	// Agrupamos las rutas de la API (ahora en la raíz del backend ya que corre en api.gemflix.org)
	s.router.Group(func(r chi.Router) {

		// Auth
		r.Route("/auth", func(r chi.Router) {
			r.Post("/login", s.handleLogin)
			r.Post("/logout", s.AuthMiddleware(s.handleLogout))
			r.Get("/me", s.handleAuthMe)
		})

		// Drive Worker (Cloudflare Edge Worker Integration)
		r.Route("/drive/worker", func(r chi.Router) {
			r.Use(s.WorkerSecretMiddleware)
			r.Post("/validate-ticket", s.handleWorkerValidateTicket)
			r.Post("/origin-credentials", s.handleWorkerOriginCredentials)
			r.Post("/security-event", s.handleWorkerSecurityEvent)
		})

		// Play (VOD Públicos y Protegidos)
		r.Route("/play", func(r chi.Router) {
			r.Get("/settings", s.handleGetSettings)
			r.Get("/home", s.handleGetVODHome) // Handles its own auth based on public_catalog setting
			r.Get("/catalog/movies", s.HandleCatalogMovies)
			r.Get("/catalog/series", s.HandleCatalogSeries)
			r.Get("/explore/collections", s.HandleGetExploreCollections)
			r.Get("/explore/networks", s.HandleGetExploreNetworks)
			r.Get("/explore/countries", s.HandleGetExploreCountries)
			r.Get("/explore/casts", s.HandleGetExploreCasts)
			r.Get("/explore/genres", s.HandleGetExploreGenres)

			// Protegidos
			r.Group(func(r chi.Router) {
				r.Use(s.AuthMiddlewareChi)
				r.Get("/profiles", s.handleGetProfiles)
				r.Post("/community/requests", s.HandleCreateMediaRequest)
				r.Get("/community/requests", s.HandleListMediaRequests)
				r.Post("/community/reports", s.HandleCreateMediaReport)
				r.Get("/community/reports", s.HandleListMediaReports)

				r.Get("/billing/subscriptions/me", s.HandleGetActiveSubscriptions)
			})

			// Públicos o protegidos dependiendo de si quieres que vean planes sin login
			r.Get("/billing/plans", s.HandleListActivePlans)
		})

		// Admin (Protegidos con RBAC)
		r.Route("/admin", func(r chi.Router) {
			r.Use(s.AuthMiddlewareChi)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/stats", s.handleGetStats)
			r.With(s.RequirePermissionChi("manage_users")).Get("/users", s.handleGetUsers)
			r.With(s.RequirePermissionChi("manage_users")).Get("/staff", s.handleGetStaff)
			r.With(s.RequirePermissionChi("manage_users")).Post("/staff", s.handleCreateStaff)
			r.With(s.RequirePermissionChi("manage_users")).Get("/roles", s.handleGetRoles)
			r.With(s.RequirePermissionChi("manage_users")).Post("/roles", s.handleCreateRole)
			r.With(s.RequirePermissionChi("manage_users")).Get("/permissions", s.handleGetPermissions)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/movies", s.handleGetMovies)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/movies", s.handleCreateMovie)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/movies/{id}", s.handleGetMovieDetails)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/movies/{id}", s.handleUpdateMovie)
			r.With(s.RequirePermissionChi("manage_movies")).Patch("/movies/{id}/toggle", s.handleToggleMediaAttr)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/movies/{id}", s.handleDeleteMovie)

			r.With(s.RequirePermissionChi("manage_series")).Get("/series", s.handleGetAdminSeriesList)
			r.With(s.RequirePermissionChi("manage_series")).Post("/series", s.handleCreateSerie)
			r.With(s.RequirePermissionChi("manage_series")).Get("/series/{id}", s.handleGetSerieDetails)
			r.With(s.RequirePermissionChi("manage_series")).Put("/series/{id}", s.handleUpdateSerie)
			r.With(s.RequirePermissionChi("manage_series")).Patch("/series/{id}/toggle", s.handleToggleMediaAttr)
			r.With(s.RequirePermissionChi("manage_series")).Delete("/series/{id}", s.handleDeleteSerie)
			r.With(s.RequirePermissionChi("manage_series")).Get("/series/{id}/seasons", s.handleGetSerieSeasons)
			r.With(s.RequirePermissionChi("manage_series")).Put("/episodes/{id}", s.handleUpdateEpisode)
			r.With(s.RequirePermissionChi("manage_series")).Patch("/episodes/{id}/toggle", s.handleToggleEpisodeAttribute)
			r.With(s.RequirePermissionChi("manage_series")).Get("/episodes/{episodeId}/media-sources", s.handleGetEpisodeMediaSources)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/movies/{movieId}/media-sources", s.handleGetMovieMediaSources)
			r.With(s.RequirePermissionChi("manage_series")).Post("/media-sources", s.handleCreateMediaSource)
			r.With(s.RequirePermissionChi("manage_series")).Delete("/media-sources/{id}", s.handleDeleteMediaSource)

			r.With(s.RequirePermissionChi("manage_series")).Get("/media-sources/{id}/audios", s.handleGetMediaAudioTracks)
			r.With(s.RequirePermissionChi("manage_series")).Post("/media-sources/{id}/audios", s.handleCreateMediaAudioTrack)
			r.With(s.RequirePermissionChi("manage_series")).Delete("/audios/{id}", s.handleDeleteMediaAudioTrack)

			r.With(s.RequirePermissionChi("manage_series")).Get("/media-sources/{id}/subtitles", s.handleGetMediaSubtitleTracks)
			r.With(s.RequirePermissionChi("manage_series")).Post("/media-sources/{id}/subtitles", s.handleCreateMediaSubtitleTrack)
			r.With(s.RequirePermissionChi("manage_series")).Delete("/subtitles/{id}", s.handleDeleteMediaSubtitleTrack)

			r.With(s.RequirePermissionChi("manage_devices")).Get("/devices", s.handleGetDevices)
			r.With(s.RequirePermissionChi("manage_settings")).Post("/settings", s.handleUpdateSettings)
			r.With(s.RequirePermissionChi("manage_settings")).Post("/settings/logo", s.handleUploadLogo)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/tmdb/search", s.handleTMDBSearch)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/tmdb/search-images", s.handleTMDBSearchImages)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/ia/rewrite", s.handleRewriteOverview)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/media-images/set-main", s.handleSetMainMediaImage)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/media-images/search", s.handleSearchMediaImages)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/media-images", s.handleAddMediaImage)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/media-images/{imageId}", s.handleDeleteMediaImage)

			// YouTube
			r.With(s.RequirePermissionChi("manage_movies")).Get("/youtube/search", s.handleYouTubeSearch)

			// Relations (Casts, Genres, Networks)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/search/{type}", s.handleSearchRelation)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/{mediaType}/{id}/{relationType}", s.handleAddRelation)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/{mediaType}/{mediaId}/{relationType}/{relationId}", s.handleDeleteRelation)

			// Relation Lists (CRUD)
			r.With(s.RequirePermissionChi("manage_movies")).Get("/collections", s.handleGetCollectionsList)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/collections", s.handleCreateCollection)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/collections/{id}", s.handleUpdateCollection)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/collections/{id}", s.handleDeleteCollection)

			r.With(s.RequirePermissionChi("manage_movies")).Get("/networks", s.handleGetNetworksList)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/networks", s.handleCreateNetwork)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/networks/{id}", s.handleUpdateNetwork)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/networks/{id}", s.handleDeleteNetwork)

			r.With(s.RequirePermissionChi("manage_movies")).Get("/genres", s.handleGetGenresList)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/genres", s.handleCreateGenre)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/genres/{id}", s.handleUpdateGenre)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/genres/{id}", s.handleDeleteGenre)

			r.With(s.RequirePermissionChi("manage_movies")).Get("/casts", s.handleGetCastsList)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/casts", s.handleCreateCast)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/casts/{id}", s.handleUpdateCast)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/casts/{id}", s.handleDeleteCast)

			r.With(s.RequirePermissionChi("manage_movies")).Get("/countries", s.handleGetCountriesList)
			r.With(s.RequirePermissionChi("manage_movies")).Post("/countries", s.handleCreateCountry)
			r.With(s.RequirePermissionChi("manage_movies")).Put("/countries/{id}", s.handleUpdateCountry)
			r.With(s.RequirePermissionChi("manage_movies")).Delete("/countries/{id}", s.handleDeleteCountry)

			// GemDrive Admin
			r.With(s.RequirePermissionChi("manage_settings")).Get("/drive/accounts", s.handleGetDriveAccounts)
			r.With(s.RequirePermissionChi("manage_settings")).Post("/drive/accounts", s.handleCreateDriveAccount)
			r.With(s.RequirePermissionChi("manage_settings")).Get("/drive/sources", s.handleGetDriveSources)
			r.With(s.RequirePermissionChi("manage_settings")).Post("/drive/sources", s.handleCreateDriveSource)
			r.With(s.RequirePermissionChi("manage_settings")).Get("/drive/replicas", s.handleGetDriveReplicas)
			r.With(s.RequirePermissionChi("manage_settings")).Post("/drive/replicas", s.handleCreateDriveReplica)
			r.With(s.RequirePermissionChi("manage_settings")).Get("/drive/monitor", s.handleGetDriveMonitorStats)
		})
	})
}

// ServeHTTP implementa http.Handler
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
