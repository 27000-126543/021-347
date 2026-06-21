export type ConsultationStatus = 'draft' | 'submitted' | 'completed'

export type ConsultationProfessional =
  | '建筑'
  | '结构'
  | '给排水'
  | '暖通空调'
  | '电气'
  | '消防'
  | '弱电'
  | '装饰装修'

export type ChangeReason =
  | '设计变更'
  | '现场签证'
  | '材料代换'
  | '工艺调整'
  | '功能优化'
  | '其他'

export type MissingField =
  | 'photos'
  | 'contactNo'
  | 'drawingNo'
  | 'responsibleUnit'
  | 'estimatedQuantity'

export interface ConsultationPhoto {
  id: string
  url: string
  base64?: string
  remark?: string
  uploadedAt: string
}

export interface SharePayload {
  sc: string
  pn: string
  bn: string
  fn: string
  pf: ConsultationProfessional
  cr: ChangeReason
  od: string
  sp: string
  sl: string
  ph: Array<{ u: string; b?: string; r?: string }>
  lt?: string
  by: string
  ct: string
  mf?: string[]
}

export interface Consultation {
  id: string
  projectName: string
  buildingName: string
  floorName: string
  professional: ConsultationProfessional
  changeReason: ChangeReason
  originalDrawing: string
  siteProblem: string
  suggestedSolution: string
  photos: ConsultationPhoto[]
  locationText?: string
  contactNo?: string
  drawingNo?: string
  responsibleUnit?: string
  estimatedQuantity?: string
  status: ConsultationStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  missingFields: MissingField[]
  shareCode: string
}

export interface ConsultationFormData {
  projectName: string
  buildingName: string
  floorName: string
  professional: ConsultationProfessional
  changeReason: ChangeReason
  originalDrawing: string
  siteProblem: string
  suggestedSolution: string
  photos: ConsultationPhoto[]
  locationText?: string
  contactNo?: string
  drawingNo?: string
  responsibleUnit?: string
  estimatedQuantity?: string
}

export const PROFESSIONAL_OPTIONS: ConsultationProfessional[] = [
  '建筑',
  '结构',
  '给排水',
  '暖通空调',
  '电气',
  '消防',
  '弱电',
  '装饰装修'
]

export const CHANGE_REASON_OPTIONS: ChangeReason[] = [
  '设计变更',
  '现场签证',
  '材料代换',
  '工艺调整',
  '功能优化',
  '其他'
]

export const STATUS_LABEL: Record<ConsultationStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  completed: '已完成'
}

export const MISSING_FIELD_LABEL: Record<MissingField, string> = {
  photos: '现场照片',
  contactNo: '联系单编号',
  drawingNo: '图纸编号',
  responsibleUnit: '责任单位',
  estimatedQuantity: '预计工程量'
}

export const MOCK_PROJECTS = [
  '朝阳新城A区一期',
  '绿城桂花苑3号楼',
  '滨江科技园B栋',
  '中心医院住院楼改造',
  '地铁4号线车辆段'
]

export const MOCK_BUILDINGS = [
  '1号楼',
  '2号楼',
  '3号楼',
  'A栋',
  'B栋',
  '地下车库',
  '机房层',
  '裙楼'
]

export const MOCK_FLOORS = [
  'B2层',
  'B1层',
  '1层',
  '2层',
  '3层',
  '4层',
  '5层',
  '6层',
  '屋面层',
  '管井'
]
