import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'
import { StatusBadge, ProfessionalTag, ReasonTag } from '@/components/StatusBadge'
import SectionTitle from '@/components/SectionTitle'
import { formatDateFull, decodeSharePayload, restoreFromSharePayload } from '@/utils'
import { Consultation, MissingField, MISSING_FIELD_LABEL } from '@/types/consultation'

type DisplaySource = 'url-data' | 'local-cache' | null
type ReviewStatus = 'viewed' | 'pending-supply' | 'ready'

const REVIEW_STORAGE_KEY = 'shared_review_status_v1'
const HIDDEN_MISSING: MissingField[] = ['photos']

const REVIEW_OPTIONS: Array<{ key: ReviewStatus; label: string; color: string; icon: string; hint: string }> = [
  { key: 'viewed', label: '已看', color: '#1E6FFF', icon: '👁️', hint: '已查看，未做判断' },
  { key: 'pending-supply', label: '待补资料', color: '#F53F3F', icon: '📋', hint: '联系施工员补齐资料' },
  { key: 'ready', label: '可整理联系单', color: '#00B42A', icon: '✅', hint: '信息完整，可出联系单' },
]

const loadReviewStatus = (): Record<string, ReviewStatus> => {
  try {
    const raw = Taro.getStorageSync(REVIEW_STORAGE_KEY)
    if (raw && typeof raw === 'string') return JSON.parse(raw)
  } catch { }
  return {}
}

const saveReviewStatus = (data: Record<string, ReviewStatus>) => {
  try {
    Taro.setStorageSync(REVIEW_STORAGE_KEY, JSON.stringify(data))
  } catch { }
}

interface DisplayState {
  item: Partial<Consultation> | null
  source: DisplaySource
  shareCode: string
  notFound: boolean
  loading: boolean
}

const SharePage: React.FC = () => {
  const router = useRouter()
  const { getByShareCode } = useConsultation()

  const urlShareCode = router.params.shareCode || router.params.code || router.params.sharecode || ''
  const urlData = router.params.data || ''

  const [manualCode, setManualCode] = useState('')
  const [searchTrigger, setSearchTrigger] = useState(0)
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewStatus>>(() => loadReviewStatus())
  const [showCopyMenu, setShowCopyMenu] = useState(false)

  useEffect(() => {
    console.log('[SharePage] mounted, urlShareCode=', urlShareCode, 'dataLen=', urlData.length)
  }, [urlShareCode, urlData])

  const displayState = useMemo((): DisplayState => {
    const activeShareCode = searchTrigger > 0
      ? manualCode.trim().toUpperCase()
      : urlShareCode.trim().toUpperCase()
    const activeData = searchTrigger > 0 ? null : urlData

    if (activeData && activeData.length > 20) {
      const payload = decodeSharePayload(activeData)
      if (payload) {
        const restored = restoreFromSharePayload(payload)
        if (restored.shareCode?.toUpperCase() === activeShareCode) {
          return {
            item: restored,
            source: 'url-data',
            shareCode: activeShareCode,
            notFound: false,
            loading: false
          }
        }
      }
    }

    if (!activeShareCode) {
      return { item: null, source: null, shareCode: '', notFound: false, loading: false }
    }

    const found = getByShareCode(activeShareCode)
    if (found) {
      return {
        item: found,
        source: 'local-cache',
        shareCode: activeShareCode,
        notFound: false,
        loading: false
      }
    }

    return {
      item: null,
      source: null,
      shareCode: activeShareCode,
      notFound: true,
      loading: false
    }
  }, [urlShareCode, urlData, manualCode, searchTrigger, getByShareCode])

  const { item, source, shareCode, notFound, loading } = displayState
  const currentReviewStatus = shareCode ? (reviewMap[shareCode] || null) : null

  const visibleMissingFields = useMemo(() => {
    if (!item?.missingFields) return []
    return item.missingFields.filter(f => !HIDDEN_MISSING.includes(f))
  }, [item])

  const hasBusinessInfo = useMemo((): Consultation | null => {
    if (!item) return null
    if (!item.shareCode) return null
    return item as Consultation
  }, [item])

  const handleSetReview = (status: ReviewStatus) => {
    if (!shareCode) return
    const next = { ...reviewMap, [shareCode]: status }
    setReviewMap(next)
    saveReviewStatus(next)
    const opt = REVIEW_OPTIONS.find(o => o.key === status)
    Taro.showToast({ title: `已标记：${opt?.label || status}`, icon: 'none', duration: 1500 })
  }

  const handlePreviewPhoto = (idx: number) => {
    if (!item?.photos) return
    Taro.previewImage({
      current: item.photos[idx].url,
      urls: item.photos.map(p => p.url)
    })
  }

  const buildCopyMaterial = (mode: 'simple' | 'full', t: Consultation): string => {
    const businessBlock =
`联系单编号：${t.contactNo || '（待补）'}
图纸编号：${t.drawingNo || '（待补）'}
责任单位：${t.responsibleUnit || '（待补）'}
预计工程量：${t.estimatedQuantity || '（待补）'}`

    const photoList = t.photos && t.photos.length > 0
      ? t.photos.map((p, i) => {
        const remark = p.remark || '现场照片'
        return `  ${i + 1}. ${remark}`
      }).join('\n')
      : '  （暂无照片）'

    const missingBlock = visibleMissingFields.length > 0
      ? `⚠️ 待补项：${visibleMissingFields.map(f => MISSING_FIELD_LABEL[f]).join('、')}`
      : '✅ 信息完整，可整理联系单'

    if (mode === 'simple') {
      return (
`【洽商】${t.buildingName} ${t.floorName}${t.locationText ? ' ' + t.locationText : ''}
项目：${t.projectName}
专业：${t.professional} / 原因：${t.changeReason}

▶ 原做法：${(t.originalDrawing || '（未填写）').split('\n')[0]}
▶ 现问题：${(t.siteProblem || '（未填写）').split('\n')[0]}
▶ 建议：${(t.suggestedSolution || '（未填写）').split('\n')[0]}

现场照片：${t.photos?.length || 0}张
${missingBlock}
创建人：${t.createdBy} · ${formatDateFull(t.createdAt)}
共享码：${t.shareCode}`
      )
    }

    return (
`━━━━━━━━━━━━━━━━
  变更洽商联系单（完整版）
━━━━━━━━━━━━━━━━

【基本信息】
项目名称：${t.projectName}
现场位置：${t.buildingName} ${t.floorName}${t.locationText ? ' ' + t.locationText : ''}
所属专业：${t.professional}
变更原因：${t.changeReason}

【业务信息】
${businessBlock}

【原图纸做法】
${t.originalDrawing || '（未填写）'}

【现场问题】
${t.siteProblem || '（未填写）'}

【建议做法】
${t.suggestedSolution || '（未填写）'}

【现场照片清单】
${photoList}

【说明】
${missingBlock}

创建人：${t.createdBy}
创建时间：${formatDateFull(t.createdAt)}
共享码：${t.shareCode}
━━━━━━━━━━━━━━━━`
    )
  }

  const handleCopy = (mode: 'simple' | 'full') => {
    if (!hasBusinessInfo) return
    const text = buildCopyMaterial(mode, hasBusinessInfo)
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: mode === 'simple' ? '简版已复制（微信用）' : '完整版已复制（文档用）', icon: 'success', duration: 2000 })
        setShowCopyMenu(false)
      }
    })
  }

  const handleSearch = () => {
    if (!manualCode.trim()) {
      Taro.showToast({ title: '请输入共享码', icon: 'none' })
      return
    }
    setSearchTrigger(t => t + 1)
  }

  const handleResetToUrlCode = () => {
    setManualCode('')
    setSearchTrigger(0)
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  if (loading) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.loadingWrap}>
          <View className={styles.loadingSpinner} />
          <Text>正在加载洽商记录...</Text>
        </View>
      </View>
    )
  }

  if (!shareCode) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.header}>
          <View className={styles.shareBadge}>🔗 洽商共享查看</View>
          <Text className={styles.locationTitle}>输入共享码</Text>
          <Text className={styles.projectSub}>
            请在下方输入 8 位共享码，或点击现场二维码自动识别
          </Text>
        </View>
        <View className={styles.mainCard}>
          <View className={styles.codeInputSection}>
            <Input
              className={styles.codeInput}
              placeholder='请输入8位共享码（如 QX2K8M3P）'
              value={manualCode}
              onInput={(e) => setManualCode(e.detail.value.toUpperCase())}
              maxlength={8}
              confirmType='search'
              onConfirm={handleSearch}
            />
            <Button className={styles.searchBtn} onClick={handleSearch}>
              🔍 查询洽商记录
            </Button>
          </View>
        </View>
        <View className={styles.footerTip}>
          共享码由现场施工员在「洽商详情」页生成，{'\n'}
          资料员、预算员扫码或输入共享码即可查看同一条洽商的照片和说明。
        </View>
      </View>
    )
  }

  if (notFound) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.header}>
          <View className={styles.shareBadge}>🔗 洽商共享查看</View>
          <Text className={styles.locationTitle}>未找到记录</Text>
          <Text className={styles.projectSub}>
            可能共享码输入错误，或该条洽商尚未同步到此设备
          </Text>
        </View>
        <View className={styles.notFoundWrap}>
          <View className={styles.notFoundIcon}>🔍</View>
          <Text className={styles.notFoundTitle}>未找到该洽商记录</Text>
          <Text className={styles.notFoundDesc}>
            请核对 8 位共享码是否正确；如果是他人刚刚分享的记录，请让对方确认已保存并提交成功。
            {'\n\n'}
            <Text style={{ color: '#F53F3F', fontWeight: 600 }}>
              系统不会展示其他洽商内容以保护数据安全。
            </Text>
          </Text>
          <View className={styles.notFoundCode}>共享码: {shareCode}</View>
          <View className={styles.codeInputSection}>
            <Input
              className={styles.codeInput}
              placeholder='重新输入共享码'
              value={manualCode}
              onInput={(e) => setManualCode(e.detail.value.toUpperCase())}
              maxlength={8}
              confirmType='search'
              onConfirm={handleSearch}
            />
            <Button className={styles.searchBtn} onClick={handleSearch}>
              🔄 重新查询
            </Button>
            {searchTrigger > 0 && (
              <Button
                className={styles.searchBtn}
                style={{ marginTop: 16, backgroundColor: '#fff', color: '#1E6FFF', border: '2rpx solid #1E6FFF' }}
                onClick={handleResetToUrlCode}
              >
                ↺ 恢复 URL 中的共享码
              </Button>
            )}
          </View>
          <Button
            className={styles.searchBtn}
            style={{ backgroundColor: '#fff', color: '#1E6FFF', border: '2rpx solid #1E6FFF' }}
            onClick={handleBackHome}
          >
            返回首页
          </Button>
        </View>
      </View>
    )
  }

  if (!hasBusinessInfo) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.loadingWrap}>
          <View className={styles.loadingSpinner} />
          <Text>正在加载洽商记录...</Text>
        </View>
      </View>
    )
  }

  const t = hasBusinessInfo
  const reviewOpt = REVIEW_OPTIONS.find(o => o.key === currentReviewStatus)

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.shareBadge}>
          🔗 共享洽商 · 只读查看
          {source === 'url-data' && ' · 链接直读'}
          {source === 'local-cache' && ' · 本地缓存'}
        </View>
        <Text className={styles.locationTitle}>
          {t.buildingName} · {t.floorName}
        </Text>
        <Text className={styles.projectSub}>
          {t.projectName}
          {t.locationText ? ` · ${t.locationText}` : ''}
        </Text>
        <View className={styles.tagGroup}>
          <StatusBadge status={t.status} />
          <ProfessionalTag name={t.professional} />
          <ReasonTag reason={t.changeReason} />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22 }}>
            {formatDateFull(t.createdAt)}
          </Text>
        </View>
      </View>

      <View className={styles.reviewCard}>
        <View className={styles.reviewTitle}>资料员核对状态</View>
        {currentReviewStatus && reviewOpt ? (
          <View className={styles.reviewCurrent}>
            <Text className={styles.reviewIconCurrent} style={{ color: reviewOpt.color }}>
              {reviewOpt.icon} {reviewOpt.label}
            </Text>
            <Text className={styles.reviewHint}>{reviewOpt.hint}</Text>
          </View>
        ) : (
          <Text className={styles.reviewHint}>尚未标记状态</Text>
        )}
        <View className={styles.reviewBtnRow}>
          {REVIEW_OPTIONS.map(opt => (
            <Button
              key={opt.key}
              className={styles.reviewBtn}
              style={{
                backgroundColor: currentReviewStatus === opt.key ? opt.color : '#fff',
                color: currentReviewStatus === opt.key ? '#fff' : opt.color,
                borderColor: opt.color
              }}
              onClick={() => handleSetReview(opt.key)}
            >
              {opt.icon} {opt.label}
            </Button>
          ))}
        </View>
      </View>

      {visibleMissingFields.length > 0 && (
        <View className={styles.missingBanner}>
          <View className={styles.missingBannerTitle}>
            ⚠️ 以下信息待施工员补齐（本页仅查看，不可修改）
          </View>
          <View className={styles.missingBannerList}>
            {visibleMissingFields.map(f => (
              <View className={styles.missingBannerItem} key={f}>
                缺{MISSING_FIELD_LABEL[f]}
              </View>
            ))}
          </View>
          <Text className={styles.missingBannerTip}>
            请联系施工员在 App 中补齐以上信息后再编制联系单
          </Text>
        </View>
      )}

      <View className={styles.mainCard}>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建人</View>
            <View className={styles.infoValue}>{t.createdBy}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建时间</View>
            <View className={styles.infoValue}>{formatDateFull(t.createdAt)}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>联系单编号</View>
            <View className={`${styles.infoValue} ${!t.contactNo ? styles.infoMissing : ''}`}>
              {t.contactNo || '待补'}
            </View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>图纸编号</View>
            <View className={`${styles.infoValue} ${!t.drawingNo ? styles.infoMissing : ''}`}>
              {t.drawingNo || '待补'}
            </View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>责任单位</View>
            <View className={`${styles.infoValue} ${!t.responsibleUnit ? styles.infoMissing : ''}`}>
              {t.responsibleUnit || '待补'}
            </View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>预计工程量</View>
            <View className={`${styles.infoValue} ${!t.estimatedQuantity ? styles.infoMissing : ''}`}>
              {t.estimatedQuantity || '待补'}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='原图纸做法' showIndicator />
        <View className={styles.textBlockOriginal}>{t.originalDrawing || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='现场问题' showIndicator />
        <View className={styles.textBlockProblem}>{t.siteProblem || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='建议做法' showIndicator />
        <View className={styles.textBlockSolution}>{t.suggestedSolution || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='现场照片' subtitle={`共${t.photos?.length || 0}张`} showIndicator />
        {t.photos && t.photos.length > 0 ? (
          <View className={styles.photoGrid}>
            {t.photos.map((p, i) => (
              <View className={styles.photoItem} key={p.id} onClick={() => handlePreviewPhoto(i)}>
                <Image
                  className={styles.photoImage}
                  src={p.base64 || p.url}
                  mode='aspectFill'
                  onError={(e) => console.error('[SharePage] 图片加载失败', p.url, e)}
                />
                {p.remark && <View className={styles.photoRemark}>{p.remark}</View>}
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 24, color: '#86909C' }}>
            该洽商尚未采集现场照片，请联系现场施工员补拍。
          </Text>
        )}
      </View>

      <View className={styles.actionBar}>
        {showCopyMenu ? (
          <View className={styles.copyMenu}>
            <Button className={styles.copyMenuBtnSimple} onClick={() => handleCopy('simple')}>
              💬 简版（微信发群里）
            </Button>
            <Text className={styles.copyMenuHint}>紧凑格式 · 适合粘贴到微信群、钉钉等</Text>
            <Button className={styles.copyMenuBtnFull} onClick={() => handleCopy('full')}>
              📄 完整版（粘文档）
            </Button>
            <Text className={styles.copyMenuHint}>详细格式 · 适合粘贴到Word联系单文档</Text>
            <Button className={styles.copyMenuCancel} onClick={() => setShowCopyMenu(false)}>
              取消
            </Button>
          </View>
        ) : (
          <Button className={styles.copyMaterialBtn} onClick={() => setShowCopyMenu(true)}>
            📋 复制联系单素材
          </Button>
        )}
      </View>

      <View className={styles.footerTip}>
        洽商共享由 {t.createdBy} 发起，共享码 {t.shareCode}
        {'\n'}
        {source === 'url-data' ? '本页面内容直接从链接解析，不依赖设备缓存' : '本页面内容从当前设备缓存读取'}
        {'\n'}
        {reviewOpt ? `当前核对：${reviewOpt.label}（仅本设备记录）` : '点击上方按钮标记资料员核对状态'}
        {'\n'}
        本页为只读查看，如需修改请联系施工员在 App 内操作
      </View>
    </ScrollView>
  )
}

export default SharePage
