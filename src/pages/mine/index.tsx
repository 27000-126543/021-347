import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'

interface MenuItemType {
  icon: string
  name: string
  desc?: string
  badge?: number
  onClick?: () => void
}

const MinePage: React.FC = () => {
  const { state } = useConsultation()

  useDidShow(() => {
    console.log('[MinePage] onShow')
  })

  const total = state.consultations.length
  const draftCount = state.consultations.filter(c => c.status === 'draft').length
  const submittedCount = state.consultations.filter(c => c.status === 'submitted').length
  const completedCount = state.consultations.filter(c => c.status === 'completed').length

  const handleMenuClick = (name: string) => {
    console.log('[MinePage] 点击菜单:', { name })
    Taro.showToast({ title: `${name}功能开发中`, icon: 'none' })
  }

  const bizMenus: MenuItemType[] = [
    {
      icon: '📥',
      name: '批量导入',
      desc: '从Excel导入历史洽商记录',
      onClick: () => handleMenuClick('批量导入')
    },
    {
      icon: '📤',
      name: '数据导出',
      desc: '导出洽商报表发送给资料员',
      onClick: () => handleMenuClick('数据导出')
    },
    {
      icon: '📊',
      name: '统计分析',
      desc: '按专业/变更原因查看数据图表',
      onClick: () => handleMenuClick('统计分析')
    },
    {
      icon: '🏷️',
      name: '项目管理',
      desc: '维护项目/楼栋/专业字典',
      badge: 2,
      onClick: () => handleMenuClick('项目管理')
    }
  ]

  const sysMenus: MenuItemType[] = [
    {
      icon: '🔔',
      name: '消息通知',
      desc: '洽商审核进度、回复提醒',
      onClick: () => handleMenuClick('消息通知')
    },
    {
      icon: '🤝',
      name: '团队成员',
      desc: '管理资料员、预算员权限',
      onClick: () => handleMenuClick('团队成员')
    },
    {
      icon: '⚙️',
      name: '系统设置',
      desc: '默认项目、语音偏好等',
      onClick: () => handleMenuClick('系统设置')
    },
    {
      icon: '💡',
      name: '意见反馈',
      desc: '告诉我们如何做得更好',
      onClick: () => handleMenuClick('意见反馈')
    }
  ]

  const renderMenu = (menus: MenuItemType[]) =>
    menus.map(menu => (
      <View
        className={styles.menuItem}
        key={menu.name}
        onClick={menu.onClick}
      >
        <View className={styles.menuIcon}>{menu.icon}</View>
        <View className={styles.menuContent}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {menu.badge && <View className={styles.badge}>{menu.badge}</View>}
            <Text className={styles.menuName}>{menu.name}</Text>
          </View>
          {menu.desc && <Text className={styles.menuDesc}>{menu.desc}</Text>}
        </View>
        <Text className={styles.menuArrow}>›</Text>
      </View>
    ))

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.profileCard}>
          <View className={styles.avatar}>👷</View>
          <View className={styles.info}>
            <Text className={styles.name}>张建国</Text>
            <View className={styles.role}>专业工长 · 电气</View>
            <Text className={styles.dept}>中建八局第三分公司 · 朝阳新城项目部</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsWrap}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{total}</Text>
          <Text className={styles.statLabel}>总洽商</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#FF7D00' }}>{draftCount}</Text>
          <Text className={styles.statLabel}>待补</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#1E6FFF' }}>{submittedCount}</Text>
          <Text className={styles.statLabel}>已提交</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#00B42A' }}>{completedCount}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>业务功能</Text>
        <View className={styles.menuCard}>
          {renderMenu(bizMenus)}
        </View>

        <Text className={styles.sectionTitle}>系统设置</Text>
        <View className={styles.menuCard}>
          {renderMenu(sysMenus)}
        </View>

        <View className={styles.placeholder}>
          <Text className={styles.placeholderIcon}>🛠️</Text>
          <Text className={styles.placeholderTitle}>更多功能完善中</Text>
          <Text className={styles.placeholderDesc}>
            当前版本 v1.0.0，洽商采集、待完善、详情共享三大核心功能已上线。
            {'\n'}后续版本将增加审批流、多项目协同、造价联动等能力。
          </Text>
        </View>
      </View>
    </View>
  )
}

export default MinePage
