import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'
import { MissingField, MISSING_FIELD_LABEL } from '@/types/consultation'
import DraftCard from '@/components/DraftCard'
import EmptyState from '@/components/EmptyState'
import classNames from 'classnames'

type FilterKey = MissingField | 'all'

const FILTER_TABS: Array<{ key: FilterKey; label: string; icon: string }> = [
  { key: 'all', label: '全部缺项', icon: '⚠️' },
  { key: 'contactNo', label: '缺联系单编号', icon: '📋' },
  { key: 'drawingNo', label: '缺图纸编号', icon: '📐' },
  { key: 'responsibleUnit', label: '缺责任单位', icon: '🏢' },
  { key: 'estimatedQuantity', label: '缺预计工程量', icon: '📊' }
]

const ICONS: Record<MissingField, string> = {
  contactNo: '📋',
  drawingNo: '📐',
  responsibleUnit: '🏢',
  estimatedQuantity: '📊'
}

const DraftsPage: React.FC = () => {
  const { state, dispatch } = useConsultation()
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [refreshing, setRefreshing] = React.useState(false)

  useDidShow(() => {
    console.log('[DraftsPage] onShow')
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
      Taro.showToast({ title: '刷新完成', icon: 'none' })
    }, 800)
  })

  const draftList = useMemo(
    () =>
      state.consultations
        .filter(c => c.status === 'draft')
        .sort((a, b) => b.missingFields.length - a.missingFields.length),
    [state.consultations]
  )

  const missingStats = useMemo(() => {
    const counts: Record<MissingField, number> = {
      contactNo: 0,
      drawingNo: 0,
      responsibleUnit: 0,
      estimatedQuantity: 0
    }
    draftList.forEach(c => {
      c.missingFields.forEach(f => (counts[f] = (counts[f] || 0) + 1))
    })
    return counts
  }, [draftList])

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = { all: draftList.length }
    FILTER_TABS.forEach(t => {
      if (t.key !== 'all') {
        counts[t.key] = draftList.filter(c => c.missingFields.includes(t.key)).length
      }
    })
    return counts
  }, [draftList, missingStats])

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return draftList
    return draftList.filter(c => c.missingFields.includes(activeFilter))
  }, [draftList, activeFilter])

  const handleFilter = (key: FilterKey) => {
    setActiveFilter(key)
    if (key !== 'all') {
      dispatch({ type: 'SET_MISSING_FILTER', payload: key })
    }
    console.log('[DraftsPage] 缺项筛选:', { key })
  }

  const handleNotifyAll = () => {
    Taro.showModal({
      title: '一键通知资料员',
      content: `将向资料员发送 ${draftList.length} 条待完善记录的补全提醒，是否确认？`,
      confirmText: '发送',
      cancelText: '取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          console.log('[DraftsPage] 一键通知资料员')
          Taro.showToast({ title: '已通知资料员配合', icon: 'success' })
        }
      }
    })
  }

  const handleNewConsult = () => {
    Taro.navigateTo({ url: '/pages/create/index' })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.titleWrap}>
            <Text className={styles.pageTitle}>待完善清单</Text>
            <View className={styles.urgentTag}>🔥 今日收工前补完</View>
          </View>
          <Button className={styles.reminderBtn} onClick={handleNotifyAll}>
            一键通知
          </Button>
        </View>
        <Text className={styles.headerSub}>
          共 <Text style={{ fontWeight: 700 }}>{draftList.length}</Text> 条草稿记录需要补全，
          请逐项核对联系单编号、图纸编号、责任单位和预计工程量。
        </Text>
      </View>

      <View className={styles.statsGrid}>
        {(Object.keys(missingStats) as MissingField[]).map(field => (
          <View className={styles.statCard} key={field}>
            <View className={styles.statIcon}>{ICONS[field]}</View>
            <View className={styles.statInfo}>
              <Text className={styles.statNum}>{missingStats[field]}</Text>
              <Text className={styles.statLabel}>缺{MISSING_FIELD_LABEL[field]}</Text>
            </View>
          </View>
        ))}
      </View>

      {draftList.length > 0 && (
        <View className={styles.tipsCard}>
          <Text className={styles.tipsText}>
            💡 建议<b>先联系资料员补齐联系单和图纸编号</b>，然后和预算员现场核实工程量和责任单位，避免返工。
          </Text>
        </View>
      )}

      <View className={styles.filterTabBar}>
        {FILTER_TABS.map(tab => {
          const active = activeFilter === tab.key
          const count = filterCounts[tab.key] || 0
          return (
            <Button
              key={tab.key}
              className={active ? styles.filterTabActive : styles.filterTab}
              onClick={() => handleFilter(tab.key)}
            >
              {tab.label}
              <View className={styles.tabCount}>{count}</View>
            </Button>
          )
        })}
      </View>

      <View className={styles.listArea}>
        <View className={styles.summaryBar}>
          <Text className={styles.summaryText}>
            {activeFilter === 'all'
              ? '全部草稿记录'
              : MISSING_FIELD_LABEL[activeFilter as MissingField] + '缺项记录'}
          </Text>
          <Text className={styles.summaryText}>
            共 <Text className={styles.summaryCount}>{filteredList.length}</Text> 条
          </Text>
        </View>

        {filteredList.length > 0 ? (
          filteredList.map(item => <DraftCard item={item} key={item.id} />)
        ) : (
          <EmptyState
            icon='✅'
            title={
              activeFilter === 'all'
                ? '没有待完善记录'
                : `没有缺${MISSING_FIELD_LABEL[activeFilter as MissingField]}的记录`
            }
            description={
              activeFilter === 'all'
                ? '所有洽商都已补全完善，继续保持！有新洽商可以新建记录。'
                : '该字段的草稿都已经补全啦，可以切换其他缺项类型查看。'
            }
            actionText={activeFilter === 'all' ? '+ 新建洽商' : undefined}
            onAction={handleNewConsult}
            secondaryActionText={activeFilter !== 'all' ? '查看全部草稿' : undefined}
            onSecondaryAction={() => setActiveFilter('all')}
          />
        )}
      </View>

      {draftList.length > 0 && (
        <View className={styles.bottomBar}>
          <Button className={styles.primaryBtn} onClick={handleNotifyAll}>
            📨 通知资料员配合补齐 {draftList.length} 项
          </Button>
        </View>
      )}
    </View>
  )
}

export default DraftsPage
