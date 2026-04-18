// ============================================================
// src/lib/supabase.js
// ============================================================
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Upload une vidéo dans le bucket 'videos'
 * @returns {string} URL publique signée (1h)
 */
export async function uploadVideo(file, sessionId) {
  const ext  = file.name.split('.').pop()
  const path = `${sessionId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('videos')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 60 * 60) // 1 heure

  return data.signedUrl
}

/**
 * Génère une signed URL fraîche pour une vidéo déjà uploadée
 */
export async function refreshVideoUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(storagePath, 60 * 60)
  if (error) throw error
  return data.signedUrl
}


// ============================================================
// src/lib/constants.js
// ============================================================

export const SESSION_STATUS = {
  LOBBY:    'lobby',      // joueurs rejoignent
  LIVE:     'live',       // session démarrée, entre deux questions
  QUESTION: 'question',   // question active, joueurs répondent
  REVEAL:   'reveal',     // maître révèle les réponses
  QR:       'qr',         // module chasse aux QR codes actif
  FINISHED: 'finished',   // session terminée
}

export const QUESTION_TYPE = {
  TEXT:  'text',   // question texte, réponse libre
  MCQ:   'mcq',    // QCM A/B/C/D
  VIDEO: 'video',  // vidéo sur écran principal
  ORAL:  'oral',   // maître parle, texte affiché sur téléphone
}

export const DEFAULT_TIME_LIMIT = 30   // secondes
export const DEFAULT_POINTS     = 100
export const DEFAULT_QR_POINTS  = 50

export const MCQ_CHOICES = ['A', 'B', 'C', 'D']


// ============================================================
// src/hooks/useSession.js
// ============================================================
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Abonnement Realtime à une session.
 * Retourne { session, loading, error, refresh }
 *
 * S'abonne aux changements de la table `sessions` via Postgres Changes
 * pour que maître ET joueurs reçoivent les mises à jour d'état en temps réel
 * (nouvelle question, status change, etc.)
 */
export function useSession(sessionId) {
  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        current_question:questions!current_question_id (*)
      `)
      .eq('id', sessionId)
      .single()
    if (error) setError(error)
    else setSession(data)
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchSession()

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        () => fetchSession()   // re-fetch pour avoir la question jointe
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId, fetchSession])

  return { session, loading, error, refresh: fetchSession }
}


// ============================================================
// src/hooks/usePlayers.js
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Liste des joueurs d'une session, triés par score décroissant.
 * Se met à jour en temps réel.
 */
export function usePlayers(sessionId) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (!sessionId) return

    const fetch = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('score', { ascending: false })
      setPlayers(data ?? [])
    }

    fetch()

    const channel = supabase
      .channel(`players:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
        fetch
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  return players
}


// ============================================================
// src/hooks/useAnswers.js
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Réponses pour une question donnée.
 * Utilisé par le maître pour voir les réponses en temps réel.
 */
export function useAnswers(questionId) {
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    if (!questionId) return

    const fetch = async () => {
      const { data } = await supabase
        .from('answers')
        .select('*, player:players(nickname)')
        .eq('question_id', questionId)
        .order('answered_at', { ascending: true })
      setAnswers(data ?? [])
    }

    fetch()

    const channel = supabase
      .channel(`answers:${questionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'answers', filter: `question_id=eq.${questionId}` },
        fetch
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [questionId])

  return answers
}


// ============================================================
// src/hooks/useQrScans.js
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Scans QR pour une session donnée.
 * Retourne les scans triés par date (classement en temps réel).
 */
export function useQrScans(sessionId) {
  const [scans, setScans] = useState([])

  useEffect(() => {
    if (!sessionId) return

    const fetch = async () => {
      const { data } = await supabase
        .from('qr_scans')
        .select('*, player:players(nickname), qr_code:qr_codes(label, points)')
        .eq('session_id', sessionId)
        .order('scanned_at', { ascending: true })
      setScans(data ?? [])
    }

    fetch()

    const channel = supabase
      .channel(`qr_scans:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'qr_scans', filter: `session_id=eq.${sessionId}` },
        fetch
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  return scans
}
