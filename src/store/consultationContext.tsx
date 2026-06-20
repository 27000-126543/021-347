import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { Consultation, ConsultationFormData, ConsultationStatus, MissingField } from '@/types/consultation'
import { mockConsultations } from '@/data/mockConsultations'
import { generateId, generateShareCode, getMissingFields } from '@/utils'

interface ConsultationState {
  consultations: Consultation[]
  filterStatus: ConsultationStatus | 'all'
  searchKeyword: string
  missingFilter: MissingField | 'all'
}

type Action =
  | { type: 'SET_FILTER_STATUS'; payload: ConsultationStatus | 'all' }
  | { type: 'SET_SEARCH_KEYWORD'; payload: string }
  | { type: 'SET_MISSING_FILTER'; payload: MissingField | 'all' }
  | { type: 'ADD_CONSULTATION'; payload: Consultation }
  | { type: 'UPDATE_CONSULTATION'; payload: Consultation }
  | { type: 'DELETE_CONSULTATION'; payload: string }

const initialState: ConsultationState = {
  consultations: mockConsultations,
  filterStatus: 'all',
  searchKeyword: '',
  missingFilter: 'all'
}

function reducer(state: ConsultationState, action: Action): ConsultationState {
  switch (action.type) {
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload }
    case 'SET_SEARCH_KEYWORD':
      return { ...state, searchKeyword: action.payload }
    case 'SET_MISSING_FILTER':
      return { ...state, missingFilter: action.payload }
    case 'ADD_CONSULTATION':
      return {
        ...state,
        consultations: [action.payload, ...state.consultations]
      }
    case 'UPDATE_CONSULTATION':
      return {
        ...state,
        consultations: state.consultations.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      }
    case 'DELETE_CONSULTATION':
      return {
        ...state,
        consultations: state.consultations.filter(item => item.id !== action.payload)
      }
    default:
      return state
  }
}

interface ConsultationContextType {
  state: ConsultationState
  dispatch: React.Dispatch<Action>
  createConsultation: (form: ConsultationFormData, createdBy: string) => Consultation
  submitConsultation: (form: ConsultationFormData, createdBy: string, existingId?: string) => Consultation
  saveDraft: (form: ConsultationFormData, createdBy: string, existingId?: string) => Consultation
  updateFromDetail: (id: string, updates: Partial<ConsultationFormData>) => Consultation | null
  getById: (id: string) => Consultation | undefined
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined)

export const ConsultationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const buildConsultation = useCallback(
    (
      form: ConsultationFormData,
      createdBy: string,
      status: ConsultationStatus,
      existingId?: string
    ): Consultation => {
      const missing = status === 'draft' ? getMissingFields(form) : []
      const now = new Date().toISOString()

      if (existingId) {
        const existing = state.consultations.find(c => c.id === existingId)
        return {
          ...existing!,
          ...form,
          status,
          missingFields: status === 'draft' ? missing : [],
          updatedAt: now
        }
      }

      return {
        id: generateId(),
        ...form,
        status,
        createdAt: now,
        updatedAt: now,
        createdBy,
        missingFields: missing,
        shareCode: generateShareCode()
      }
    },
    [state.consultations]
  )

  const createConsultation = useCallback(
    (form: ConsultationFormData, createdBy: string): Consultation => {
      const status: ConsultationStatus = getMissingFields(form).length === 0 ? 'submitted' : 'draft'
      const consultation = buildConsultation(form, createdBy, status)
      dispatch({ type: 'ADD_CONSULTATION', payload: consultation })
      console.log('[Consultation] 创建洽商记录:', { id: consultation.id, status })
      return consultation
    },
    [buildConsultation]
  )

  const submitConsultation = useCallback(
    (form: ConsultationFormData, createdBy: string, existingId?: string): Consultation => {
      if (existingId) {
        const consultation = buildConsultation(form, createdBy, 'submitted', existingId)
        dispatch({ type: 'UPDATE_CONSULTATION', payload: consultation })
        console.log('[Consultation] 提交已存在洽商:', { id: existingId })
        return consultation
      }
      const consultation = buildConsultation(form, createdBy, 'submitted')
      dispatch({ type: 'ADD_CONSULTATION', payload: consultation })
      console.log('[Consultation] 提交新洽商:', { id: consultation.id })
      return consultation
    },
    [buildConsultation]
  )

  const saveDraft = useCallback(
    (form: ConsultationFormData, createdBy: string, existingId?: string): Consultation => {
      if (existingId) {
        const consultation = buildConsultation(form, createdBy, 'draft', existingId)
        dispatch({ type: 'UPDATE_CONSULTATION', payload: consultation })
        console.log('[Consultation] 更新草稿:', { id: existingId, missing: consultation.missingFields })
        return consultation
      }
      const consultation = buildConsultation(form, createdBy, 'draft')
      dispatch({ type: 'ADD_CONSULTATION', payload: consultation })
      console.log('[Consultation] 保存新草稿:', { id: consultation.id, missing: consultation.missingFields })
      return consultation
    },
    [buildConsultation]
  )

  const updateFromDetail = useCallback(
    (id: string, updates: Partial<ConsultationFormData>): Consultation | null => {
      const existing = state.consultations.find(c => c.id === id)
      if (!existing) return null
      const mergedForm: ConsultationFormData = {
        projectName: existing.projectName,
        buildingName: existing.buildingName,
        floorName: existing.floorName,
        professional: existing.professional,
        changeReason: existing.changeReason,
        originalDrawing: existing.originalDrawing,
        siteProblem: existing.siteProblem,
        suggestedSolution: existing.suggestedSolution,
        photos: existing.photos,
        locationText: existing.locationText,
        contactNo: existing.contactNo,
        drawingNo: existing.drawingNo,
        responsibleUnit: existing.responsibleUnit,
        estimatedQuantity: existing.estimatedQuantity,
        ...updates
      }
      const missing = getMissingFields(mergedForm)
      const newStatus: ConsultationStatus = missing.length === 0 ? 'submitted' : 'draft'
      const updated: Consultation = {
        ...existing,
        ...mergedForm,
        missingFields: missing,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }
      dispatch({ type: 'UPDATE_CONSULTATION', payload: updated })
      console.log('[Consultation] 从详情页更新:', { id, newStatus, missing })
      return updated
    },
    [state.consultations]
  )

  const getById = useCallback(
    (id: string): Consultation | undefined => {
      return state.consultations.find(c => c.id === id)
    },
    [state.consultations]
  )

  return (
    <ConsultationContext.Provider
      value={{
        state,
        dispatch,
        createConsultation,
        submitConsultation,
        saveDraft,
        updateFromDetail,
        getById
      }}
    >
      {children}
    </ConsultationContext.Provider>
  )
}

export const useConsultation = (): ConsultationContextType => {
  const ctx = useContext(ConsultationContext)
  if (!ctx) {
    throw new Error('useConsultation must be used within ConsultationProvider')
  }
  return ctx
}
