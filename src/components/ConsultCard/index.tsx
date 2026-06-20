import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { Consultation } from '@/types/consultation'
import { StatusBadge, ProfessionalTag, ReasonTag } from '@/components/StatusBadge'
import { formatDate, truncateText } from '@/utils'

interface ConsultCardProps {
  item: Consultation
  onClick?: () => void
}

const ConsultCard: React.FC<ConsultCardProps> = ({ item, onClick }) => {
  const creatorInitial = item.createdBy ? item.createdBy.charAt(0) : '张'
  const displayedPhotos = item.photos.slice(0, 4)
  const remainingPhotos = item.photos.length - 4

  const handleTap = () => {
    if (onClick) {
      onClick()
      return
    }
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}`
    })
  }

  return (
    <View className={styles.card} onClick={handleTap}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <View className={styles.locationRow}>
            <Text className={styles.locationText}>
              {item.buildingName} · {item.floorName}
            </Text>
            <ProfessionalTag name={item.professional} />
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text className={styles.projectText}>
        {item.projectName}
      </Text>

      <Text className={styles.problemText}>{truncateText(item.siteProblem, 60)}</Text>

      <View className={styles.tagRow}>
        <ReasonTag reason={item.changeReason} />
        {item.missingFields.length > 0 && (
          <View className={styles.missingBadge}>
            缺{item.missingFields.length}项
          </View>
        )}
      </View>

      {item.photos.length > 0 && (
        <View className={styles.photoRow}>
          {displayedPhotos.map(photo => (
            <View className={styles.photoItem} key={photo.id}>
              <Image
                className={styles.photoImage}
                src={photo.url}
                mode='aspectFill'
                onError={(e) => console.error('[ConsultCard] 图片加载失败', photo.url, e)}
              />
            </View>
          ))}
          {remainingPhotos > 0 && (
            <View className={styles.photoMore}>+{remainingPhotos}张</View>
          )}
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.creatorInfo}>
          <View className={styles.creatorAvatar}>{creatorInitial}</View>
          <Text className={styles.creatorName}>{item.createdBy}</Text>
        </View>
        <Text className={styles.timeText}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  )
}

export default ConsultCard
