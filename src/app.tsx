import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import './app.scss'
import { ConsultationProvider } from '@/store/consultationContext'

function App(props) {
  useEffect(() => {
    console.log('[App] 应用启动')
  }, [])

  useDidShow(() => {
    console.log('[App] onShow')
  })

  useDidHide(() => {
    console.log('[App] onHide')
  })

  return (
    <ConsultationProvider>
      {props.children}
    </ConsultationProvider>
  )
}

export default App
