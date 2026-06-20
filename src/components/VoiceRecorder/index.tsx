import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classNames from 'classnames'

interface VoiceRecorderProps {
  fieldLabel: string
  value: string
  placeholder?: string
  quickPhrases?: string[]
  onChange: (value: string) => void
  onConfirm?: () => void
}

const mockTexts = {
  originalDrawing: [
    '原图纸设计为C30混凝土浇筑',
    '按施工图03-DQ-12做法施工',
    '原设计采用DN100mm厚挤塑板保温',
    '按图纸要求焊接连接双面满焊',
    '原设计采用BV-3x4穿SC25管暗敷'
  ],
  siteProblem: [
    '现场发现管井内管线交叉，净空不足',
    '实际尺寸与图纸不符，存在偏差约50mm',
    '与其他专业管线发生冲突碰撞',
    '现场实际标高比图纸低200mm',
    '发现原预埋件位置偏差无法施工'
  ],
  suggestedSolution: [
    '建议调整管道绕行避开冲突点',
    '变更为明装做法并增加支架',
    '建议改为装配式构件替代',
    '调整路由并增加防水加强层',
    '建议增加过渡连接并做防腐处理'
  ]
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  fieldLabel,
  value,
  placeholder = '点击下方话筒开始录音，系统自动转写文字',
  quickPhrases,
  onChange,
  onConfirm
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const getMockText = useCallback(() => {
    const phrases = quickPhrases || mockTexts[fieldLabel as keyof typeof mockTexts] || mockTexts.siteProblem
    return phrases[Math.floor(Math.random() * phrases.length)]
  }, [fieldLabel, quickPhrases])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setSeconds(0)
    setIsConverting(false)
    console.log('[VoiceRecorder] 开始录音', { field: fieldLabel })
  }, [fieldLabel])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    setIsConverting(true)
    console.log('[VoiceRecorder] 录音结束，开始转换', { duration: seconds })
    const duration = seconds
    setTimeout(() => {
      const baseText = getMockText()
      const simulatedText = duration >= 10
        ? `${baseText}，另外需要注意周边管线保护，施工前请与各专业工长确认交叉作业事项。`
        : baseText
      onChange(simulatedText)
      setIsConverting(false)
      setEditMode(true)
      console.log('[VoiceRecorder] 转写完成', { length: simulatedText.length })
      Taro.showToast({ title: '转写完成，请确认', icon: 'success' })
    }, 1200)
  }, [seconds, getMockText, onChange])

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else if (isConverting) {
      Taro.showToast({ title: '正在转写中...', icon: 'none' })
    } else {
      startRecording()
    }
  }

  const handleQuickPhrase = (phrase: string) => {
    onChange(phrase)
    setEditMode(true)
    console.log('[VoiceRecorder] 使用快捷语料', { phrase })
  }

  const phrases = quickPhrases || mockTexts[fieldLabel as keyof typeof mockTexts] || mockTexts.siteProblem

  return (
    <View className={classNames(styles.container, isRecording && styles.recording)}>
      <View className={styles.header}>
        <View className={styles.title}>
          <Text className={styles.icon}>🎙️</Text>
          语音录入「{fieldLabel}」
        </View>
        <Text
          className={classNames(
            styles.status,
            isRecording && styles.statusRecording,
            isConverting && styles.statusConverting
          )}
        >
          {isRecording ? '录音中...' : isConverting ? '转写中...' : '等待录音'}
        </Text>
      </View>

      <View className={styles.recordArea}>
        <Button
          className={isRecording ? styles.recordBtnRecording : styles.recordBtn}
          onClick={toggleRecording}
        >
          <Text className={styles.micIcon}>{isRecording ? '■' : '🎙'}</Text>
          <Text className={styles.btnText}>{isRecording ? '停止' : '录音'}</Text>
        </Button>
        <Text
          className={classNames(styles.timer, isRecording && styles.timerRecording)}
        >
          {formatTime(seconds)}
        </Text>
        <Text className={styles.hint}>{isRecording ? '正在录制中，再次点击结束' : placeholder}</Text>
      </View>

      <View className={styles.quickTips}>
        <Text className={styles.quickTitle}>快捷语料（点击快速填入）</Text>
        {phrases.map((phrase, idx) => (
          <Button
            className={styles.quickBtn}
            key={idx}
            onClick={() => handleQuickPhrase(phrase)}
          >
            {phrase.length > 12 ? phrase.slice(0, 12) + '...' : phrase}
          </Button>
        ))}
      </View>

      {(value || editMode) && (
        <View className={styles.resultArea}>
          <View className={styles.resultHeader}>
            <Text className={styles.resultLabel}>📝 转写结果（可手动修改确认）</Text>
            <View className={styles.resultActions}>
              <Button className={styles.actionBtnPrimary} onClick={onConfirm}>
                ✓ 确认无误
              </Button>
            </View>
          </View>
          <Textarea
            value={value}
            placeholder='请确认转写内容...'
            onInput={(e) => onChange(e.detail.value)}
            autoHeight
            maxlength={500}
            className={styles.resultText}
          />
        </View>
        )}
    </View>
  )
}

export default VoiceRecorder
