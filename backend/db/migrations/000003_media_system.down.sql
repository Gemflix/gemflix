-- Revertir Migración Fase 4: Media System

DROP TABLE IF EXISTS media_playback_sessions CASCADE;
DROP TABLE IF EXISTS media_subtitle_tracks CASCADE;
DROP TABLE IF EXISTS media_audio_tracks CASCADE;
DROP TABLE IF EXISTS media_sources CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
