import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Consultation, ConsultationFormData, ConsultationStatus, MissingField } from '@/types/consultation'
import { mockConsultations } from '@/data/mockConsultations'
import { generateId, generateShareCode, getMissingFields } from '@/utils'

const STORAGE_KEY = 'consultation_records_v1'

const loadPersistedConsultations = (): Consultation[] => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'string' && raw.length > 0) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('[Consultation] 从本地存储加载记录:', parsed.length, '条')
        return parsed
      }
    }
  } catch (e) {
    console.warn('[Consultation] 读取本地存储失败，使用示例数据', e)
  }
  return mockConsultations
}

const persistConsultations = (list: Consultation[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('[Consultation] 写入本地存储失败', e)
  }
}

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
  consultations: loadPersistedConsultations(),
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
  getByShareCode: (shareCode: string) => Consultation | undefined
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined)

export const ConsultationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const calcActualStatus = useCallback((form: ConsultationFormData): ConsultationStatus => {
    if (getMissingFields(form).length > 0) return 'draft'
    return 'submitted'
  }, [])

  const buildConsultation = useCallback(
    (
      form: ConsultationFormData,
      createdBy: string,
      status: ConsultationStatus,
      existingId?: string
    ): Consultation => {
      const actualStatus: ConsultationStatus =
        status === 'submitted' ? calcActualStatus(form) : 'draft'
      const missing = actualStatus === 'draft' ? getMissingFields(form) : []
      const now = new Date().toISOString()

      if (existingId) {
        const existing = state.consultations.find(c => c.id === existingId)
        return {
          ...existing!,
          ...form,
          status: actualStatus,
          missingFields: missing,
          updatedAt: now
        }
      }

      return {
        id: generateId(),
        ...form,
        status: actualStatus,
        createdAt: now,
        updatedAt: now,
        createdBy,
        missingFields: missing,
        shareCode: generateShareCode()
      }
    },
    [state.consultations, calcActualStatus]
  )

  const createConsultation = useCallback(
    (form: ConsultationFormData, createdBy: string): Consultation => {
      const status = calcActualStatus(form)
      const consultation = buildConsultation(form, createdBy, status)
      dispatch({ type: 'ADD_CONSULTATION', payload: consultation })
      console.log('[Consultation] 创建洽商记录:', { id: consultation.id, status })
      return consultation
    },
    [buildConsultation, calcActualStatus]
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
      const newStatus: ConsultationStatus = calcActualStatus(mergedForm)
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
    [state.consultations, calcActualStatus]
  )

  const getById = useCallback(
    (id: string): Consultation | undefined => {
      return state.consultations.find(c => c.id === id)
    },
    [state.consultations]
  )

  const getByShareCode = useCallback(
    (shareCode: string): Consultation | undefined => {
      if (!shareCode) return undefined
      const normalized = shareCode.trim().toUpperCase()
      return state.consultations.find(c => c.shareCode.toUpperCase() === normalized)
    },
    [state.consultations]
  )

  useEffect(() => {
    persistConsultations(state.consultations)
    console.log('[Consultation] 已持久化到本地存储:', state.consultations.length, '条')
  }, [state.consultations])

  return (
    <ConsultationContext.Provider
      value={{
        state,
        dispatch,
        createConsultation,
        submitConsultation,
        saveDraft,
        updateFromDetail,
        getById,
        getByShareCode
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
