import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Image, Input, Textarea, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useConsultation } from '@/store/consultationContext'
import SectionTitle from '@/components/SectionTitle'
import { StatusBadge, ProfessionalTag, ReasonTag } from '@/components/StatusBadge'
import { Consultation, MISSING_FIELD_LABEL, MissingField } from '@/types/consultation'
import { formatDateFull, buildShareUrl, getMissingFields } from '@/utils'
import PhotoUploader from '@/components/PhotoUploader'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id
  const mode = router.params.mode as 'complete' | undefined
  const { getById, updateFromDetail, state } = useConsultation()

  const initialItem = getById(id || '') || state.consultations[0]

  const [item, setItem] = useState<Consultation>(initialItem)
  const [editMode, setEditMode] = useState(mode === 'complete' || false)

  const [editContactNo, setEditContactNo] = useState(item.contactNo || '')
  const [editDrawingNo, setEditDrawingNo] = useState(item.drawingNo || '')
  const [editResponsibleUnit, setEditResponsibleUnit] = useState(item.responsibleUnit || '')
  const [editEstimatedQty, setEditEstimatedQty] = useState(item.estimatedQuantity || '')
  const [editLocation, setEditLocation] = useState(item.locationText || '')

  useEffect(() => {
    const fresh = getById(id || '')
    if (fresh) {
      setItem(fresh)
      setEditContactNo(fresh.contactNo || '')
      setEditDrawingNo(fresh.drawingNo || '')
      setEditResponsibleUnit(fresh.responsibleUnit || '')
      setEditEstimatedQty(fresh.estimatedQuantity || '')
      setEditLocation(fresh.locationText || '')
    }
  }, [id, state.consultations])

  useDidShow(() => {
    console.log('[DetailPage] onShow, id=', id, 'mode=', mode)
  })

  const missingFields = useMemo(() => {
    if (editMode) {
      return getMissingFields({
        projectName: item.projectName,
        buildingName: item.buildingName,
        floorName: item.floorName,
        professional: item.professional,
        changeReason: item.changeReason,
        originalDrawing: item.originalDrawing,
        siteProblem: item.siteProblem,
        suggestedSolution: item.suggestedSolution,
        photos: item.photos,
        locationText: editLocation,
        contactNo: editContactNo,
        drawingNo: editDrawingNo,
        responsibleUnit: editResponsibleUnit,
        estimatedQuantity: editEstimatedQty
      })
    }
    return item.missingFields
  }, [item, editMode, editContactNo, editDrawingNo, editResponsibleUnit, editEstimatedQty, editLocation])

  const isMissing = (f: MissingField) => missingFields.includes(f)
  const noPhoto = item.photos.length === 0
  const missingTotal = missingFields.length + (noPhoto ? 1 : 0)

  const handlePreviewPhoto = (idx: number) => {
    Taro.previewImage({
      current: item.photos[idx].url,
      urls: item.photos.map(p => p.url)
    })
  }

  const handleCopyShare = () => {
    const url = buildShareUrl(item.shareCode)
    const summary =
`【洽商记录分享】
编号: ${item.contactNo || '（待补）'}
项目: ${item.projectName}
位置: ${item.buildingName} ${item.floorName}${item.locationText ? ' ' + item.locationText : ''}
专业: ${item.professional} · ${item.changeReason}
现场问题: ${item.siteProblem}
建议做法: ${item.suggestedSolution}
查看详情: ${url}
共享码: ${item.shareCode}`
    Taro.setClipboardData({
      data: summary,
      success: () => {
        console.log('[DetailPage] 复制分享内容成功')
        Taro.showToast({ title: '已复制分享内容', icon: 'success' })
      }
    })
  }

  const handleShowQR = () => {
    Taro.showModal({
      title: '共享二维码',
      content: `请让资料员或预算员扫描下方二维码，或输入共享码：${item.shareCode}\n\n链接：${buildShareUrl(item.shareCode)}`,
      confirmText: '复制链接',
      cancelText: '知道了',
      confirmColor: '#1E6FFF',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: buildShareUrl(item.shareCode),
            success: () => Taro.showToast({ title: '链接已复制', icon: 'success' })
          })
        }
      }
    })
  }

  const handleSaveEdits = () => {
    const result = updateFromDetail(item.id, {
      contactNo: editContactNo.trim(),
      drawingNo: editDrawingNo.trim(),
      responsibleUnit: editResponsibleUnit.trim(),
      estimatedQuantity: editEstimatedQty.trim(),
      locationText: editLocation.trim()
    })
    if (result) {
      setItem(result)
      Taro.showToast({
        title: result.status === 'draft'
          ? `已保存 · 还缺${result.missingFields.length}项`
          : '已补全 · 状态已更新',
        icon: result.status === 'draft' ? 'none' : 'success'
      })
      if (result.status !== 'draft') {
        setEditMode(false)
      }
      console.log('[DetailPage] 保存修改成功', { status: result.status, missing: result.missingFields })
    }
  }

  const handleGotoEdit = () => {
    Taro.navigateTo({ url: `/pages/create/index?editId=${item.id}` })
  }

  const handlePhotosChange = (photos) => {
    const result = updateFromDetail(item.id, { photos })
    if (result) setItem(result)
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.locationTitle}>
          {item.buildingName} · {item.floorName}
        </Text>
        <Text className={styles.projectSub}>
          {item.projectName}
          {item.locationText ? ` · ${item.locationText}` : ''}
        </Text>
        <View className={styles.tagGroup}>
          <StatusBadge status={item.status} />
          <ProfessionalTag name={item.professional} />
          <ReasonTag reason={item.changeReason} />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22 }}>
            {formatDateFull(item.createdAt)}
          </Text>
        </View>
      </View>

      <View className={styles.mainCard}>
        {missingTotal > 0 && (
          <View className={styles.missingSection}>
            <View className={styles.missingHeader}>
              <View className={styles.missingTitle}>
                <View className={styles.missingIcon}>!</View>
                还缺{missingTotal}项需要补全
              </View>
              {!editMode && (
                <Text className={styles.completeLink} onClick={() => setEditMode(true)}>
                  去补齐 ›
                </Text>
              )}
            </View>
            <View className={styles.missingFields}>
              {noPhoto && <View className={styles.missingField}>缺现场照片</View>}
              {missingFields.map(f => (
                <View className={styles.missingField} key={f}>
                  缺{MISSING_FIELD_LABEL[f]}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建人</View>
            <View className={styles.infoValue}>{item.createdBy}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>更新时间</View>
            <View className={styles.infoValue}>{formatDateFull(item.updatedAt)}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>照片数</View>
            <View className={styles.infoValue}>{item.photos.length}张</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>共享码</View>
            <View className={styles.infoValue}>{item.shareCode}</View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='原图纸做法' showIndicator />
        <View className={styles.textBlockOriginal}>{item.originalDrawing || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='现场问题' showIndicator />
        <View className={styles.textBlockProblem}>{item.siteProblem || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='建议做法' showIndicator />
        <View className={styles.textBlockSolution}>{item.suggestedSolution || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle
          title='现场照片'
          subtitle={noPhoto ? '尚未采集' : `共${item.photos.length}张`}
          showIndicator
          missingCount={noPhoto ? 1 : undefined}
        />
        {item.photos.length > 0 ? (
          <View className={styles.photoGrid}>
            {item.photos.map((p, i) => (
              <View className={styles.photoItem} key={p.id} onClick={() => handlePreviewPhoto(i)}>
                <Image
                  className={styles.photoImage}
                  src={p.url}
                  mode='aspectFill'
                  onError={(e) => console.error('[DetailPage] 图片加载失败', p.url, e)}
                />
                {p.remark && <View className={styles.photoRemark}>{p.remark}</View>}
              </View>
            ))}
            {editMode && (
              <PhotoUploader
                photos={item.photos}
                onChange={handlePhotosChange}
                maxCount={9}
                title=''
                tip=''
              />
            )}
          </View>
        ) : (
          <View className={styles.noPhotoWarning}>
            <View className={styles.noPhotoIcon}>📷</View>
            <View className={styles.noPhotoContent}>
              <Text className={styles.noPhotoTitle}>尚未采集现场照片</Text>
              <Text className={styles.noPhotoDesc}>
                没有现场照片的洽商记录无法提交，请立即补拍或从相册选择至少1张现场照片。
              </Text>
            </View>
            {!editMode ? (
              <Button
                className={styles.noPhotoBtn}
                onClick={() => setEditMode(true)}
              >
                📷 立即补拍
              </Button>
            ) : (
              <PhotoUploader
                photos={item.photos}
                onChange={handlePhotosChange}
                maxCount={9}
                title=''
                tip='至少补拍1张现场照片后才能提交'
              />
            )}
          </View>
        )}
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle
          title='业务信息'
          subtitle={editMode ? '（编辑模式，红色为缺项）' : '点击下方按钮补全缺项'}
          showIndicator
          missingCount={!editMode && missingFields.length > 0 ? missingFields.length : undefined}
        />
        {editMode ? (
          <View className={styles.editForm}>
            <View className={styles.editRow}>
              <View className={styles.editRowHeader}>
                <Text className={styles.editLabel}>联系单编号</Text>
                {isMissing('contactNo') && <View className={styles.editMissingTag}>缺项</View>}
              </View>
              <Input
                className={isMissing('contactNo') ? styles.editInputMissing : styles.editInput}
                placeholder='请输入联系单编号'
                value={editContactNo}
                onInput={(e) => setEditContactNo(e.detail.value)}
                maxlength={50}
              />
            </View>
            <View className={styles.editRow}>
              <View className={styles.editRowHeader}>
                <Text className={styles.editLabel}>图纸编号</Text>
                {isMissing('drawingNo') && <View className={styles.editMissingTag}>缺项</View>}
              </View>
              <Input
                className={isMissing('drawingNo') ? styles.editInputMissing : styles.editInput}
                placeholder='请输入图纸编号'
                value={editDrawingNo}
                onInput={(e) => setEditDrawingNo(e.detail.value)}
                maxlength={50}
              />
            </View>
            <View className={styles.editRow}>
              <View className={styles.editRowHeader}>
                <Text className={styles.editLabel}>责任单位</Text>
                {isMissing('responsibleUnit') && <View className={styles.editMissingTag}>缺项</View>}
              </View>
              <Input
                className={isMissing('responsibleUnit') ? styles.editInputMissing : styles.editInput}
                placeholder='请输入责任单位名称'
                value={editResponsibleUnit}
                onInput={(e) => setEditResponsibleUnit(e.detail.value)}
                maxlength={80}
              />
            </View>
            <View className={styles.editRow}>
              <View className={styles.editRowHeader}>
                <Text className={styles.editLabel}>预计工程量</Text>
                {isMissing('estimatedQuantity') && <View className={styles.editMissingTag}>缺项</View>}
              </View>
              <Textarea
                className={isMissing('estimatedQuantity') ? classNames(styles.editTextarea, styles.editInputMissing) : styles.editTextarea}
                placeholder='请描述主要材料、数量等工程量信息'
                value={editEstimatedQty}
                onInput={(e) => setEditEstimatedQty(e.detail.value)}
                maxlength={200}
                autoHeight
              />
            </View>
            <View className={styles.editRow}>
              <View className={styles.editRowHeader}>
                <Text className={styles.editLabel}>位置描述（轴线/房间号）</Text>
              </View>
              <Input
                className={styles.editInput}
                placeholder='补充轴线或房间位置信息'
                value={editLocation}
                onInput={(e) => setEditLocation(e.detail.value)}
                maxlength={80}
              />
            </View>
          </View>
        ) : (
          <View>
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>联系单编号</Text>
              <Text className={styles.metaValue} style={{ color: item.contactNo ? '#1D2129' : '#F53F3F' }}>
                {item.contactNo || '待补'}
              </Text>
            </View>
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>图纸编号</Text>
              <Text className={styles.metaValue} style={{ color: item.drawingNo ? '#1D2129' : '#F53F3F' }}>
                {item.drawingNo || '待补'}
              </Text>
            </View>
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>责任单位</Text>
              <Text className={styles.metaValue} style={{ color: item.responsibleUnit ? '#1D2129' : '#F53F3F' }}>
                {item.responsibleUnit || '待补'}
              </Text>
            </View>
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>预计工程量</Text>
              <Text
                className={styles.metaValue}
                style={{
                  color: item.estimatedQuantity ? '#1D2129' : '#F53F3F',
                  alignSelf: 'flex-end',
                  textAlign: 'right',
                  maxWidth: '60%',
                  wordBreak: 'break-all',
                  whiteSpace: 'normal'
                }}
              >
                {item.estimatedQuantity || '待补'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.qrCard} onClick={handleShowQR}>
        <View className={styles.qrLeft}>
          <View className={styles.qrBox}>
            <View className={styles.qrPattern} />
            <View className={styles.qrCenter}>📋</View>
          </View>
          <Text className={styles.qrCode}>码: {item.shareCode}</Text>
        </View>
        <View className={styles.qrRight}>
          <Text className={styles.qrTitle}>现场共享二维码</Text>
          <Text className={styles.qrDesc}>
            资料员、预算员扫码即可查看同一条洽商的照片、位置和说明，避免微信群反复找图。
          </Text>
          <View className={styles.qrActions}>
            <Button className={styles.qrBtn} onClick={(e) => { e.stopPropagation && e.stopPropagation(); handleShowQR() }}>
              🔳 放大二维码
            </Button>
            <Button
              className={styles.qrBtnPrimary}
              onClick={(e) => { e.stopPropagation && e.stopPropagation(); handleCopyShare() }}
            >
              📋 复制分享
            </Button>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        {editMode ? (
          <>
            <Button className={styles.secondaryBtn} onClick={() => setEditMode(false)}>
              取消编辑
            </Button>
            <Button className={styles.primaryBtn} onClick={handleSaveEdits}>
              {missingTotal > 0 ? `还缺${missingTotal}项，保存` : '✓ 保存并提交'}
            </Button>
          </>
        ) : (
          <>
            <Button className={styles.secondaryBtn} onClick={handleGotoEdit}>
              ✏️ 修改内容
            </Button>
            <Button
              className={styles.primaryBtn}
              onClick={() => {
                if (missingTotal > 0) {
                  setEditMode(true)
                } else {
                  handleCopyShare()
                }
              }}
            >
              {missingTotal > 0 ? `补全${missingTotal}项缺项` : '📨 共享给资料员'}
            </Button>
          </>
        )}
      </View>
    </View>
  )
}

export default DetailPage
