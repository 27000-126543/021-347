import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionTitleProps {
  title: string
  subtitle?: string
  showIndicator?: boolean
  required?: boolean
  missingCount?: number
  rightSlot?: React.ReactNode
  onLinkClick?: () => void
  linkText?: string
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  showIndicator = true,
  required = false,
  missingCount,
  rightSlot,
  onLinkClick,
  linkText
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.left}>
        {showIndicator && <View className={styles.indicator} />}
        <Text className={styles.title}>{title}</Text>
        {required && <Text className={styles.required}>*</Text>}
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
        {typeof missingCount === 'number' && missingCount > 0 && (
          <View className={styles.missingCount}>{missingCount}</View>
        )}
      </View>
      <View className={styles.right}>
        {rightSlot}
        {linkText && (
          <Text className={styles.link} onClick={onLinkClick}>
            {linkText}
          </Text>
        )}
      </View>
    </View>
  )
}

export default SectionTitle
