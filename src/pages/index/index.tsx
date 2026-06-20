import React, { useMemo } from 'react'
import { View, Text, Input, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useConsultation } from '@/store/consultationContext'
import { ConsultationStatus } from '@/types/consultation'
import ConsultCard from '@/components/ConsultCard'
import EmptyState from '@/components/EmptyState'

const TABS: Array<{ key: ConsultationStatus | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'submitted', label: '已提交' },
  { key: 'completed', label: '已完成' }
]

const IndexPage: React.FC = () => {
  const { state, dispatch } = useConsultation()

  const [activeTab, setActiveTab] = React.useState<ConsultationStatus | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)

  useDidShow(() => {
    console.log('[IndexPage] onShow')
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    console.log('[IndexPage] pullDownRefresh')
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 800)
  })

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let todayCount = 0
    state.consultations.forEach(c => {
      if (c.createdAt.slice(0, 10) === today) todayCount++
    })
    return {
      today: todayCount,
      draft: state.consultations.filter(c => c.status === 'draft').length,
      submitted: state.consultations.filter(c => c.status !== 'draft').length
    }
  }, [state.consultations])

  const filteredList = useMemo(() => {
    let list = [...state.consultations]

    if (activeTab !== 'all') {
      list = list.filter(c => c.status === activeTab)
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      list = list.filter(c =>
        c.projectName.toLowerCase().includes(kw) ||
        c.buildingName.toLowerCase().includes(kw) ||
        c.floorName.toLowerCase().includes(kw) ||
        c.professional.toLowerCase().includes(kw) ||
        c.siteProblem.toLowerCase().includes(kw) ||
        c.createdBy.toLowerCase().includes(kw)
      )
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [state.consultations, activeTab, searchKeyword])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: state.consultations.length }
    TABS.forEach(t => {
      if (t.key !== 'all') {
        counts[t.key] = state.consultations.filter(c => c.status === t.key).length
      }
    })
    return counts
  }, [state.consultations])

  const handleTabChange = (key: ConsultationStatus | 'all') => {
    setActiveTab(key)
    dispatch({ type: 'SET_FILTER_STATUS', payload: key })
    console.log('[IndexPage] tab切换', { key })
  }

  const handleNewConsult = () => {
    Taro.navigateTo({ url: '/pages/create/index' })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.titleGroup}>
            <Text className={styles.pageTitle}>洽商采集助手</Text>
            <Text className={styles.subtitle}>
              今日已采集 {stats.today} 条 · 共 {state.consultations.length} 条记录
            </Text>
          </View>
        </View>

        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            type='text'
            value={searchKeyword}
            placeholder='搜索项目 / 楼栋 / 专业 / 关键词'
            onInput={(e) => {
              setSearchKeyword(e.detail.value)
              dispatch({ type: 'SET_SEARCH_KEYWORD', payload: e.detail.value })
            }}
            confirmType='search'
          />
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.today}</Text>
          <Text className={styles.statLabel}>今日新建</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumWarn}>{stats.draft}</Text>
          <Text className={styles.statLabel}>待补草稿</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumOk}>{stats.submitted}</Text>
          <Text className={styles.statLabel}>已提交/完成</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          const count = tabCounts[tab.key] || 0
          return (
            <Button
              key={tab.key}
              className={active ? styles.tabActive : styles.tabItem}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              <View className={styles.tabBadge}>{count}</View>
            </Button>
          )
        })}
      </View>

      <View className={styles.listSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            {activeTab === 'all' ? '全部记录' : TABS.find(t => t.key === activeTab)?.label + '记录'}
          </Text>
          <Text className={styles.sectionCount}>共 {filteredList.length} 条</Text>
        </View>

        {filteredList.length > 0 ? (
          filteredList.map(item => <ConsultCard item={item} key={item.id} />)
        ) : (
          <EmptyState
            icon={activeTab === 'draft' ? '📝' : '📋'}
            title={searchKeyword ? '未找到匹配记录' : `暂无${TABS.find(t => t.key === activeTab)?.label || ''}记录`}
            description={
              searchKeyword
                ? '请尝试更换关键词搜索'
                : activeTab === 'draft'
                  ? '所有洽商记录都已补全完善，干得漂亮！'
                  : '点击右下角按钮，开始现场采集第一条洽商记录吧'
            }
            actionText={!searchKeyword && activeTab !== 'draft' ? '+ 新建洽商' : undefined}
            onAction={handleNewConsult}
          />
        )}
      </View>

      <View className={styles.fab} onClick={handleNewConsult}>
        <Text className={styles.fabIcon}>+</Text>
        <Text className={styles.fabText}>新建</Text>
      </View>
    </View>
  )
}

export default IndexPage
