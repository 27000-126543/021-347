import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useConsultation } from '@/store/consultationContext'
import SectionTitle from '@/components/SectionTitle'
import PhotoUploader from '@/components/PhotoUploader'
import VoiceRecorder from '@/components/VoiceRecorder'
import {
  ConsultationFormData,
  ConsultationPhoto,
  PROFESSIONAL_OPTIONS,
  CHANGE_REASON_OPTIONS,
  ConsultationProfessional,
  ChangeReason,
  MOCK_PROJECTS,
  MOCK_BUILDINGS,
  MOCK_FLOORS,
  MISSING_FIELD_LABEL
} from '@/types/consultation'
import { getMissingFields, getBasicCompletionCheck } from '@/utils'

const CreatePage: React.FC = () => {
  const router = useRouter()
  const { saveDraft, submitConsultation, createConsultation, getById } = useConsultation()
  const editId = router.params.editId

  const [form, setForm] = useState<ConsultationFormData>(() => {
    if (editId) {
      const existing = getById(editId)
      if (existing) {
        console.log('[CreatePage] 编辑模式，加载已有记录:', editId)
        return {
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
          estimatedQuantity: existing.estimatedQuantity
        }
      }
    }
    return {
      projectName: '',
      buildingName: '',
      floorName: '',
      professional: '电气',
      changeReason: '现场签证',
      originalDrawing: '',
      siteProblem: '',
      suggestedSolution: '',
      photos: [],
      locationText: '',
      contactNo: '',
      drawingNo: '',
      responsibleUnit: '',
      estimatedQuantity: ''
    }
  })

  const [confirmSteps, setConfirmSteps] = useState({
    original: false,
    problem: false,
    solution: false
  })

  useDidShow(() => {
    console.log('[CreatePage] onShow, editId=', editId)
  })

  const missingFields = useMemo(() => getMissingFields(form), [form])
  const isBasicOK = useMemo(() => getBasicCompletionCheck(form), [form])
  const canSubmit = isBasicOK && confirmSteps.original && confirmSteps.problem && confirmSteps.solution

  const updateForm = useCallback(<K extends keyof ConsultationFormData>(
    key: K,
    value: ConsultationFormData[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleProjectPicker = (e) => {
    const idx = e.detail.value
    updateForm('projectName', MOCK_PROJECTS[idx])
    console.log('[CreatePage] 选择项目:', MOCK_PROJECTS[idx])
  }

  const handleBuildingPicker = (e) => {
    const idx = e.detail.value
    updateForm('buildingName', MOCK_BUILDINGS[idx])
  }

  const handleFloorPicker = (e) => {
    const idx = e.detail.value
    updateForm('floorName', MOCK_FLOORS[idx])
  }

  const handleProfessionalPicker = (e) => {
    const idx = e.detail.value
    updateForm('professional', PROFESSIONAL_OPTIONS[idx] as ConsultationProfessional)
  }

  const handleReasonPicker = (e) => {
    const idx = e.detail.value
    updateForm('changeReason', CHANGE_REASON_OPTIONS[idx] as ChangeReason)
  }

  const handlePhotosChange = (photos: ConsultationPhoto[]) => {
    updateForm('photos', photos)
  }

  const validateBeforeSubmit = (): string | null => {
    if (!form.projectName) return '请选择项目名称'
    if (!form.buildingName) return '请选择楼栋'
    if (!form.floorName) return '请选择楼层/区域'
    if (!form.professional) return '请选择专业'
    if (!form.changeReason) return '请选择变更原因'
    if (!form.siteProblem.trim()) return '请填写现场问题描述'
    if (!confirmSteps.original) return '请先确认【原图纸做法】内容'
    if (!confirmSteps.problem) return '请先确认【现场问题】内容'
    if (!confirmSteps.solution) return '请先确认【建议做法】内容'
    if (form.photos.length === 0) return '请至少拍摄或选择1张现场照片，无照片记录不予提交'
    return null
  }

  const handleSaveDraft = () => {
    if (!isBasicOK) {
      Taro.showModal({
        title: '基础信息不完整',
        content: '项目、楼栋、专业、变更原因和现场问题是必填项，请先填写后再保存草稿。',
        showCancel: false,
        confirmColor: '#1E6FFF'
      })
      return
    }
    const result = editId
      ? saveDraft(form, '张工长', editId)
      : saveDraft(form, '张工长')
    console.log('[CreatePage] 保存草稿成功:', result.id, '缺项:', result.missingFields)
    const noPhoto = form.photos.length === 0
    const missingTotal = missingFields.length + (noPhoto ? 1 : 0)
    Taro.showToast({
      title: missingTotal > 0
        ? `草稿已保存 · 缺${missingTotal}项${noPhoto ? '(含照片)' : ''}`
        : '草稿已保存',
      icon: 'none',
      duration: 2000
    })
    setTimeout(() => Taro.navigateBack(), 900)
  }

  const handleSubmit = () => {
    const err = validateBeforeSubmit()
    if (err) {
      Taro.showToast({ title: err, icon: 'none' })
      return
    }
    const doSubmit = () => {
      const result = editId
        ? submitConsultation(form, '张工长', editId)
        : createConsultation(form, '张工长')
      console.log('[CreatePage] 提交洽商成功:', result.id, '状态:', result.status)
      Taro.showToast({
        title: result.status === 'draft' ? '已保存(还有缺项)' : '洽商已提交',
        icon: 'success'
      })
      setTimeout(() => {
        if (result.status === 'draft') {
          Taro.switchTab({ url: '/pages/drafts/index' })
        } else {
          Taro.redirectTo({ url: `/pages/detail/index?id=${result.id}` })
        }
      }, 1200)
    }
    if (missingFields.length > 0) {
      const missingNames = missingFields.map(f => MISSING_FIELD_LABEL[f]).join('、')
      Taro.showModal({
        title: `还有${missingFields.length}项未填`,
        content: `缺：${missingNames}。\n\n确认提交？缺项记录将自动进入待完善清单，收工前需补齐。`,
        confirmText: '先提交再说',
        cancelText: '继续补齐',
        confirmColor: '#FF7A00',
        success: (res) => {
          if (res.confirm) doSubmit()
        }
      })
    } else {
      doSubmit()
    }
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.breadcrumb}>
          <Text>🏗️ 现场采集</Text>
          <Text>›</Text>
          <Text>{editId ? '编辑洽商' : '新建洽商'}</Text>
        </View>
        <Text className={styles.pageTitle}>{editId ? '编辑洽商记录' : '开始现场采集'}</Text>
        <Text className={styles.pageDesc}>
          选择项目信息 → 拍照记录 → 语音说明 → 逐项确认。跟随流程 3 分钟搞定，不用回办公室再补录！
        </Text>
      </View>

      <View className={styles.contentArea}>
        <View className={styles.sectionCard}>
          <SectionTitle
            title='基础信息'
            required
            showIndicator
            subtitle='（必填）'
          />
          <Picker mode='selector' range={MOCK_PROJECTS} onChange={handleProjectPicker}>
            <View className={styles.pickerRow}>
              <View className={styles.pickerLabel}>
                <Text className={styles.required}>*</Text>所属项目
              </View>
              <Text className={form.projectName ? styles.pickerValue : styles.placeholderValue}>
                {form.projectName || '请选择项目'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>

          <Picker mode='selector' range={MOCK_BUILDINGS} onChange={handleBuildingPicker}>
            <View className={styles.pickerRow}>
              <View className={styles.pickerLabel}>
                <Text className={styles.required}>*</Text>楼栋
              </View>
              <Text className={form.buildingName ? styles.pickerValue : styles.placeholderValue}>
                {form.buildingName || '请选择楼栋'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>

          <Picker mode='selector' range={MOCK_FLOORS} onChange={handleFloorPicker}>
            <View className={styles.pickerRow}>
              <View className={styles.pickerLabel}>
                <Text className={styles.required}>*</Text>楼层/区域
              </View>
              <Text className={form.floorName ? styles.pickerValue : styles.placeholderValue}>
                {form.floorName || '请选择楼层或机房/管井'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>

          <Picker mode='selector' range={PROFESSIONAL_OPTIONS} onChange={handleProfessionalPicker}>
            <View className={styles.pickerRow}>
              <View className={styles.pickerLabel}>
                <Text className={styles.required}>*</Text>专业
              </View>
              <Text className={form.professional ? styles.pickerValue : styles.placeholderValue}>
                {form.professional || '请选择专业'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>

          <Picker mode='selector' range={CHANGE_REASON_OPTIONS} onChange={handleReasonPicker}>
            <View className={styles.pickerRow}>
              <View className={styles.pickerLabel}>
                <Text className={styles.required}>*</Text>变更原因
              </View>
              <Text className={form.changeReason ? styles.pickerValue : styles.placeholderValue}>
                {form.changeReason || '请选择原因类型'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>

          <View className={styles.inputRow}>
            <View className={styles.inputLabel}>
              位置描述
              <Text className={styles.optional}>（选填，补充轴线/房间号）</Text>
            </View>
            <Input
              className={styles.textInput}
              placeholder='例：A栋3层东走廊C轴- E轴 / 2号机房北侧...'
              value={form.locationText}
              onInput={(e) => updateForm('locationText', e.detail.value)}
              maxlength={80}
            />
          </View>
        </View>

        <View className={styles.sectionCard}>
          <SectionTitle title='现场照片' required showIndicator />
          <PhotoUploader
            photos={form.photos}
            onChange={handlePhotosChange}
            maxCount={9}
            required={true}
            title=''
            tip='提交洽商记录必须至少1张现场照片；仅保存草稿可暂空，后续补上再提交。建议从整体到局部拍摄，标注关键尺寸或冲突点。'
          />
        </View>

        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>🎙️ 语音录入说明</Text>
          <Text className={styles.tipsText}>
            依次点击下方麦克风按钮录制三项内容，系统会自动转写为文字并弹出确认框。
            也可以直接点击「快捷语料」快速填入常见描述，再手动微调。
            三项全部「✓ 确认无误」后才能提交。
          </Text>
        </View>

        <View className={styles.voiceSection}>
          <View className={styles.sectionCard}>
            <SectionTitle
              title='① 原图纸做法'
              required
              showIndicator
              missingCount={confirmSteps.original ? 0 : undefined}
              rightSlot={confirmSteps.original ? (
                <View style={{ fontSize: 24, color: '#00B42A', fontWeight: 700 }}>✓</View>
              ) : null}
            />
            <VoiceRecorder
              fieldLabel='原图纸做法'
              value={form.originalDrawing}
              placeholder='说出原设计图纸的做法描述'
              onChange={(v) => updateForm('originalDrawing', v)}
              onConfirm={() => {
                if (!form.originalDrawing.trim()) {
                  Taro.showToast({ title: '请先录音或填写内容', icon: 'none' })
                  return
                }
                setConfirmSteps(p => ({ ...p, original: true }))
                Taro.showToast({ title: '已确认原图纸做法', icon: 'success' })
              }}
            />
          </View>

          <View className={styles.sectionCard}>
            <SectionTitle
              title='② 现场问题'
              required
              showIndicator
              missingCount={confirmSteps.problem ? 0 : undefined}
              rightSlot={confirmSteps.problem ? (
                <View style={{ fontSize: 24, color: '#00B42A', fontWeight: 700 }}>✓</View>
              ) : null}
            />
            <VoiceRecorder
              fieldLabel='现场问题'
              value={form.siteProblem}
              placeholder='说出现场发现的具体问题、尺寸偏差、冲突点等'
              onChange={(v) => updateForm('siteProblem', v)}
              onConfirm={() => {
                if (!form.siteProblem.trim()) {
                  Taro.showToast({ title: '请先录音或填写内容', icon: 'none' })
                  return
                }
                setConfirmSteps(p => ({ ...p, problem: true }))
                Taro.showToast({ title: '已确认现场问题', icon: 'success' })
              }}
            />
          </View>

          <View className={styles.sectionCard}>
            <SectionTitle
              title='③ 建议做法'
              required
              showIndicator
              missingCount={confirmSteps.solution ? 0 : undefined}
              rightSlot={confirmSteps.solution ? (
                <View style={{ fontSize: 24, color: '#00B42A', fontWeight: 700 }}>✓</View>
              ) : null}
            />
            <VoiceRecorder
              fieldLabel='建议做法'
              value={form.suggestedSolution}
              placeholder='说出建议的变更方案、材料调整或施工措施'
              onChange={(v) => updateForm('suggestedSolution', v)}
              onConfirm={() => {
                if (!form.suggestedSolution.trim()) {
                  Taro.showToast({ title: '请先录音或填写内容', icon: 'none' })
                  return
                }
                setConfirmSteps(p => ({ ...p, solution: true }))
                Taro.showToast({ title: '已确认建议做法', icon: 'success' })
              }}
            />
          </View>
        </View>

        <View className={styles.sectionCard}>
          <SectionTitle
            title='完善信息（可选，后补也行）'
            showIndicator
            missingCount={missingFields.length}
            subtitle='未填将进入待完善清单'
          />
          <View className={styles.inputRow}>
            <View className={styles.inputLabel}>
              联系单编号
              {!form.contactNo && <Text className={styles.optional}>（缺·红色）</Text>}
            </View>
            <Input
              className={styles.textInput}
              placeholder='例：QSCX-2024-0621-001'
              value={form.contactNo}
              onInput={(e) => updateForm('contactNo', e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.inputRow}>
            <View className={styles.inputLabel}>
              图纸编号
              {!form.drawingNo && <Text className={styles.optional}>（缺·红色）</Text>}
            </View>
            <Input
              className={styles.textInput}
              placeholder='例：施电-03-DQ-09修1'
              value={form.drawingNo}
              onInput={(e) => updateForm('drawingNo', e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.inputRow}>
            <View className={styles.inputLabel}>
              责任单位
              {!form.responsibleUnit && <Text className={styles.optional}>（缺·红色）</Text>}
            </View>
            <Input
              className={styles.textInput}
              placeholder='例：中建八局第三分公司'
              value={form.responsibleUnit}
              onInput={(e) => updateForm('responsibleUnit', e.detail.value)}
              maxlength={80}
            />
          </View>

          <View className={styles.inputRow}>
            <View className={styles.inputLabel}>
              预计工程量
              {!form.estimatedQuantity && <Text className={styles.optional}>（缺·红色）</Text>}
            </View>
            <Textarea
              className={styles.textareaInput}
              placeholder='例：KBG20管约120米，吊杆灯盘6套，辅材另计...'
              value={form.estimatedQuantity}
              onInput={(e) => updateForm('estimatedQuantity', e.detail.value)}
              maxlength={200}
              autoHeight
            />
            <Text className={styles.inputCounter}>
              {(form.estimatedQuantity || '').length} / 200
            </Text>
          </View>
        </View>

        {canSubmit && (
          <View className={styles.confirmStepSection}>
            <View className={styles.confirmTitle}>
              <View className={styles.checkIcon}>✓</View>
              三项语音已确认，可提交
            </View>
            <View className={styles.confirmList}>
              <View className={styles.confirmItem}>
                <Text className={styles.confirmItemLabel}>原图纸：</Text>
                <Text className={styles.confirmItemValue}>{form.originalDrawing}</Text>
              </View>
              <View className={styles.confirmItem}>
                <Text className={styles.confirmItemLabel}>现场问题：</Text>
                <Text className={styles.confirmItemValue}>{form.siteProblem}</Text>
              </View>
              <View className={styles.confirmItem}>
                <Text className={styles.confirmItemLabel}>建议做法：</Text>
                <Text className={styles.confirmItemValue}>{form.suggestedSolution}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.draftBtn} onClick={handleSaveDraft}>
          💾 保存草稿
        </Button>
        <Button
          className={canSubmit ? styles.submitBtn : styles.submitBtnDisabled}
          onClick={handleSubmit}
        >
          {missingFields.length > 0 ? `提交（缺${missingFields.length}项）` : '✓ 立即提交'}
        </Button>
      </View>
    </View>
  )
}

export default CreatePage
