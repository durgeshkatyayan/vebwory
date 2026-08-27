import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getExternalPhotos } from '../services/api';

const PAGE_SIZE = 24;

export default function ExternalUsers() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const retryLoad = useCallback(() => {
    setError('');
    if (page === 1) setPhotos([]);
    setReloadKey((currentKey) => currentKey + 1);
  }, [page]);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getExternalPhotos(page, PAGE_SIZE);
      const nextPhotos = Array.isArray(data) ? data : [];

      setPhotos((currentPhotos) => (
        page === 1 ? nextPhotos : [...currentPhotos, ...nextPhotos]
      ));
      setHasMore(nextPhotos.length === PAGE_SIZE);
    } catch {
      const result = await Swal.fire({
        icon: 'error',
        title: 'Unable to load photos',
        text: 'The external photo service could not be reached.',
        confirmButtonText: 'Try again',
        showCancelButton: true,
        cancelButtonText: 'Close',
        confirmButtonColor: '#000000',
        cancelButtonColor: '#ffffff',
        background: document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
      });
      setError('Unable to load photos from the external API.');
      if (result.isConfirmed) retryLoad();
    } finally {
      setLoading(false);
    }
  }, [page, retryLoad]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos, reloadKey]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || loading || !hasMore || error) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage((currentPage) => currentPage + 1);
      }
    }, { root: scrollContainerRef.current, rootMargin: '320px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, error]);

  return (
    <div className="space-y-6 text-black dark:text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
          External API
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Photo Directory</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-2">
          Browse photos from JSONPlaceholder. Scroll down to load more.
        </p>
      </div>

      {photos.length === 0 && loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-black/60 dark:text-white/60">
          <LoaderCircle className="w-5 h-5 mr-2 animate-spin" /> Loading photos...
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            className="h-[calc(100vh-12rem)] min-h-112 overflow-y-auto rounded-2xl border border-black/10 bg-black/2 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/2 dark:shadow-[0_8px_24px_rgba(255,255,255,0.03)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-black dark:shadow-[0_8px_24px_rgba(255,255,255,0.03)] dark:hover:shadow-[0_10px_28px_rgba(255,255,255,0.05)]"
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover bg-black/5 dark:bg-white/10"
                  />
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
                      Album {photo.albumId} · Photo {photo.id}
                    </p>
                    <h2 title={photo.title} className="mt-1.5 min-h-8 line-clamp-2 text-sm font-semibold capitalize leading-4">
                      {photo.title}
                    </h2>
                    <a
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-medium underline underline-offset-4 hover:no-underline"
                    >
                      View full image
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center text-sm text-black/60 dark:text-white/60">
              {loading && photos.length > 0 && (
                <>
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" /> Loading more photos...
                </>
              )}
              {!loading && !hasMore && photos.length > 0 && <span>You have reached the end.</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}