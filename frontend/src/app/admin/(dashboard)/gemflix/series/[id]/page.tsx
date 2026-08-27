"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Sparkles, Trash2, Film, Users, Globe, Image as ImageIcon, Star, Edit3, Lock, PlaySquare, Link as LinkIcon, X, Plus } from "lucide-react";
import RelationSelector from "@/components/admin/RelationSelector";
import { YouTubeSearchModal } from "@/components/admin/YouTubeSearchModal";

const Switch = ({ checked, onChange, disabled }: any) => (
  <button 
    type="button" 
    disabled={disabled}
    onClick={() => onChange(!checked)} 
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-white/20'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function EditSeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [serie, setSerie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("detalles");
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  const [editingEpisode, setEditingEpisode] = useState<any>(null);
  const [managingEpisode, setManagingEpisode] = useState<any>(null);
  const [mediaSources, setMediaSources] = useState<any[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [newSource, setNewSource] = useState({ 
    label: '', type: 'directo', quality: '1080p', link: '', videoCodec: '', audioChannels: '', dynamicRange: '', sizeBytes: 0, bitDepth: 8, durationSec: 0,
    recapStart: 0, recapEnd: 0, openingStart: 0, openingEnd: 0, endingStart: 0, endingEnd: 0
  });

  const [managingMediaSource, setManagingMediaSource] = useState<any>(null);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [newAudio, setNewAudio] = useState({ lang: 'es', codec: 'aac', channelLayout: '2.0', bitrateKbps: 128, trackNo: 1, title: '' });
  const [newSubtitle, setNewSubtitle] = useState({ lang: 'es', type: 'vtt', link: '', trackNo: 1, title: '' });

  const [isEditing, setIsEditing] = useState(false);

  // Formularios editables
  const [originalName, setOriginalName] = useState("");
  const [slug, setSlug] = useState("");
  const [titleLat, setTitleLat] = useState("");
  const [titleEsp, setTitleEsp] = useState("");
  const [titleEng, setTitleEng] = useState("");
  const [overview, setOverview] = useState("");
  const [trailerKey, setTrailerKey] = useState("");
  const [firstAirDate, setFirstAirDate] = useState("");
  const [episodeRunTime, setEpisodeRunTime] = useState(0);
  const [active, setActive] = useState(true);
  const [voteAverage, setVoteAverage] = useState(0.0);
  const [voteCount, setVoteCount] = useState(0);
  const [certification, setCertification] = useState("");

  const [status, setStatus] = useState("Publicado");
  const [premium, setPremium] = useState(false);
  const [premiere, setPremiere] = useState(false);
  const [upcoming, setUpcoming] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  // Gallery Search Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [searchImages, setSearchImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const res = await fetch(`/api/admin/series/${id}`, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          else throw new Error("Error fetching");
          return;
        }
        const data = await res.json();
        setSerie(data);
        setOriginalName(data.original_name || "");
        setSlug(data.slug || "");
        setTitleLat(typeof data.title_lat === 'string' ? data.title_lat : (data.title_lat?.String || ""));
        setTitleEsp(typeof data.title_esp === 'string' ? data.title_esp : (data.title_esp?.String || ""));
        setTitleEng(typeof data.title_eng === 'string' ? data.title_eng : (data.title_eng?.String || ""));
        setOverview(typeof data.overview === 'string' ? data.overview : (data.overview?.String || ""));
        setTrailerKey(typeof data.trailer_key === 'string' ? data.trailer_key : (data.trailer_key?.String || ""));

        let airDate = "";
        if (data.first_air_date) {
            if (typeof data.first_air_date === 'string') airDate = data.first_air_date.split('T')[0];
            else if (data.first_air_date.Time) airDate = new Date(data.first_air_date.Time).toISOString().split('T')[0];
        }
        setFirstAirDate(airDate);

        setEpisodeRunTime(typeof data.episode_run_time === 'number' ? data.episode_run_time : (data.episode_run_time?.Int16 || 0));
        setActive(data.active);
        setVoteAverage(typeof data.vote_average === 'number' ? data.vote_average : parseFloat(data.vote_average) || 0);
        setVoteCount(data.vote_count || 0);
        setCertification(typeof data.certification === 'string' ? data.certification : (data.certification?.String || ""));

        setStatus(data.active ? "Publicado" : "Borrador");
        setPremium(data.premium || false);
        setPremiere(data.premiere || false);
        setUpcoming(data.upcoming || false);
      } catch (error) {
        console.error(error);
        alert("Error cargando la serie");
        router.push("/admin/gemflix/series");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchSeasons = async () => {
      setLoadingSeasons(true);
      try {
        const res = await fetch(`/api/admin/series/${id}/seasons`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSeasons(data || []);
        }
      } catch (e) {
        console.error("Error fetching seasons", e);
      } finally {
        setLoadingSeasons(false);
      }
    };

    fetchSerie();
    fetchSeasons();
  }, [id, router]);

  const handleToggleEpisode = async (episodeId: number, field: string, value: boolean) => {
    try {
      const res = await fetch(`/api/admin/episodes/${episodeId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error("Error toggling");
      
      setSeasons(prevSeasons => prevSeasons.map(s => ({
        ...s,
        episodes: s.episodes.map((e: any) => e.id === episodeId ? { ...e, [field]: value } : e)
      })));
      toast.success("Episodio actualizado");
    } catch {
      toast.error("Error al actualizar episodio");
    }
  };

  const openLinksModal = async (ep: any) => {
    setManagingEpisode(ep);
    setLoadingSources(true);
    setMediaSources([]);
    try {
      const res = await fetch(`/api/admin/episodes/${ep.id}/media-sources`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMediaSources(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSources(false);
    }
  };

  const openMediaSourceDetails = async (ms: any) => {
    setManagingMediaSource(ms);
    try {
      const resA = await fetch(`/api/admin/media-sources/${ms.id}/audios`, { credentials: "include" });
      if (resA.ok) setAudioTracks((await resA.json()) || []);
      const resS = await fetch(`/api/admin/media-sources/${ms.id}/subtitles`, { credentials: "include" });
      if (resS.ok) setSubtitleTracks((await resS.json()) || []);
    } catch(e) { console.error(e); }
  };

  const handleAddAudio = async () => {
    try {
      const res = await fetch(`/api/admin/media-sources/${managingMediaSource.id}/audios`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ...newAudio, track_no: Number(newAudio.trackNo), bitrate_kbps: Number(newAudio.bitrateKbps) })
      });
      if(res.ok) {
        setAudioTracks([...audioTracks, await res.json()]);
        setNewAudio({ ...newAudio, trackNo: newAudio.trackNo + 1 });
        toast.success("Audio agregado");
      }
    } catch { toast.error("Error al agregar audio"); }
  };

  const handleDeleteAudio = async (id: number) => {
    if(!confirm("¿Borrar audio?")) return;
    try {
      const res = await fetch(`/api/admin/audios/${id}`, { method: "DELETE", credentials: "include" });
      if(res.ok) { setAudioTracks(audioTracks.filter(a => a.id !== id)); toast.success("Borrado"); }
    } catch { toast.error("Error"); }
  };

  const handleAddSubtitle = async () => {
    try {
      const res = await fetch(`/api/admin/media-sources/${managingMediaSource.id}/subtitles`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ...newSubtitle, track_no: Number(newSubtitle.trackNo) })
      });
      if(res.ok) {
        setSubtitleTracks([...subtitleTracks, await res.json()]);
        setNewSubtitle({ ...newSubtitle, trackNo: newSubtitle.trackNo + 1, link: '' });
        toast.success("Subtítulo agregado");
      }
    } catch { toast.error("Error al agregar subtítulo"); }
  };

  const handleDeleteSubtitle = async (id: number) => {
    if(!confirm("¿Borrar subtítulo?")) return;
    try {
      const res = await fetch(`/api/admin/subtitles/${id}`, { method: "DELETE", credentials: "include" });
      if(res.ok) { setSubtitleTracks(subtitleTracks.filter(s => s.id !== id)); toast.success("Borrado"); }
    } catch { toast.error("Error"); }
  };

  const handleAddSource = async () => {
    try {
      const res = await fetch(`/api/admin/media-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...newSource, episode_id: managingEpisode.id })
      });
      if (res.ok) {
        const data = await res.json();
        setMediaSources([...mediaSources, data]);
        toast.success("Enlace agregado");
        setNewSource({ 
          label: '', type: 'directo', quality: '1080p', link: '', videoCodec: '', audioChannels: '', dynamicRange: '', sizeBytes: 0, bitDepth: 8, durationSec: 0,
          recapStart: 0, recapEnd: 0, openingStart: 0, openingEnd: 0, endingStart: 0, endingEnd: 0 
        });
      }
    } catch {
      toast.error("Error al agregar");
    }
  };

  const handleDeleteSource = async (id: number) => {
    if(!confirm("¿Borrar enlace?")) return;
    try {
      const res = await fetch(`/api/admin/media-sources/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setMediaSources(mediaSources.filter(s => s.id !== id));
        toast.success("Enlace borrado");
      }
    } catch {
      toast.error("Error al borrar");
    }
  };

  const handleSaveEpisodeMeta = async () => {
    try {
      const res = await fetch(`/api/admin/episodes/${editingEpisode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingEpisode)
      });
      if (res.ok) {
        toast.success("Episodio guardado");
        setSeasons(seasons.map(s => ({
          ...s,
          episodes: s.episodes.map((e:any) => e.id === editingEpisode.id ? editingEpisode : e)
        })));
        setEditingEpisode(null);
      }
    } catch {
      toast.error("Error guardando episodio");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          original_name: originalName,
          slug,
          title_lat: titleLat, 
          title_esp: titleEsp,
          title_eng: titleEng,
          overview, 
          trailer_key: trailerKey,
          first_air_date: firstAirDate,
          episode_run_time: Number(episodeRunTime),
          active,
          vote_average: Number(voteAverage),
          vote_count: Number(voteCount),
          certification,
          status,
          premium,
          premiere,
          upcoming
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error saving");
      toast.success("Guardado correctamente");
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar esta serie permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/series/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error borrando");
      router.push("/admin/gemflix/series");
    } catch (e) {
      alert("Error al borrar");
    }
  };

  const improveOverview = async () => {
    if (!overview) return alert("La sinopsis está vacía");
    setIsImproving(true);
    try {
      const res = await fetch("/api/admin/ia/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overview, title: titleLat }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error IA");
      const data = await res.json();
      setOverview(data.overview);
    } catch (e) {
      alert("Error con la IA de Groq");
    } finally {
      setIsImproving(false);
    }
  };

  const setMainImage = async (imageId: number, type: string) => {
    if (!isEditing) return;
    try {
      const res = await fetch("/api/admin/media-images/set-main", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, type, serie_id: serie.id }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error set main image");
      // Recargar datos
      const resData = await fetch(`/api/admin/series/${id}`, { credentials: "include" });
      const newData = await resData.json();
      setSerie(newData);
    } catch (e) {
      alert("Error al asignar imagen");
    }
  };

  const fetchMoreImages = async () => {
    setIsImageModalOpen(true);
    setIsSearchingImages(true);
    setSearchImages([]);
    setSelectedImages(new Set());
    try {
      const res = await fetch(`/api/admin/media-images/search?tmdb_id=${serie.tmdb_id}&type=serie`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching images");
      const data = await res.json();
      setSearchImages(data || []);
    } catch (e) {
      alert("Error buscando imágenes. Revisa API KEY Fanart.");
    } finally {
      setIsSearchingImages(false);
    }
  };

  const toggleImageSelection = (filePath: string) => {
    const newSet = new Set(selectedImages);
    if (newSet.has(filePath)) {
      newSet.delete(filePath);
    } else {
      newSet.add(filePath);
    }
    setSelectedImages(newSet);
  };

  const saveSelectedImages = async () => {
    if (selectedImages.size === 0) return;
    setIsSavingImages(true);
    try {
      for (const filePath of selectedImages) {
        const imgObj = searchImages.find(i => i.FilePath === filePath);
        if (imgObj) {
          await fetch("/api/admin/media-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              file_path: imgObj.FilePath, 
              type: imgObj.Type, 
              source: imgObj.Source, 
              language_iso: imgObj.LanguageISO,
              serie_id: serie.id
            }),
            credentials: "include"
          });
        }
      }
      setIsImageModalOpen(false);
      // Reload serie data
      const resData = await fetch(`/api/admin/series/${id}`, { credentials: "include" });
      const newData = await resData.json();
      setSerie(newData);
    } catch (e) {
      alert("Error guardando imágenes");
    } finally {
      setIsSavingImages(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!isEditing || !confirm("¿Eliminar esta imagen?")) return;
    try {
      const res = await fetch(`/api/admin/media-images/${imageId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error delete image");
      const resData = await fetch(`/api/admin/series/${id}`, { credentials: "include" });
      const newData = await resData.json();
      setSerie(newData);
    } catch (e) {
      alert("Error eliminando imagen");
    }
  };

  const deleteRelation = async (relationType: string, relationId: number) => {
    if (!isEditing || !confirm(`¿Desvincular este elemento?`)) return;
    try {
      const res = await fetch(`/api/admin/series/${id}/${relationType}/${relationId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error delete relation");
      const resData = await fetch(`/api/admin/series/${id}`, { credentials: "include" });
      const newData = await resData.json();
      setSerie(newData);
    } catch (e) {
      alert("Error al desvincular");
    }
  };

  if (isLoading) return <div className="text-white p-8 flex items-center justify-center">Cargando...</div>;
  if (!serie) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/gemflix/series")} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {titleLat || titleEsp || titleEng || originalName || "Sin Título"}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-(--accent)/20">
              <Edit3 className="w-4 h-4" /> Editar Serie
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                <Lock className="w-4 h-4" /> Solo Lectura
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium transition-colors border border-red-500/20">
                <Trash2 className="w-4 h-4" /> Borrar
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-(--accent)/20 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        <button onClick={() => setActiveTab("detalles")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "detalles" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <Film className="w-4 h-4 inline-block mr-2" /> Detalles
        </button>
        <button onClick={() => setActiveTab("reparto")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "reparto" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <Users className="w-4 h-4 inline-block mr-2" /> Reparto
        </button>
        <button onClick={() => setActiveTab("generos")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "generos" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <Globe className="w-4 h-4 inline-block mr-2" /> Géneros
        </button>
        <button onClick={() => setActiveTab("plataformas")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "plataformas" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <Globe className="w-4 h-4 inline-block mr-2" /> Plataformas
        </button>
        <button onClick={() => setActiveTab("paises")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "paises" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <Globe className="w-4 h-4 inline-block mr-2" /> Países
        </button>
        <button onClick={() => setActiveTab("galeria")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "galeria" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <ImageIcon className="w-4 h-4 inline-block mr-2" /> Galería
        </button>
        <button onClick={() => setActiveTab("temporadas")} className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "temporadas" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
          <PlaySquare className="w-4 h-4 inline-block mr-2" /> Temporadas
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6">
        {activeTab === "detalles" && (
          <div className="space-y-8">
            
            {/* Datos Principales */}
            <div className="bg-black/20 p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">Datos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título original *</label>
                  <input type="text" disabled={!isEditing} value={originalName} onChange={(e) => setOriginalName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug (web/panel)</label>
                  <input type="text" disabled={!isEditing} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Si lo dejas vacío se generará automáticamente" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">TMDB ID</label>
                  <input type="text" disabled value={serie.tmdb_id || ""} className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IMDB ID</label>
                  <input type="text" disabled value={serie.imdb_id || ""} className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
                  <select disabled value="Serie" className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed appearance-none">
                    <option>Serie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primera emisión</label>
                  <input type="date" disabled={!isEditing} value={firstAirDate} onChange={(e) => setFirstAirDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50 scheme-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duración episodio (min)</label>
                  <input type="number" disabled={!isEditing} value={episodeRunTime} onChange={(e) => setEpisodeRunTime(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título LAT</label>
                  <input type="text" disabled={!isEditing} value={titleLat} onChange={(e) => setTitleLat(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título ESP</label>
                  <input type="text" disabled={!isEditing} value={titleEsp} onChange={(e) => setTitleEsp(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título ENG</label>
                  <input type="text" disabled={!isEditing} value={titleEng} onChange={(e) => setTitleEng(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>
              </div>
            </div>

            {/* Sinopsis & Multimedia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Sinopsis</label>
                    <button onClick={improveOverview} disabled={isImproving || !isEditing} className="text-xs flex items-center gap-1 text-accent hover:text-accent-light transition-colors font-medium disabled:opacity-50">
                      <Sparkles className="w-3 h-3" /> {isImproving ? "Mejorando..." : "IA: Corregir"}
                    </button>
                  </div>
                  <textarea rows={5} disabled={!isEditing} value={overview} onChange={(e) => setOverview(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none disabled:opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Poster (ruta)</label>
                    <input type="text" disabled value={serie.main_poster?.String || serie.main_poster || ""} className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-xs text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Backdrop (ruta)</label>
                    <input type="text" disabled value={serie.main_backdrop?.String || serie.main_backdrop || ""} className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-xs text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Trailer (YouTube ID)</label>
                    <button 
                      onClick={() => setIsYouTubeModalOpen(true)}
                      disabled={!isEditing}
                      className="text-xs flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors font-medium disabled:opacity-50"
                    >
                      <PlaySquare className="w-3 h-3" /> Buscar en YouTube
                    </button>
                  </div>
                  <input type="text" disabled={!isEditing} value={trailerKey} onChange={(e) => setTrailerKey(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                </div>

                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                  <h3 className="text-sm font-bold text-gray-300 mb-4">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Voto promedio</label>
                      <input type="number" step="0.1" disabled={!isEditing} value={voteAverage} onChange={(e) => setVoteAverage(parseFloat(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Votos</label>
                      <input type="number" disabled={!isEditing} value={voteCount} onChange={(e) => setVoteCount(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Clasificación (USA)</label>
                      <input type="text" disabled={!isEditing} value={certification} onChange={(e) => setCertification(e.target.value)} placeholder="Ej: TV-MA, TV-14" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="bg-black/20 p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">Flags</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={status === "Publicado"} onChange={(c: boolean) => setStatus(c ? "Publicado" : "Borrador")} disabled={!isEditing} />
                  <span className="text-sm font-medium text-white">Activa</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={premiere} onChange={setPremiere} disabled={!isEditing} />
                  <span className="text-sm font-medium text-white">Estreno</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={upcoming} onChange={setUpcoming} disabled={!isEditing} />
                  <span className="text-sm font-medium text-white">Próximo</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={premium} onChange={setPremium} disabled={!isEditing} />
                  <span className="text-sm font-medium text-white">Premium</span>
                </label>
              </div>
            </div>

          </div>
        )}

        {activeTab === "reparto" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Reparto Principal</h3>
              {isEditing && (
                <div className="w-72">
                  <RelationSelector type="casts" mediaType="series" mediaId={serie.id} existingIds={serie.casts_data?.map((c: any) => c.id)} onAdded={() => {
                    fetch(`/api/admin/series/${id}`, { credentials: "include" }).then(res => res.json()).then(setSerie);
                  }} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {serie.casts_data?.map((cast: any) => (
                <div key={cast.id} className="bg-black/30 border border-white/5 rounded-xl p-3 text-center relative group">
                  {isEditing && (
                    <button onClick={() => deleteRelation('casts', cast.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40 z-10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {cast.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${cast.profile_path}`} className="w-20 h-20 object-cover rounded-full mx-auto mb-3 shadow-md" alt={cast.name} />
                  ) : (
                    <div className="w-20 h-20 bg-white/5 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-white truncate">{cast.name}</h4>
                  <p className="text-xs text-gray-400 truncate">{cast.character_name || cast.job}</p>
                </div>
              ))}
              {(!serie.casts_data || serie.casts_data.length === 0) && (
                <p className="text-gray-400 col-span-full">No hay reparto registrado.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "generos" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Géneros</h3>
                {isEditing && (
                  <div className="w-64">
                    <RelationSelector type="genres" mediaType="series" mediaId={serie.id} existingIds={serie.genres?.map((g: any) => g.id)} onAdded={() => {
                      fetch(`/api/admin/series/${id}`, { credentials: "include" }).then(res => res.json()).then(setSerie);
                    }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {serie.genres?.map((g: any) => (
                  <div key={g.id} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden relative group">
                    <div className="h-24 bg-white/5 relative flex items-center justify-center">
                      {g.image_path ? (
                        <img src={g.image_path.startsWith('/') ? `https://image.tmdb.org/t/p/w300${g.image_path}` : g.image_path} className="absolute inset-0 w-full h-full object-cover opacity-50" alt={g.name} />
                      ) : (
                        <Globe className="w-8 h-8 text-white/20" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-sm font-bold text-white z-10">{g.name}</span>
                    </div>
                    {isEditing && (
                      <button onClick={() => deleteRelation('genres', g.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40 z-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(!serie.genres || serie.genres.length === 0) && (
                  <p className="text-gray-400">Sin géneros registrados.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "plataformas" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Plataformas de Streaming</h3>
                {isEditing && (
                  <div className="w-64">
                    <RelationSelector type="networks" mediaType="series" mediaId={serie.id} existingIds={serie.networks?.map((n: any) => n.id)} onAdded={() => {
                      fetch(`/api/admin/series/${id}`, { credentials: "include" }).then(res => res.json()).then(setSerie);
                    }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {serie.networks?.map((n: any) => (
                  <div key={n.id} className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-white/10 relative group h-32">
                    {n.logo_path ? (
                      <img src={n.logo_path?.startsWith('http') ? n.logo_path : `https://image.tmdb.org/t/p/w154${n.logo_path?.startsWith('/') ? '' : '/'}${n.logo_path}`} className="max-w-full max-h-12 object-contain" alt={n.name} />
                    ) : (
                      <Globe className="w-8 h-8 text-white/20" />
                    )}
                    <span className="text-sm font-medium text-white text-center mt-auto">{n.name}</span>
                    {isEditing && (
                      <button onClick={() => deleteRelation('networks', n.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(!serie.networks || serie.networks.length === 0) && (
                  <p className="text-gray-400">Sin plataformas registradas.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "paises" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Países de Producción</h3>
                {isEditing && (
                  <div className="w-64">
                    <RelationSelector type="countries" mediaType="series" mediaId={serie.id} existingIds={serie.countries?.map((c: any) => c.id)} onAdded={() => {
                      fetch(`/api/admin/series/${id}`, { credentials: "include" }).then(res => res.json()).then(setSerie);
                    }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {serie.countries?.map((c: any) => (
                  <div key={c.id} className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-white/10 relative group h-32">
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-white uppercase">{c.iso_3166_1}</span>
                    </div>
                    <span className="text-sm font-medium text-white text-center">{c.name}</span>
                    {isEditing && (
                      <button onClick={() => deleteRelation('countries', c.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(!serie.countries || serie.countries.length === 0) && (
                  <p className="text-gray-400 col-span-full">Sin países registrados.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "galeria" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Galería de Imágenes</h3>
              <button onClick={fetchMoreImages} disabled={!isEditing} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium transition-colors border border-blue-500/20 disabled:opacity-50">
                <ImageIcon className="w-4 h-4" /> Buscar en Fanart/TMDB
              </button>
            </div>
            <div>
              <h3 className="text-md font-bold text-gray-300 mb-4">Pósters Oficiales</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {serie.images?.filter((img: any) => img.type === 'poster').map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer" onClick={() => setMainImage(img.id, 'poster')} style={{ borderColor: img.is_main ? 'var(--accent)' : 'transparent' }}>
                    <img src={img.file_path.startsWith('http') ? img.file_path : `https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full aspect-2/3 object-cover" alt="Poster" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium text-sm drop-shadow-md">Marcar Principal</span>
                    </div>
                    {isEditing && !img.is_main && (
                      <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full text-white shadow-lg cursor-pointer hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                    {img.is_main && (
                      <div className="absolute top-2 right-2 bg-accent p-1 rounded-full text-white shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(!serie.images || serie.images.filter((i:any) => i.type === 'poster').length === 0) && (
                  <p className="text-gray-400">No hay pósters en la galería.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Fondos (Backdrops)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serie.images?.filter((img: any) => img.type === 'backdrop').map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer" onClick={() => setMainImage(img.id, 'backdrop')} style={{ borderColor: img.is_main ? 'var(--accent)' : 'transparent' }}>
                    <img src={img.file_path.startsWith('http') ? img.file_path : `https://image.tmdb.org/t/p/w780${img.file_path}`} className="w-full aspect-video object-cover" alt="Backdrop" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium text-sm drop-shadow-md">Marcar Principal</span>
                    </div>
                    {isEditing && !img.is_main && (
                      <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full text-white shadow-lg cursor-pointer hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                    {img.is_main && (
                      <div className="absolute top-2 right-2 bg-accent p-1 rounded-full text-white shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(!serie.images || serie.images.filter((i:any) => i.type === 'backdrop').length === 0) && (
                  <p className="text-gray-400">No hay fondos en la galería.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Logos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-800/30 p-4 rounded-xl border border-white/5">
                {serie.images?.filter((img: any) => img.type === 'logo').map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer" onClick={() => setMainImage(img.id, 'logo')} style={{ borderColor: img.is_main ? 'var(--accent)' : 'transparent' }}>
                    <img src={img.file_path.startsWith('http') ? img.file_path : `https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full h-auto object-contain p-4 drop-shadow-lg" alt="Logo" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium text-sm drop-shadow-md">Marcar Principal</span>
                    </div>
                    {isEditing && !img.is_main && (
                      <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full text-white shadow-lg cursor-pointer hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                    {img.is_main && (
                      <div className="absolute top-2 right-2 bg-accent p-1 rounded-full text-white shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(!serie.images || serie.images.filter((i:any) => i.type === 'logo').length === 0) && (
                  <p className="text-gray-400">No hay logos en la galería.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Clear Art (Arte sin fondo)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/30 p-4 rounded-xl border border-white/5">
                {serie.images?.filter((img: any) => img.type === 'clearart').map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer" onClick={() => setMainImage(img.id, 'clearart')} style={{ borderColor: img.is_main ? 'var(--accent)' : 'transparent' }}>
                    <img src={img.file_path.startsWith('http') ? img.file_path : `https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full h-auto object-contain p-2" alt="Clear Art" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium text-sm drop-shadow-md">Marcar Principal</span>
                    </div>
                    {isEditing && !img.is_main && (
                      <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full text-white shadow-lg cursor-pointer hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                    {img.is_main && (
                      <div className="absolute top-2 right-2 bg-accent p-1 rounded-full text-white shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(!serie.images || serie.images.filter((i:any) => i.type === 'clearart').length === 0) && (
                  <p className="text-gray-400">No hay clear art en la galería.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">TV Thumbs / Thumbnails</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serie.images?.filter((img: any) => img.type === 'tvthumb').map((img: any) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer" onClick={() => setMainImage(img.id, 'tvthumb')} style={{ borderColor: img.is_main ? 'var(--accent)' : 'transparent' }}>
                    <img src={img.file_path.startsWith('http') ? img.file_path : `https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full aspect-video object-cover" alt="Thumb" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium text-sm drop-shadow-md">Marcar Principal</span>
                    </div>
                    {isEditing && !img.is_main && (
                      <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full text-white shadow-lg cursor-pointer hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                    {img.is_main && (
                      <div className="absolute top-2 right-2 bg-accent p-1 rounded-full text-white shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(!serie.images || serie.images.filter((i:any) => i.type === 'tvthumb').length === 0) && (
                  <p className="text-gray-400">No hay thumbs en la galería.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "temporadas" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Temporadas y Episodios</h3>
            {loadingSeasons ? (
              <div className="text-gray-400 text-center py-8">Cargando temporadas...</div>
            ) : seasons.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No se encontraron temporadas para esta serie.</div>
            ) : (
              seasons.map((season) => (
                <div key={season.id} className="bg-black/20 rounded-xl overflow-hidden border border-white/5 transition-all">
                  {/* Season Header */}
                  <div 
                    onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {season.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} className="w-12 h-16 object-cover rounded-lg" alt="" />
                      ) : (
                        <div className="w-12 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                          <Film className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-white">Temporada {season.season_number} <span className="text-gray-400 font-normal text-sm ml-2">({season.episodes?.length || 0} episodios)</span></h4>
                        <p className="text-sm text-gray-400">{season.air_date ? new Date(season.air_date).getFullYear() : "Fecha desconocida"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Episodes List (Expanded) */}
                  {expandedSeason === season.id && (
                    <div className="border-t border-white/5 p-4 bg-black/40">
                      {season.episodes && season.episodes.length > 0 ? (
                        <div className="space-y-3">
                          {season.episodes.map((ep: any) => (
                            <div key={ep.id} className="flex flex-col md:flex-row items-center justify-between bg-[#1A1A24] p-3 rounded-lg border border-white/5">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="text-accent font-bold text-lg min-w-7.5">{ep.episode_number}</div>
                                {ep.still_path ? (
                                  <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} className="w-24 h-14 object-cover rounded-md hidden md:block" alt="" />
                                ) : (
                                  <div className="w-24 h-14 bg-white/5 rounded-md hidden md:flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <h5 className="text-white font-medium">{ep.name}</h5>
                                  <p className="text-xs text-gray-400 line-clamp-1 max-w-sm">{ep.overview || "Sin descripción."}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                <button onClick={() => setEditingEpisode(ep)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Editar Metadatos">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => openLinksModal(ep)} className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Gestionar Enlaces">
                                  <LinkIcon className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-400 mb-1">Streaming</span>
                                  <Switch 
                                    checked={ep.enable_stream} 
                                    onChange={(val: boolean) => handleToggleEpisode(ep.id, "enable_stream", val)} 
                                  />
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-400 mb-1">Descargas</span>
                                  <Switch 
                                    checked={ep.enable_download} 
                                    onChange={(val: boolean) => handleToggleEpisode(ep.id, "enable_download", val)} 
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm text-center py-4">No hay episodios registrados en esta temporada.</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal for searching images */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Buscar Imágenes (Fanart/TMDB)</h2>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              {isSearchingImages ? (
                <div className="text-center text-gray-400 py-12">Buscando imágenes...</div>
              ) : searchImages.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No se encontraron más imágenes.</div>
              ) : (
                <>
                  {["poster", "backdrop", "logo", "clearart"].map(type => {
                    const imgs = searchImages.filter(i => i.Type === type);
                    if (imgs.length === 0) return null;
                    return (
                      <div key={type}>
                        <h3 className="text-lg font-bold text-white mb-4 capitalize">{type}</h3>
                        <div className={`grid gap-4 ${type === 'poster' || type === 'clearart' ? 'grid-cols-3 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'}`}>
                          {imgs.map((img, idx) => {
                            const isSelected = selectedImages.has(img.FilePath);
                            // Avoid dupes if already in serie.images
                            const alreadyAdded = serie.images?.some((mi:any) => mi.file_path === img.FilePath);
                            if (alreadyAdded) return null;

                            return (
                              <div key={idx} onClick={() => toggleImageSelection(img.FilePath)} className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                <img src={img.FilePath.startsWith('http') ? img.FilePath : `https://image.tmdb.org/t/p/w500${img.FilePath}`} className="w-full object-cover" alt="" />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-(--accent)/20 flex items-center justify-center">
                                    <div className="bg-accent p-2 rounded-full text-white">
                                      <Save className="w-6 h-6" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-4">
              <button onClick={() => setIsImageModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={saveSelectedImages} 
                disabled={isSavingImages || selectedImages.size === 0} 
                className="px-6 py-2 rounded-lg font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSavingImages ? "Guardando..." : `Guardar Seleccionadas (${selectedImages.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <YouTubeSearchModal 
        isOpen={isYouTubeModalOpen} 
        onClose={() => setIsYouTubeModalOpen(false)} 
        onSelectTrailer={(id) => setTrailerKey(id)} 
        defaultQuery={titleLat || originalName} 
      />

      {/* Modal Editar Episodio */}
      {editingEpisode && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Editar Episodio {editingEpisode.episode_number}</h2>
              <button onClick={() => setEditingEpisode(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                <input type="text" value={editingEpisode.name} onChange={e => setEditingEpisode({...editingEpisode, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                <textarea rows={4} value={editingEpisode.overview} onChange={e => setEditingEpisode({...editingEpisode, overview: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Fecha Emisión</label>
                  <input type="date" value={editingEpisode.air_date ? editingEpisode.air_date.split('T')[0] : ''} onChange={e => setEditingEpisode({...editingEpisode, air_date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Imagen (Path TMDB)</label>
                  <input type="text" value={editingEpisode.still_path || ''} onChange={e => setEditingEpisode({...editingEpisode, still_path: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setEditingEpisode(null)} className="px-6 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">Cancelar</button>
              <button onClick={handleSaveEpisodeMeta} className="px-6 py-2 rounded-lg font-medium text-white bg-accent hover:bg-accent-hover transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestionar Enlaces */}
      {managingEpisode && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-white">Enlaces - Episodio {managingEpisode.episode_number}</h2>
              <button onClick={() => setManagingEpisode(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Tabla de Enlaces */}
              <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Etiqueta</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Calidad</th>
                      <th className="px-4 py-3">Link</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSources ? (
                      <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
                    ) : mediaSources.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4">No hay enlaces agregados.</td></tr>
                    ) : (
                      mediaSources.map(s => (
                        <tr key={s.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">{s.label}</td>
                          <td className="px-4 py-3"><span className="text-gray-400 uppercase text-xs font-bold tracking-wider">{s.type || 'directo'}</span></td>
                          <td className="px-4 py-3"><span className="bg-white/10 px-2 py-1 rounded text-xs">{s.quality}</span></td>
                          <td className="px-4 py-3 font-mono text-xs max-w-50 truncate" title={s.link}>{s.link}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openMediaSourceDetails(s)} className="p-1 text-accent hover:text-accent-hover hover:bg-accent/10 rounded mr-2" title="Audios y Subtítulos">
                              <Film className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteSource(s.id)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded" title="Borrar Enlace">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Formulario Nuevo Enlace */}
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Nuevo Enlace</h3>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">URL / Link *</label>
                  <input type="text" value={newSource.link} onChange={e => setNewSource({...newSource, link: e.target.value})} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tipo *</label>
                    <select value={newSource.type} onChange={e => setNewSource({...newSource, type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent">
                      <option value="directo">Directo (MP4/Drive)</option>
                      <option value="hls">HLS (m3u8)</option>
                      <option value="embed">Embed (Iframe)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Etiqueta *</label>
                    <input type="text" value={newSource.label} onChange={e => setNewSource({...newSource, label: e.target.value})} placeholder="Latino, Subtitulado..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Calidad *</label>
                    <select value={newSource.quality} onChange={e => setNewSource({...newSource, quality: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent">
                      <option value="2160p">4K (2160p)</option>
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Códec</label>
                    <input type="text" value={newSource.videoCodec} onChange={e => setNewSource({...newSource, videoCodec: e.target.value})} placeholder="h264, hevc..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Audio (Canales)</label>
                    <input type="text" value={newSource.audioChannels} onChange={e => setNewSource({...newSource, audioChannels: e.target.value})} placeholder="2.0, 5.1..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Rango Dinámico</label>
                    <select value={newSource.dynamicRange} onChange={e => setNewSource({...newSource, dynamicRange: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent">
                      <option value="">SDR (Normal)</option>
                      <option value="hdr10">HDR10</option>
                      <option value="dolby_vision">Dolby Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Bit Depth</label>
                    <select value={newSource.bitDepth} onChange={e => setNewSource({...newSource, bitDepth: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent">
                      <option value={8}>8-bit</option>
                      <option value={10}>10-bit</option>
                      <option value={12}>12-bit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Peso (Bytes)</label>
                    <input type="number" value={newSource.sizeBytes} onChange={e => setNewSource({...newSource, sizeBytes: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Recap Start (s)</label>
                    <input type="number" value={newSource.recapStart} onChange={e => setNewSource({...newSource, recapStart: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Recap End (s)</label>
                    <input type="number" value={newSource.recapEnd} onChange={e => setNewSource({...newSource, recapEnd: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Intro Start (s)</label>
                    <input type="number" value={newSource.openingStart} onChange={e => setNewSource({...newSource, openingStart: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Intro End (s)</label>
                    <input type="number" value={newSource.openingEnd} onChange={e => setNewSource({...newSource, openingEnd: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Ending Start (s)</label>
                    <input type="number" value={newSource.endingStart} onChange={e => setNewSource({...newSource, endingStart: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Ending End (s)</label>
                    <input type="number" value={newSource.endingEnd} onChange={e => setNewSource({...newSource, endingEnd: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button onClick={handleAddSource} disabled={!newSource.link || !newSource.label} className="px-6 py-2 rounded-lg font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Agregar Enlace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Audios y Subtítulos */}
      {managingMediaSource && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Audios & Subtítulos - {managingMediaSource.label}</h2>
              <button onClick={() => setManagingMediaSource(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AUDIOS */}
              <div>
                <h3 className="text-lg font-bold text-accent mb-4 border-b border-white/10 pb-2">Pistas de Audio</h3>
                <div className="space-y-2 mb-4">
                  {audioTracks.map(a => (
                    <div key={a.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-bold mr-2">Trk {a.track_no}</span>
                        <span className="text-gray-300 uppercase">{a.lang}</span>
                        <span className="text-gray-500 ml-2 text-xs">{a.codec} - {a.channel_layout}</span>
                      </div>
                      <button onClick={() => handleDeleteAudio(a.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {audioTracks.length === 0 && <p className="text-gray-500 text-sm">No hay audios agregados.</p>}
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3">Agregar Audio</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="number" value={newAudio.trackNo} onChange={e => setNewAudio({...newAudio, trackNo: Number(e.target.value)})} placeholder="Trk Nro" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" title="Track No" />
                    <input type="text" value={newAudio.lang} onChange={e => setNewAudio({...newAudio, lang: e.target.value})} placeholder="Idioma (es, en...)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" value={newAudio.codec} onChange={e => setNewAudio({...newAudio, codec: e.target.value})} placeholder="Códec (aac, ac3...)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" value={newAudio.channelLayout} onChange={e => setNewAudio({...newAudio, channelLayout: e.target.value})} placeholder="Canales (2.0, 5.1...)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <button onClick={handleAddAudio} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors">Añadir Audio</button>
                </div>
              </div>

              {/* SUBTÍTULOS */}
              <div>
                <h3 className="text-lg font-bold text-accent mb-4 border-b border-white/10 pb-2">Subtítulos</h3>
                <div className="space-y-2 mb-4">
                  {subtitleTracks.map(s => (
                    <div key={s.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center text-sm">
                      <div className="overflow-hidden">
                        <span className="text-white font-bold mr-2">Trk {s.track_no}</span>
                        <span className="text-gray-300 uppercase">{s.lang}</span>
                        <span className="text-gray-500 ml-2 text-xs">{s.type}</span>
                        {s.link && <p className="text-xs text-gray-500 truncate">{s.link}</p>}
                      </div>
                      <button onClick={() => handleDeleteSubtitle(s.id)} className="text-red-400 hover:text-red-300 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {subtitleTracks.length === 0 && <p className="text-gray-500 text-sm">No hay subtítulos agregados.</p>}
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3">Agregar Subtítulo</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="number" value={newSubtitle.trackNo} onChange={e => setNewSubtitle({...newSubtitle, trackNo: Number(e.target.value)})} placeholder="Trk Nro" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" title="Track No" />
                    <input type="text" value={newSubtitle.lang} onChange={e => setNewSubtitle({...newSubtitle, lang: e.target.value})} placeholder="Idioma (es, en...)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                    <select value={newSubtitle.type} onChange={e => setNewSubtitle({...newSubtitle, type: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="vtt">VTT</option>
                      <option value="srt">SRT</option>
                      <option value="ass">ASS</option>
                    </select>
                    <input type="text" value={newSubtitle.link} onChange={e => setNewSubtitle({...newSubtitle, link: e.target.value})} placeholder="URL externa (opcional)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <button onClick={handleAddSubtitle} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors">Añadir Subtítulo</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

