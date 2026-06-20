import { Consultation } from '@/types/consultation'

export const mockConsultations: Consultation[] = [
  {
    id: '20240621001',
    projectName: '朝阳新城A区一期',
    buildingName: '1号楼',
    floorName: '3层',
    professional: '电气',
    changeReason: '现场签证',
    originalDrawing: '按原设计图纸03-DQ-09，3层走廊照明回路采用BV-3x2.5穿PVC20管暗敷。',
    siteProblem: '现场检查发现3层走廊吊顶内有新风管与喷淋主管交叉，电气配管无法按原标高敷设，若强行压低将低于喷淋下喷150mm规范要求。',
    suggestedSolution: '建议将走廊照明回路改为沿梁侧明敷KBG管，安装高度提高至梁底，避开风管与喷淋管交叉区域，灯具相应调整为吊杆安装。',
    photos: [
      {
        id: 'p1',
        url: 'https://picsum.photos/id/1082/750/500',
        remark: '3层走廊管线交叉全景',
        uploadedAt: '2024-06-21T09:23:00'
      },
      {
        id: 'p2',
        url: 'https://picsum.photos/id/1036/750/500',
        remark: '风管与喷淋管局部特写',
        uploadedAt: '2024-06-21T09:25:00'
      }
    ],
    locationText: '1号楼3层东走廊A轴-C轴/1轴-3轴',
    contactNo: 'QSCX-2024-0621-001',
    drawingNo: '03-DQ-09 修1',
    responsibleUnit: '中建八局第三分公司',
    estimatedQuantity: 'KBG20管约120米，吊杆灯盘6套，辅材另计',
    status: 'submitted',
    createdAt: '2024-06-21T09:30:00',
    updatedAt: '2024-06-21T14:12:00',
    createdBy: '张工长',
    missingFields: [],
    shareCode: 'QX2K8M3P'
  },
  {
    id: '20240621002',
    projectName: '绿城桂花苑3号楼',
    buildingName: '3号楼',
    floorName: 'B1层',
    professional: '给排水',
    changeReason: '设计变更',
    originalDrawing: '地下室B1层生活水泵房原设计集水坑尺寸1500x1500x1000，配置1台50WQ15-15-1.5潜污泵。',
    siteProblem: '经与设备厂家核对，泵房排水沟汇水面积增大且考虑消防试压排水，原集水坑容积偏小，水泵流量不足。',
    suggestedSolution: '建议将集水坑扩大至2000x2000x1200，更换为65WQ25-20-3潜污泵，一用一备双泵配置。',
    photos: [
      {
        id: 'p3',
        url: 'https://picsum.photos/id/1044/750/500',
        remark: 'B1层水泵房集水坑现状',
        uploadedAt: '2024-06-21T10:45:00'
      }
    ],
    locationText: '3号楼B1层生活水泵房西北角',
    contactNo: '',
    drawingNo: '施水-B1-02',
    responsibleUnit: '',
    estimatedQuantity: '混凝土开凿约0.6m³，管道调整DN65约8米',
    status: 'draft',
    createdAt: '2024-06-21T11:00:00',
    updatedAt: '2024-06-21T11:00:00',
    createdBy: '李施工',
    missingFields: ['contactNo', 'responsibleUnit'],
    shareCode: 'A9B2C4D6'
  },
  {
    id: '20240620003',
    projectName: '滨江科技园B栋',
    buildingName: 'B栋',
    floorName: '12层',
    professional: '暖通空调',
    changeReason: '材料代换',
    originalDrawing: '原设计12层空调新风支管采用镀锌钢板风管，厚度0.75mm，法兰连接。',
    siteProblem: '现场楼层净高有限，新风管过梁位置需做扁管过渡，矩形风管改扁后风速过高噪音大。',
    suggestedSolution: '建议该段改为消声保温风管（酚醛铝箔复合板），厚度25mm，内贴消声棉，降低风速控制在4m/s以内。',
    photos: [
      {
        id: 'p4',
        url: 'https://picsum.photos/id/1015/750/500',
        remark: '12层梁下净高测量',
        uploadedAt: '2024-06-20T14:20:00'
      },
      {
        id: 'p5',
        url: 'https://picsum.photos/id/1018/750/500',
        remark: '风管过梁位置示意',
        uploadedAt: '2024-06-20T14:22:00'
      },
      {
        id: 'p6',
        url: 'https://picsum.photos/id/1039/750/500',
        remark: '周边管线综合排布',
        uploadedAt: '2024-06-20T14:25:00'
      }
    ],
    locationText: 'B栋12层5-8轴/D-G轴办公区',
    contactNo: 'BYKJ-2024-020',
    drawingNo: '',
    responsibleUnit: '省安装集团暖通分公司',
    estimatedQuantity: '',
    status: 'draft',
    createdAt: '2024-06-20T14:35:00',
    updatedAt: '2024-06-20T14:35:00',
    createdBy: '王工',
    missingFields: ['drawingNo', 'estimatedQuantity'],
    shareCode: 'HF7N3K9Q'
  },
  {
    id: '20240620004',
    projectName: '朝阳新城A区一期',
    buildingName: '2号楼',
    floorName: '屋面层',
    professional: '建筑',
    changeReason: '功能优化',
    originalDrawing: '屋面原设计为SBS改性沥青防水卷材双层铺贴，上做40mm厚C20细石混凝土保护层。',
    siteProblem: '屋面消防水箱基础已浇筑完成，防水层施工后保护层在水箱根部开裂风险大，且后期设备振动易导致防水破坏。',
    suggestedSolution: '建议水箱基础周边500mm范围内增设一道自粘聚合物防水层加强层，并在保护层内增设钢丝网片，水箱根部做柔性密封处理。',
    photos: [
      {
        id: 'p7',
        url: 'https://picsum.photos/id/1036/750/500',
        remark: '屋面消防水箱基础位置',
        uploadedAt: '2024-06-20T08:50:00'
      }
    ],
    locationText: '2号楼屋面水箱间南侧',
    contactNo: 'QSCX-2024-0620-003',
    drawingNo: '建施-WM-01 修',
    responsibleUnit: '中建八局第三分公司',
    estimatedQuantity: '自粘加强层约25㎡，钢丝网片约40㎡，密封膏约15kg',
    status: 'completed',
    createdAt: '2024-06-20T09:15:00',
    updatedAt: '2024-06-20T16:42:00',
    createdBy: '张工长',
    missingFields: [],
    shareCode: 'ZM4V6W2X'
  },
  {
    id: '20240620005',
    projectName: '中心医院住院楼改造',
    buildingName: '住院楼',
    floorName: '5层',
    professional: '消防',
    changeReason: '现场签证',
    originalDrawing: '5层病房走道原设计喷淋支管距地2.6m安装，喷头朝上。',
    siteProblem: '病房新增加液吊轨安装，吊轨最低处2.55m，与喷淋头发生碰撞。原设计未考虑医疗设备专项安装。',
    suggestedSolution: '建议喷淋支管下调至2.45m并做下喷，采用直立型喷头改为下垂型，调整后需保证吊顶内检修空间不小于300mm。',
    photos: [
      {
        id: 'p8',
        url: 'https://picsum.photos/id/1080/750/500',
        remark: '5层走道喷淋与吊轨冲突点',
        uploadedAt: '2024-06-20T15:30:00'
      },
      {
        id: 'p9',
        url: 'https://picsum.photos/id/1082/750/500',
        remark: '输液吊轨安装示意',
        uploadedAt: '2024-06-20T15:33:00'
      }
    ],
    locationText: '住院楼5层护士站东侧走道A区-B区',
    contactNo: '',
    drawingNo: '',
    responsibleUnit: '',
    estimatedQuantity: '',
    status: 'draft',
    createdAt: '2024-06-20T15:45:00',
    updatedAt: '2024-06-20T15:45:00',
    createdBy: '陈工长',
    missingFields: ['contactNo', 'drawingNo', 'responsibleUnit', 'estimatedQuantity'],
    shareCode: 'RT8S2D5F'
  },
  {
    id: '20240619006',
    projectName: '地铁4号线车辆段',
    buildingName: '运用库',
    floorName: '1层',
    professional: '弱电',
    changeReason: '设计变更',
    originalDrawing: '运用库列检地沟两侧原设计采用CAT6网线敷设信号线缆，走行部下方穿镀锌钢管。',
    siteProblem: '现场机车振动较大，预埋钢管接口处线缆磨损隐患，且CAT6网线屏蔽效果不足，信号测试丢包率超标。',
    suggestedSolution: '建议更换为屏蔽六类网线(CAT6A FTP)，穿金属软管保护并做双端接地，每间隔5米增设防振固定卡。',
    photos: [
      {
        id: 'p10',
        url: 'https://picsum.photos/id/3/750/500',
        remark: '列检地沟内线缆敷设现场',
        uploadedAt: '2024-06-19T10:10:00'
      }
    ],
    locationText: '运用库D2-D6列位地沟南侧',
    contactNo: 'DT4-QS-2024-032',
    drawingNo: 'RD-WK-08修2',
    responsibleUnit: '中铁电气化局城轨分公司',
    estimatedQuantity: 'CAT6A屏蔽线约480米，金属软管约520米，固定卡约120个',
    status: 'submitted',
    createdAt: '2024-06-19T10:35:00',
    updatedAt: '2024-06-20T09:20:00',
    createdBy: '刘工',
    missingFields: [],
    shareCode: 'KJ7H4G1F'
  },
  {
    id: '20240619007',
    projectName: '绿城桂花苑3号楼',
    buildingName: '3号楼',
    floorName: '管井',
    professional: '给排水',
    changeReason: '工艺调整',
    originalDrawing: '3号楼管井内采暖立管原设计为无缝钢管焊接连接，保温层厚度40mm。',
    siteProblem: '管井内操作空间狭小（净宽仅800mm），焊接作业困难且存在防火安全隐患，管道井预留洞尺寸与管道+保温尺寸冲突。',
    suggestedSolution: '建议采暖立管改为卡压式不锈钢管连接，减少现场焊接作业；保温层调整为30mm硅酸铝镁，压缩后厚度满足空间要求。',
    photos: [
      {
        id: 'p11',
        url: 'https://picsum.photos/id/1015/750/500',
        remark: '3号楼管井实测尺寸',
        uploadedAt: '2024-06-19T13:40:00'
      },
      {
        id: 'p12',
        url: 'https://picsum.photos/id/1018/750/500',
        remark: '管井内管道排布模拟',
        uploadedAt: '2024-06-19T13:43:00'
      }
    ],
    locationText: '3号楼1-18层水暖管井',
    contactNo: 'QSCX-2024-0619-007',
    drawingNo: '',
    responsibleUnit: '',
    estimatedQuantity: '卡压不锈钢管DN65约360米，DN50约180米',
    status: 'draft',
    createdAt: '2024-06-19T14:00:00',
    updatedAt: '2024-06-19T14:00:00',
    createdBy: '李施工',
    missingFields: ['drawingNo', 'responsibleUnit'],
    shareCode: 'BV5N8M2P'
  },
  {
    id: '20240618008',
    projectName: '滨江科技园B栋',
    buildingName: '机房层',
    floorName: '机房层',
    professional: '电气',
    changeReason: '设计变更',
    originalDrawing: '机房层变配电室原设计高压柜顶部母线槽沿墙敷设至变压器低压端。',
    siteProblem: '现场空调冷却水管已先施工，从母线槽规划路径上横穿，垂直净距仅150mm不符合电气规范要求。',
    suggestedSolution: '建议母线槽路径改道，沿北侧墙绕行，增设2个水平弯头；与水管交叉处增设防水托盘并做防渗引流措施。',
    photos: [
      {
        id: 'p13',
        url: 'https://picsum.photos/id/1036/750/500',
        remark: '母线槽与冷却水管交叉全景',
        uploadedAt: '2024-06-18T09:15:00'
      },
      {
        id: 'p14',
        url: 'https://picsum.photos/id/1044/750/500',
        remark: '间距实测150mm特写',
        uploadedAt: '2024-06-18T09:18:00'
      }
    ],
    locationText: '机房层变配电室东侧3-5轴',
    contactNo: 'BYKJ-2024-015',
    drawingNo: '施电-JF-04修1',
    responsibleUnit: '省安装集团电仪分公司',
    estimatedQuantity: '母线槽CCX-1250A约18米，弯头2件，防水托盘约6米',
    status: 'completed',
    createdAt: '2024-06-18T09:30:00',
    updatedAt: '2024-06-19T15:20:00',
    createdBy: '王工',
    missingFields: [],
    shareCode: 'WQ3E5R8T'
  },
  {
    id: '20240618009',
    projectName: '朝阳新城A区一期',
    buildingName: '地下车库',
    floorName: 'B2层',
    professional: '结构',
    changeReason: '现场签证',
    originalDrawing: '地下车库B2-F轴后浇带原设计为超前止水后浇带，采用镀锌钢板止水带。',
    siteProblem: '施工期间发现后浇带位置地下水丰富，原超前止水方案效果不佳，钢筋已出现锈蚀迹象。',
    suggestedSolution: '建议在后浇带两侧增设临时降水井，采用膨胀止水条替换钢板止水带，后浇带混凝土内掺加水泥基渗透结晶型防水材料。',
    photos: [
      {
        id: 'p15',
        url: 'https://picsum.photos/id/1082/750/500',
        remark: 'B2层后浇带渗水现场',
        uploadedAt: '2024-06-18T11:25:00'
      }
    ],
    locationText: '地下车库B2-F轴/2-6轴后浇带',
    contactNo: 'QSCX-2024-0618-009',
    drawingNo: '结施-S-12',
    responsibleUnit: '',
    estimatedQuantity: '降水井2口，膨胀止水条约50米，水泥基掺加约12m³',
    status: 'draft',
    createdAt: '2024-06-18T11:45:00',
    updatedAt: '2024-06-18T11:45:00',
    createdBy: '赵工',
    missingFields: ['responsibleUnit'],
    shareCode: 'YU2I6O7P'
  },
  {
    id: '20240617010',
    projectName: '中心医院住院楼改造',
    buildingName: '裙楼',
    floorName: '2层',
    professional: '装饰装修',
    changeReason: '功能优化',
    originalDrawing: '裙楼2层门诊大厅原设计地面采用600x600mm米黄色玻化砖铺贴，砖缝3mm。',
    siteProblem: '院方反馈原有地砖颜色偏冷与医院整体暖色调不符，且轮椅通行砖缝易造成振动，建议优化。',
    suggestedSolution: '建议更换为800x800mm暖色仿大理石通体砖（米黄带浅金），砖缝调整为2mm并采用同色美缝剂，大厅中央做简单水刀拼花造型。',
    photos: [
      {
        id: 'p16',
        url: 'https://picsum.photos/id/1080/750/500',
        remark: '2层门诊大厅地面现状',
        uploadedAt: '2024-06-17T14:30:00'
      },
      {
        id: 'p17',
        url: 'https://picsum.photos/id/1027/750/500',
        remark: '建议替换样板砖照片',
        uploadedAt: '2024-06-17T14:33:00'
      }
    ],
    locationText: '裙楼2层门诊大厅A-H轴/1-10轴区域',
    contactNo: 'ZXYY-ZS-2024-003',
    drawingNo: '装施-DM-05修2',
    responsibleUnit: '金螳螂装饰公司第三项目部',
    estimatedQuantity: '800x800通体砖约680㎡，拼花造型1套，美缝剂约80支',
    status: 'submitted',
    createdAt: '2024-06-17T14:50:00',
    updatedAt: '2024-06-18T10:15:00',
    createdBy: '周工',
    missingFields: [],
    shareCode: 'AS4D6F8G'
  },
  {
    id: '20240617011',
    projectName: '地铁4号线车辆段',
    buildingName: '检修主厂房',
    floorName: '1层',
    professional: '暖通空调',
    changeReason: '材料代换',
    originalDrawing: '检修主厂房高大空间原设计采用组合式空调机组+球形喷口送风，喷口射程28米。',
    siteProblem: '现场实测厂房净高比图纸标注高1.2米，球形喷口安装后实测射程仅约22米，厂房两端约6米区域有送风死角。',
    suggestedSolution: '建议更换为可调旋流喷口，根据安装高度调节送风角度；或在两端山墙侧加装2台侧送风机补风。',
    photos: [
      {
        id: 'p18',
        url: 'https://picsum.photos/id/1036/750/500',
        remark: '厂房内部安装条件实拍',
        uploadedAt: '2024-06-17T10:50:00'
      }
    ],
    locationText: '检修主厂房1-8轴/A-J轴',
    contactNo: '',
    drawingNo: '',
    responsibleUnit: '中铁电气化局机电分公司',
    estimatedQuantity: '可调旋流喷口Φ630共24个，或侧送风机PF-2.2共2台',
    status: 'draft',
    createdAt: '2024-06-17T11:15:00',
    updatedAt: '2024-06-17T11:15:00',
    createdBy: '孙工',
    missingFields: ['contactNo', 'drawingNo'],
    shareCode: 'HJ8K2L3M'
  },
  {
    id: '20240616012',
    projectName: '绿城桂花苑3号楼',
    buildingName: 'A栋',
    floorName: '6层',
    professional: '弱电',
    changeReason: '设计变更',
    originalDrawing: 'A栋6层智能家居系统弱电箱原设计在入户门后墙体，型号300x400x120mm。',
    siteProblem: '精装修图纸入户门套线调整后，弱电箱安装位置与门套冲突，且业主提出箱体内需增加智能家居模块扩容需求。',
    suggestedSolution: '建议弱电箱移位至玄关鞋柜侧墙内，箱体更换为400x500x150mm加大款，内部预留光纤熔接盘和交换机位置。',
    photos: [
      {
        id: 'p19',
        url: 'https://picsum.photos/id/201/750/500',
        remark: '入户门套与弱电箱冲突点',
        uploadedAt: '2024-06-16T15:10:00'
      },
      {
        id: 'p20',
        url: 'https://picsum.photos/id/160/750/500',
        remark: '建议移位位置示意',
        uploadedAt: '2024-06-16T15:13:00'
      }
    ],
    locationText: 'A栋6层01、03户型入户处',
    contactNo: 'LC-RD-2024-018',
    drawingNo: '弱施-06修3',
    responsibleUnit: '华业智能科技公司',
    estimatedQuantity: '400x500弱电箱约24台，管线调整PVC25约120米',
    status: 'completed',
    createdAt: '2024-06-16T15:30:00',
    updatedAt: '2024-06-18T09:00:00',
    createdBy: '刘工',
    missingFields: [],
    shareCode: 'NB5V7C9X'
  }
]
