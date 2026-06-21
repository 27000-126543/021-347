import React, { useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { ConsultationPhoto } from '@/types/consultation'
import { generateId } from '@/utils'

interface PhotoUploaderProps {
  photos: ConsultationPhoto[]
  onChange: (photos: ConsultationPhoto[]) => void
  maxCount?: number
  required?: boolean
  title?: string
  tip?: string
  showRemark?: boolean
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  maxCount = 9,
  required = false,
  title = '现场照片',
  tip = '建议从整体到局部拍摄，标注关键尺寸或冲突点。可拍摄最多9张照片。',
  showRemark = true
}) => {
  const readFileAsBase64 = useCallback(async (filePath: string): Promise<string> => {
    try {
      const fs = Taro.getFileSystemManager()
      const res = fs.readFileSync(filePath, 'base64')
      return `data:image/jpeg;base64,${res}`
    } catch {
      try {
        const res = await Taro.request({ url: filePath, responseType: 'arraybuffer' })
        const base64 = Taro.arrayBufferToBase64(res.data as ArrayBuffer)
        return `data:image/jpeg;base64,${base64}`
      } catch {
        console.warn('[PhotoUploader] base64转储失败, 使用原URL:', filePath)
        return ''
      }
    }
  }, [])

  const handleAdd = useCallback(async () => {
    try {
      const res = await Taro.chooseImage({
        count: maxCount - photos.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const newPhotos: ConsultationPhoto[] = res.tempFilePaths.map((url) => ({
        id: generateId(),
        url,
        base64: '',
        uploadedAt: new Date().toISOString()
      }))
      console.log('[PhotoUploader] 选择图片成功', { count: newPhotos.length })
      onChange([...photos, ...newPhotos])

      for (let i = 0; i < newPhotos.length; i++) {
        const b64 = await readFileAsBase64(res.tempFilePaths[i])
        if (b64) {
          newPhotos[i].base64 = b64
          onChange([...photos, ...newPhotos])
        }
      }
    } catch (e) {
      console.error('[PhotoUploader] 选择图片失败', e)
    }
  }, [photos, maxCount, onChange, readFileAsBase64])

  const handleDelete = useCallback((id: string, e) => {
    e.stopPropagation && e.stopPropagation()
    onChange(photos.filter(p => p.id !== id))
    console.log('[PhotoUploader] 删除图片', { id })
  }, [photos, onChange])

  const canAdd = photos.length < maxCount

  return (
    <View className={styles.container}>
      <View className={styles.titleRow}>
        <View className={styles.title}>
          {title}
          {required && <Text className={styles.required}>*</Text>}
        </View>
        <Text className={styles.count}>
          {photos.length} / {maxCount}
        </Text>
      </View>
      {tip && <View className={styles.tip}>💡 {tip}</View>}
      <View className={styles.grid}>
        {photos.map(photo => (
          <View className={styles.photoItem} key={photo.id}>
            <Image
              className={styles.photoImage}
              src={photo.url}
              mode='aspectFill'
              onError={(e) => console.error('[PhotoUploader] 图片加载失败', photo.url, e)}
              onClick={() => {
                Taro.previewImage({
                  current: photo.url,
                  urls: photos.map(p => p.url)
                })
              }}
            />
            <View
              className={styles.deleteBtn}
              onClick={(e) => handleDelete(photo.id, e)}
            >
              ×
            </View>
            {showRemark && photo.remark && (
              <View className={styles.photoRemark}>{photo.remark}</View>
            )}
          </View>
        ))}
        {canAdd && (
          <View className={styles.addBtn} onClick={handleAdd}>
            <Text className={styles.addIcon}>+</Text>
            <Text className={styles.addText}>拍照/相册</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default PhotoUploader
