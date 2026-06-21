import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import styles from './index.module.scss'
import { useConsultation } from '@/store/consultationContext'
import { MissingField, MISSING_FIELD_LABEL, Consultation } from '@/types/consultation'
import DraftCard from '@/components/DraftCard'
import EmptyState from '@/components/EmptyState'
import classNames from 'classnames'

type FilterKey = MissingField | 'all'
type ViewMode = 'single' | 'combo'

type ComboKey =
  | 'all'
  | 'only-photos'
  | 'only-quantity'
  | 'only-responsibility'
  | 'nos-drawing'
  | 'business-only'
  | 'no-photos-others-done'
  | 'full-missing'
  | 'mixed'

interface ComboDef {
  key: ComboKey
  label: string
  icon: string
  match: (c: Consultation) => boolean
}

const COMBO_DEFS: ComboDef[] = [
  { key: 'all', label: '全部草稿', icon: '📋', match: () => true },
  { key: 'only-photos', label: '只缺照片', icon: '📷', match: (c) => c.missingFields.length === 1 && c.missingFields.includes('photos') },
  { key: 'no-photos-others-done', label: '缺照片+至少1业务', icon: '📷+📋', match: (c) => c.missingFields.includes('photos') && c.missingFields.length > 1 },
  { key: 'business-only', label: '只缺业务项', icon: '📋', match: (c) => !c.missingFields.includes('photos') && c.missingFields.length > 0 },
  { key: 'nos-drawing', label: '缺编号+图纸', icon: '📋📐', match: (c) => c.missingFields.includes('contactNo') && c.missingFields.includes('drawingNo') },
  { key: 'only-quantity', label: '只缺工程量', icon: '📊', match: (c) => c.missingFields.length === 1 && c.missingFields.includes('estimatedQuantity') },
  { key: 'only-responsibility', label: '只缺责任单位', icon: '🏢', match: (c) => c.missingFields.length === 1 && c.missingFields.includes('responsibleUnit') },
  { key: 'full-missing', label: '全缺(≥4项)', icon: '⚠️', match: (c) => c.missingFields.length >= 4 },
  { key: 'mixed', label: '其他组合', icon: '🧩', match: (c) => {
    if (c.missingFields.length === 0) return false
    if (COMBO_DEFS.slice(1, -1).some(d => d.key !== 'mixed' && d.match(c))) return false
    return true
  }}
]

const FILTER_TABS: Array<{ key: FilterKey; label: string; icon: string }> = [
  { key: 'all', label: '全部缺项', icon: '⚠️' },
  { key: 'photos', label: '缺现场照片', icon: '📷' },
  { key: 'contactNo', label: '缺联系单编号', icon: '📋' },
  { key: 'drawingNo', label: '缺图纸编号', icon: '📐' },
  { key: 'responsibleUnit', label: '缺责任单位', icon: '🏢' },
  { key: 'estimatedQuantity', label: '缺预计工程量', icon: '📊' }
]

const ICONS: Record<MissingField, string> = {
  photos: '📷',
  contactNo: '📋',
  drawingNo: '📐',
  responsibleUnit: '🏢',
  estimatedQuantity: '📊'
}

const DraftsPage: React.FC = () => {
  const { state, dispatch } = useConsultation()
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [activeCombo, setActiveCombo] = React.useState<ComboKey>('all')
  const [viewMode, setViewMode] = React.useState<ViewMode>('single')
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
      photos: 0,
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
  }, [draftList])

  const comboCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    COMBO_DEFS.forEach(d => {
      counts[d.key] = draftList.filter(c => d.match(c)).length
    })
    return counts
  }, [draftList])

  const filteredList = useMemo(() => {
    if (viewMode === 'single') {
      if (activeFilter === 'all') return draftList
      return draftList.filter(c => c.missingFields.includes(activeFilter))
    }
    const def = COMBO_DEFS.find(d => d.key === activeCombo)
    if (!def || def.key === 'all') return draftList
    return draftList.filter(c => def.match(c))
  }, [draftList, activeFilter, activeCombo, viewMode])

  const handleFilter = (key: FilterKey) => {
    setViewMode('single')
    setActiveFilter(key)
    if (key !== 'all') {
      dispatch({ type: 'SET_MISSING_FILTER', payload: key })
    }
  }

  const handleCombo = (key: ComboKey) => {
    setViewMode('combo')
    setActiveCombo(key)
  }

  const handleSwitchMode = (m: ViewMode) => {
    setViewMode(m)
    if (m === 'single') setActiveFilter('all')
    else setActiveCombo('all')
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
          请逐项核对现场照片、联系单编号、图纸编号、责任单位和预计工程量。
        </Text>
      </View>

      <View className={styles.statsGrid}>
        {(Object.keys(missingStats) as MissingField[]).map(field => (
          <View
            className={`${styles.statCard} ${field === 'photos' ? styles.statCardPhotos : ''}`}
            key={field}
            onClick={() => handleFilter(field)}
          >
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

      {draftList.length > 0 && (
        <View className={styles.modeSwitch}>
          <Button
            className={viewMode === 'single' ? styles.modeBtnActive : styles.modeBtn}
            onClick={() => handleSwitchMode('single')}
          >
            按单一缺项
          </Button>
          <Button
            className={viewMode === 'combo' ? styles.modeBtnActive : styles.modeBtn}
            onClick={() => handleSwitchMode('combo')}
          >
            按缺项组合
          </Button>
        </View>
      )}

      <View className={styles.filterTabBar}>
        {viewMode === 'single' && FILTER_TABS.map(tab => {
          const active = activeFilter === tab.key
          const count = filterCounts[tab.key] || 0
          return (
            <Button
              key={tab.key}
              className={active ? styles.filterTabActive : styles.filterTab}
              onClick={() => handleFilter(tab.key)}
            >
              {tab.icon} {tab.label}
              <View className={styles.tabCount}>{count}</View>
            </Button>
          )
        })}
        {viewMode === 'combo' && COMBO_DEFS.map(def => {
          const active = activeCombo === def.key
          const count = comboCounts[def.key] || 0
          return (
            <Button
              key={def.key}
              className={active ? styles.filterTabActive : styles.filterTab}
              onClick={() => handleCombo(def.key)}
            >
              {def.label}
              <View className={styles.tabCount}>{count}</View>
            </Button>
          )
        })}
      </View>

      <View className={styles.listArea}>
        <View className={styles.summaryBar}>
          <Text className={styles.summaryText}>
            {viewMode === 'single'
              ? activeFilter === 'all'
                ? '全部草稿记录'
                : MISSING_FIELD_LABEL[activeFilter as MissingField] + '缺项记录'
              : activeCombo === 'all'
                ? '全部草稿（按组合）'
                : COMBO_DEFS.find(d => d.key === activeCombo)?.label
            }
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
              viewMode === 'single'
                ? activeFilter === 'all' ? '没有待完善记录' : `没有缺${MISSING_FIELD_LABEL[activeFilter as MissingField]}的记录`
                : activeCombo === 'all' ? '没有待完善记录' : `${COMBO_DEFS.find(d => d.key === activeCombo)?.label}的记录都处理好啦`
            }
            description='可以切换其他分组继续处理'
            actionText={viewMode === 'single' && activeFilter === 'all' ? '+ 新建洽商' : '查看全部草稿'}
            onAction={() => viewMode === 'single' && activeFilter === 'all' ? handleNewConsult() : handleSwitchMode(viewMode === 'single' ? 'combo' : 'single')}
            secondaryActionText='回到首页'
            onSecondaryAction={() => Taro.switchTab({ url: '/pages/index/index' })}
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
