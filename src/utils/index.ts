import { MissingField, ConsultationFormData, Consultation, SharePayload, ConsultationPhoto } from '@/types/consultation'

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

/** 编码共享载荷为 URL 安全的 Base64（UTF-8 中文兼容，跨端）*/
export const encodeSharePayload = (payload: SharePayload): string => {
  try {
    const jsonStr = JSON.stringify(payload)
    const encoder = new TextEncoder()
    const utf8Bytes = encoder.encode(jsonStr)
    const base64 = Taro.arrayBufferToBase64(utf8Bytes.buffer as ArrayBuffer)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (e) {
    console.warn('[Share] 编码失败', e)
    return ''
  }
}

/** 解码 URL 安全 Base64 为共享载荷 */
export const decodeSharePayload = (base64Url: string): SharePayload | null => {
  try {
    if (!base64Url || base64Url.length < 10) return null
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const pad = 4 - (base64.length % 4)
    if (pad < 4) base64 += '='.repeat(pad)
    const arrayBuffer = Taro.base64ToArrayBuffer(base64)
    const decoder = new TextDecoder('utf-8')
    const jsonStr = decoder.decode(arrayBuffer)
    return JSON.parse(jsonStr) as SharePayload
  } catch (e) {
    console.warn('[Share] 解码失败', base64Url, e)
    return null
  }
}

/** 从 Consultation 构建共享载荷（只含资料员需要的关键字段）*/
export const buildSharePayload = (item: Consultation): SharePayload => {
  return {
    sc: item.shareCode,
    pn: item.projectName,
    bn: item.buildingName,
    fn: item.floorName,
    pf: item.professional,
    cr: item.changeReason,
    od: item.originalDrawing || '',
    sp: item.siteProblem || '',
    sl: item.suggestedSolution || '',
    ph: item.photos.map((p: ConsultationPhoto) => ({ u: p.url, r: p.remark })),
    lt: item.locationText,
    by: item.createdBy,
    ct: item.createdAt
  }
}

/** 从共享载荷还原为只读 Consultation 显示对象 */
export const restoreFromSharePayload = (payload: SharePayload): Partial<Consultation> => {
  return {
    shareCode: payload.sc,
    projectName: payload.pn,
    buildingName: payload.bn,
    floorName: payload.fn,
    professional: payload.pf,
    changeReason: payload.cr,
    originalDrawing: payload.od,
    siteProblem: payload.sp,
    suggestedSolution: payload.sl,
    photos: payload.ph.map((p, i) => ({
      id: `share-${i}`,
      url: p.u,
      remark: p.r,
      uploadedAt: payload.ct
    })),
    locationText: payload.lt,
    createdBy: payload.by,
    createdAt: payload.ct,
    status: 'submitted',
    missingFields: []
  }
}

export const getMissingFields = (form: ConsultationFormData): MissingField[] => {
  const missing: MissingField[] = []
  if (!form.photos || form.photos.length === 0) missing.push('photos')
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

export const buildShareUrl = (item: Consultation): string => {
  const payload = buildSharePayload(item)
  const data = encodeSharePayload(payload)
  const baseUrl = `/pages/share/index?shareCode=${item.shareCode.toUpperCase()}`
  return data ? `${baseUrl}&data=${data}` : baseUrl
}
