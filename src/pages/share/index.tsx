import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'
import { StatusBadge, ProfessionalTag, ReasonTag } from '@/components/StatusBadge'
import SectionTitle from '@/components/SectionTitle'
import { formatDateFull, decodeSharePayload, restoreFromSharePayload } from '@/utils'
import { Consultation } from '@/types/consultation'

type DisplaySource = 'url-data' | 'local-cache' | null

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
          console.log('[SharePage] 从URL data解析成功', activeShareCode)
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
      console.log('[SharePage] 从本地缓存查到', activeShareCode)
      return {
        item: found,
        source: 'local-cache',
        shareCode: activeShareCode,
        notFound: false,
        loading: false
      }
    }

    console.log('[SharePage] 未找到', activeShareCode)
    return {
      item: null,
      source: null,
      shareCode: activeShareCode,
      notFound: true,
      loading: false
    }
  }, [urlShareCode, urlData, manualCode, searchTrigger, getByShareCode])

  const { item, source, shareCode, notFound, loading } = displayState

  const handlePreviewPhoto = (idx: number) => {
    if (!item?.photos) return
    Taro.previewImage({
      current: item.photos[idx].url,
      urls: item.photos.map(p => p.url)
    })
  }

  const handleSearch = () => {
    if (!manualCode.trim()) {
      Taro.showToast({ title: '请输入共享码', icon: 'none' })
      return
    }
    console.log('[SharePage] 手动查询:', manualCode.trim().toUpperCase())
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

  if (!item) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.loadingWrap}>
          <View className={styles.loadingSpinner} />
          <Text>正在加载洽商记录...</Text>
        </View>
      </View>
    )
  }

  const itemTyped = item as Consultation

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.shareBadge}>
          🔗 共享洽商 · 只读查看
          {source === 'url-data' && ' · 链接直读'}
          {source === 'local-cache' && ' · 本地缓存'}
        </View>
        <Text className={styles.locationTitle}>
          {itemTyped.buildingName} · {itemTyped.floorName}
        </Text>
        <Text className={styles.projectSub}>
          {itemTyped.projectName}
          {itemTyped.locationText ? ` · ${itemTyped.locationText}` : ''}
        </Text>
        <View className={styles.tagGroup}>
          <StatusBadge status={itemTyped.status} />
          <ProfessionalTag name={itemTyped.professional} />
          <ReasonTag reason={itemTyped.changeReason} />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22 }}>
            {formatDateFull(itemTyped.createdAt)}
          </Text>
        </View>
      </View>

      <View className={styles.mainCard}>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建人</View>
            <View className={styles.infoValue}>{itemTyped.createdBy}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建时间</View>
            <View className={styles.infoValue}>{formatDateFull(itemTyped.createdAt)}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>联系单编号</View>
            <View className={styles.infoValue}>{itemTyped.contactNo || '（未填写）'}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>共享码</View>
            <View className={styles.infoValue}>{itemTyped.shareCode}</View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='原图纸做法' showIndicator />
        <View className={styles.textBlockOriginal}>{itemTyped.originalDrawing || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='现场问题' showIndicator />
        <View className={styles.textBlockProblem}>{itemTyped.siteProblem || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='建议做法' showIndicator />
        <View className={styles.textBlockSolution}>{itemTyped.suggestedSolution || '（未填写）'}</View>
      </View>

      <View className={styles.sectionCard}>
        <SectionTitle title='现场照片' subtitle={`共${itemTyped.photos?.length || 0}张`} showIndicator />
        {itemTyped.photos && itemTyped.photos.length > 0 ? (
          <View className={styles.photoGrid}>
            {itemTyped.photos.map((p, i) => (
              <View className={styles.photoItem} key={p.id} onClick={() => handlePreviewPhoto(i)}>
                <Image
                  className={styles.photoImage}
                  src={p.url}
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

      <View className={styles.footerTip}>
        洽商共享由 {itemTyped.createdBy} 发起，共享码 {itemTyped.shareCode}
        {'\n'}
        {source === 'url-data' ? '本页面内容直接从链接解析，不依赖设备缓存' : '本页面内容从当前设备缓存读取'}
        {'\n'}
        如需修改内容，请联系现场施工员在 App 内操作
      </View>
    </ScrollView>
  )
}

export default SharePage
