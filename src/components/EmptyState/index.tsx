import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  secondaryActionText?: string
  onSecondaryAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title = '暂无记录',
  description = '还没有任何洽商记录，点击下方按钮开始新建吧',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.desc}>{description}</Text>
      {actionText && (
        <Button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </Button>
      )}
      {secondaryActionText && (
        <Button
          className={styles.secondaryBtn}
          onClick={onSecondaryAction}
          style={{ marginTop: '24rpx' }}
        >
          {secondaryActionText}
        </Button>
      )}
    </View>
  )
}

export default EmptyState
