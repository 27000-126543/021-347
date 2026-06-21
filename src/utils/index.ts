import { MissingField, ConsultationFormData, Consultation } from '@/types/consultation'

export const generateId = (): string => {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`
}

export const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

export const formatDateFull = (dateStr: string): string => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const getMissingFields = (form: ConsultationFormData): MissingField[] => {
  const missing: MissingField[] = []
  if (!form.contactNo || form.contactNo.trim() === '') missing.push('contactNo')
  if (!form.drawingNo || form.drawingNo.trim() === '') missing.push('drawingNo')
  if (!form.responsibleUnit || form.responsibleUnit.trim() === '') missing.push('responsibleUnit')
  if (!form.estimatedQuantity || form.estimatedQuantity.trim() === '') missing.push('estimatedQuantity')
  return missing
}

export const isFormComplete = (form: ConsultationFormData): boolean => {
  return getMissingFields(form).length === 0
}

export const getBasicCompletionCheck = (form: ConsultationFormData): boolean => {
  return (
    form.projectName.trim() !== '' &&
    form.buildingName.trim() !== '' &&
    form.professional !== null &&
    form.changeReason !== null &&
    form.siteProblem.trim() !== ''
  )
}

export const truncateText = (text: string, maxLen: number): string => {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

export const buildShareUrl = (shareCode: string): string => {
  return `/pages/share/index?shareCode=${shareCode.toUpperCase()}`
}
