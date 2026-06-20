import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classNames from 'classnames'
import { ConsultationStatus } from '@/types/consultation'

interface StatusBadgeProps {
  status: ConsultationStatus
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const labelMap = {
    draft: '草稿',
    submitted: '已提交',
    completed: '已完成'
  }
  return (
    <View className={classNames(styles.badge, styles[status])}>
      {labelMap[status]}
    </View>
  )
}

interface ProfessionalTagProps {
  name: string
}

export const ProfessionalTag: React.FC<ProfessionalTagProps> = ({ name }) => {
  return <View className={styles.professionalTag}>{name}</View>
}

interface ReasonTagProps {
  reason: string
}

export const ReasonTag: React.FC<ReasonTagProps> = ({ reason }) => {
  return <View className={styles.reasonTag}>{reason}</View>
}

export default StatusBadge
