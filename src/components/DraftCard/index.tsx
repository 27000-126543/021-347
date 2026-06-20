import React from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { Consultation, MISSING_FIELD_LABEL } from '@/types/consultation'
import { ProfessionalTag, ReasonTag, StatusBadge } from '@/components/StatusBadge'
import { formatDate, truncateText } from '@/utils'

interface DraftCardProps {
  item: Consultation
  onComplete?: () => void
}

const DraftCard: React.FC<DraftCardProps> = ({ item, onComplete }) => {
  const creatorInitial = item.createdBy ? item.createdBy.charAt(0) : '张'

  const handleTap = () => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}&mode=complete`
    })
  }

  const handleCompleteClick = (e) => {
    e.stopPropagation && e.stopPropagation()
    if (onComplete) {
      onComplete()
    } else {
      handleTap()
    }
  }

  return (
    <View className={styles.card} onClick={handleTap}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <View className={styles.location}>
            <Text className={styles.locationText}>
              {item.buildingName} · {item.floorName}
            </Text>
            <ProfessionalTag name={item.professional} />
          </View>
          <Text className={styles.projectText}>{item.projectName}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text className={styles.problemText}>{truncateText(item.siteProblem, 50)}</Text>

      <View className={styles.missingSection}>
        <View className={styles.missingTitle}>
          <View className={styles.missingIcon}>!</View>
          缺{item.missingFields.length}项需补全
        </View>
        <View className={styles.missingList}>
          {item.missingFields.map(field => (
            <View className={styles.missingTag} key={field}>
              {MISSING_FIELD_LABEL[field]}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.tagRow}>
        <ReasonTag reason={item.changeReason} />
      </View>

      {item.photos.length > 0 && (
        <View className={styles.photoPreview}>
          {item.photos.slice(0, 3).map(p => (
            <View className={styles.photoItem} key={p.id}>
              <Image
                className={styles.photoImage}
                src={p.url}
                mode='aspectFill'
                onError={(e) => console.error('[DraftCard] 图片加载失败', p.url, e)}
              />
            </View>
          ))}
          <View className={styles.photoCount}>共{item.photos.length}张</View>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.creatorInfo}>
          <View className={styles.creatorAvatar}>{creatorInitial}</View>
          <Text className={styles.creatorName}>{item.createdBy}</Text>
          <Text className={styles.timeText}>· {formatDate(item.createdAt)}</Text>
        </View>
        <Button className={styles.completeBtn} onClick={handleCompleteClick}>
          去补齐
        </Button>
      </View>
    </View>
  )
}

export default DraftCard
