import React, { useState, useMemo } from 'react'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'
import { StatusBadge, ProfessionalTag, ReasonTag } from '@/components/StatusBadge'
import SectionTitle from '@/components/SectionTitle'
import { formatDateFull } from '@/utils'

const SharePage: React.FC = () => {
  const router = useRouter()
  const { getByShareCode, state } = useConsultation()

  const urlCode = router.params.shareCode || router.params.code || router.params.sharecode || ''
  const [manualCode, setManualCode] = useState('')

  useDidShow(() => {
    console.log('[SharePage] onShow, urlCode=', urlCode)
  })

  const activeCode = useMemo(() => {
    return (urlCode || manualCode || '').trim().toUpperCase()
  }, [urlCode, manualCode])

  const item = useMemo(() => {
    if (!activeCode) return undefined
    return getByShareCode(activeCode)
  }, [activeCode, getByShareCode, state.consultations])

  const notFound = activeCode && !item

  const handlePreviewPhoto = (idx: number) => {
    if (!item) return
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
    console.log('[SharePage] 手动查询共享码:', manualCode)
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  if (!activeCode) {
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
          <View className={styles.notFoundCode}>共享码: {activeCode}</View>

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

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.shareBadge}>🔗 共享洽商 · 只读查看</View>
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
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建人</View>
            <View className={styles.infoValue}>{item.createdBy}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>创建时间</View>
            <View className={styles.infoValue}>{formatDateFull(item.createdAt)}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>联系单编号</View>
            <View className={styles.infoValue}>{item.contactNo || '（未填写）'}</View>
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
        <SectionTitle title='现场照片' subtitle={`共${item.photos.length}张`} showIndicator />
        {item.photos.length > 0 ? (
          <View className={styles.photoGrid}>
            {item.photos.map((p, i) => (
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
        洽商共享由 {item.createdBy} 发起，共享码 {item.shareCode}
        {'\n'}
        如需修改内容，请联系现场施工员在 App 内操作
      </View>
    </ScrollView>
  )
}

export default SharePage
