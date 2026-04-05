import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRequests, useParentStories } from '../api/hooks'
import { formatTime, formatDateTime } from '../utils/date'

const STORY_DURATION = 6000 // ms each story auto-advances

export default function ParentStories() {
  const { data: allRequests, isLoading: loadingRequests } = useRequests()
  const { data: allStories, isLoading: loadingStories } = useParentStories()

  const [activeGroupIdx, setActiveGroupIdx] = useState(null)
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)

  const eligibleBookings = allRequests?.filter(
    (r) => r.status === 'ACCEPTED' || r.status === 'COMPLETED'
  ) || []

  const isLive = (b) => {
    const now = new Date()
    return new Date(b.start_date) <= now && new Date(b.end_date) >= now
  }

  // Group stories by booking id
  const groups = eligibleBookings
    .map((b) => ({
      booking: b,
      babysitterName: b.babysitter_info
        ? `${b.babysitter_info.first_name} ${b.babysitter_info.last_name}`
        : 'Babysitter',
      stories: (allStories || []).filter((s) => s.booking === b.id),
      live: isLive(b),
    }))
    .filter((g) => g.stories.length > 0)

  const openGroup = (idx) => {
    setActiveGroupIdx(idx)
    setActiveStoryIdx(0)
  }

  const closeViewer = useCallback(() => setActiveGroupIdx(null), [])

  const goNext = useCallback(() => {
    setActiveGroupIdx((gi) => {
      if (gi === null) return null
      const group = groups[gi]
      setActiveStoryIdx((si) => {
        if (si < group.stories.length - 1) return si + 1
        // move to next group
        if (gi < groups.length - 1) {
          setTimeout(() => setActiveGroupIdx(gi + 1), 0)
          setTimeout(() => setActiveStoryIdx(0), 0)
          return si
        }
        // end of all stories
        setTimeout(() => setActiveGroupIdx(null), 0)
        return si
      })
      return gi
    })
  }, [groups])

  const goPrev = useCallback(() => {
    setActiveStoryIdx((si) => {
      if (si > 0) return si - 1
      setActiveGroupIdx((gi) => {
        if (gi > 0) {
          const prevLen = groups[gi - 1].stories.length
          setTimeout(() => setActiveStoryIdx(prevLen - 1), 0)
          return gi - 1
        }
        return gi
      })
      return si
    })
  }, [groups])

  const isLoading = loadingRequests || loadingStories

  return (
    <div className="page-wrap max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Stories</h2>
        <span className="text-xs text-gray-400">Refreshes every 30s</span>
      </div>

      {isLoading ? (
        <StoryRingSkeletons />
      ) : groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {groups.map((g, i) => (
            <StoryRing key={g.booking.id} group={g} onClick={() => openGroup(i)} />
          ))}
        </div>
      )}

      {activeGroupIdx !== null && groups[activeGroupIdx] && (
        <StoryViewer
          groups={groups}
          groupIdx={activeGroupIdx}
          storyIdx={activeStoryIdx}
          onClose={closeViewer}
          onNext={goNext}
          onPrev={goPrev}
          setGroupIdx={setActiveGroupIdx}
          setStoryIdx={setActiveStoryIdx}
        />
      )}
    </div>
  )
}

function StoryRing({ group, onClick }) {
  const initials = group.babysitterName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
    >
      <div
        className={`p-[3px] rounded-full ${
          group.live
            ? 'bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500'
            : 'bg-gradient-to-tr from-pink-300 to-pink-400'
        }`}
      >
        <div className="bg-white rounded-full p-[2px]">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-700 font-bold text-lg group-hover:scale-95 transition-transform">
            {initials}
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-600 max-w-[72px] truncate text-center leading-tight">
        {group.babysitterName.split(' ')[0]}
      </span>
      {group.live && (
        <span className="text-[10px] text-pink-500 font-semibold -mt-0.5 flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full inline-block animate-pulse" />
          Live
        </span>
      )}
    </button>
  )
}

function StoryViewer({ groups, groupIdx, storyIdx, onClose, onNext, onPrev, setGroupIdx, setStoryIdx }) {
  const group = groups[groupIdx]
  const story = group.stories[storyIdx]
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const startRef = useRef(Date.now())

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startRef.current = Date.now()
    setProgress(0)
    intervalRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startRef.current) / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(intervalRef.current)
        onNext()
      }
    }, 50)
  }, [onNext])

  useEffect(() => {
    resetTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [groupIdx, storyIdx])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const postedAt = new Date(story.created_at)
  const sessionStart = story.booking_info?.start_date ? new Date(story.booking_info.start_date) : null
  const minutesIn = sessionStart ? Math.round((postedAt - sessionStart) / 60000) : null
  const initials = (story.babysitter_name || 'B').split(' ').map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Prev group hint */}
      {groupIdx > 0 && (
        <button
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white text-xl transition-colors"
          onClick={() => { setGroupIdx(groupIdx - 1); setStoryIdx(0) }}
        >
          ‹
        </button>
      )}

      {/* Story card */}
      <div className="relative w-full max-w-sm h-[100dvh] md:h-[88vh] md:rounded-3xl overflow-hidden shadow-2xl bg-gray-900">

        {/* Background */}
        {story.image ? (
          <img
            src={story.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600" />
        )}

        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Progress bars */}
        <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    i < storyIdx
                      ? '100%'
                      : i === storyIdx
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-9 inset-x-3 flex items-center gap-2.5 z-10">
          <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight drop-shadow">
              {story.babysitter_name}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              {formatTime(story.created_at)}
              {minutesIn !== null && minutesIn >= 0 && (
                <span className="ml-1 text-pink-300">· {minutesIn}m into session</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content — center if text-only, bottom if image */}
        {story.image ? (
          story.content && (
            <div className="absolute bottom-8 inset-x-4 z-10">
              <p className="text-white text-sm leading-relaxed drop-shadow-md">{story.content}</p>
            </div>
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-8 z-10">
            <p className="text-white text-2xl font-semibold text-center leading-relaxed drop-shadow-lg">
              {story.content}
            </p>
          </div>
        )}

        {/* Child info badge */}
        {story.booking_info?.child_name && (
          <div className="absolute bottom-4 right-4 z-10 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <p className="text-white/80 text-xs">{story.booking_info.child_name}</p>
          </div>
        )}

        {/* Tap zones (on top of everything) */}
        <button
          className="absolute inset-y-0 left-0 w-1/3 z-20"
          onClick={onPrev}
          aria-label="Previous"
        />
        <button
          className="absolute inset-y-0 right-0 w-2/3 z-20"
          onClick={onNext}
          aria-label="Next"
        />
      </div>

      {/* Next group hint */}
      {groupIdx < groups.length - 1 && (
        <button
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white text-xl transition-colors"
          onClick={() => { setGroupIdx(groupIdx + 1); setStoryIdx(0) }}
        >
          ›
        </button>
      )}
    </div>
  )
}

function StoryRingSkeletons() {
  return (
    <div className="flex gap-5 pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="h-[74px] w-[74px] rounded-full bg-pink-100 animate-pulse" />
          <div className="h-2 w-12 bg-pink-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-14">
      <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
        <svg className="h-8 w-8 text-pink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </div>
      <p className="text-gray-500 font-medium">No stories yet</p>
      <p className="text-xs text-gray-400 mt-1">
        Stories from your babysitter will appear here during the session
      </p>
    </div>
  )
}
