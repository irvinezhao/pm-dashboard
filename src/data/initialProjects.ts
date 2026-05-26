import type { Project } from '../types'

export const initialProjects: Project[] = [
  {
    id: 'allo-personal-loan',
    name: 'allo个贷项目',
    owner: 'Iris',
    productLine: '消费金融',
    versions: [
      {
        id: 'allo-pl-v1-8',
        name: 'V1.8 放款体验优化',
        startDate: '2026-05-20',
        endDate: '2026-06-12',
        stage: 'development',
        requirements: [
          {
            id: 'req-pl-101',
            code: 'PL-101',
            title: '个贷申请进件字段校验优化',
            link: 'https://example.com/allo-pl-101',
            owner: '张晨',
          },
          {
            id: 'req-pl-118',
            code: 'PL-118',
            title: '授信结果页增加失败原因展示',
            link: 'https://example.com/allo-pl-118',
            owner: 'Leo',
          },
        ],
        subVersions: [],
      },
      {
        id: 'allo-pl-v1-9',
        name: 'V1.9 还款计划升级',
        startDate: '2026-06-17',
        endDate: '2026-07-05',
        stage: 'versionStart',
        requirements: [
          {
            id: 'req-pl-132',
            code: 'PL-132',
            title: '提前还款试算链路',
            link: 'https://example.com/allo-pl-132',
            owner: 'Mika',
          },
        ],
        subVersions: [],
      },
    ],
  },
  {
    id: 'allo-auto-loan',
    name: 'allo车贷项目',
    owner: 'Nora',
    productLine: '汽车金融',
    versions: [
      {
        id: 'allo-al-v2-3',
        name: 'V2.3 车辆评估接入',
        startDate: '2026-05-13',
        endDate: '2026-06-04',
        stage: 'uat',
        requirements: [
          {
            id: 'req-al-207',
            code: 'AL-207',
            title: '二手车估值服务接入',
            link: 'https://example.com/allo-al-207',
            owner: '王宇',
          },
          {
            id: 'req-al-214',
            code: 'AL-214',
            title: '车贷审批附件补传',
            link: 'https://example.com/allo-al-214',
            owner: 'Diego',
          },
        ],
        subVersions: [],
      },
    ],
  },
  {
    id: 'byd-auto-finance',
    name: 'BYD汽车金融项目',
    owner: 'Yilin',
    productLine: '厂商金融',
    versions: [
      {
        id: 'byd-af-v3-1',
        name: 'V3.1 经销商进件',
        startDate: '2026-05-01',
        endDate: '2026-05-28',
        stage: 'production',
        requirements: [
          {
            id: 'req-byd-301',
            code: 'BYD-301',
            title: '经销商渠道码自动识别',
            link: 'https://example.com/byd-af-301',
            owner: '陈墨',
          },
          {
            id: 'req-byd-319',
            code: 'BYD-319',
            title: '投产前资金方路由校验',
            link: 'https://example.com/byd-af-319',
            owner: 'Iris',
          },
        ],
        subVersions: [],
      },
      {
        id: 'byd-af-v3-2',
        name: 'V3.2 贴息策略',
        startDate: '2026-06-03',
        endDate: '2026-06-26',
        stage: 'versionStart',
        requirements: [
          {
            id: 'req-byd-332',
            code: 'BYD-332',
            title: '新能源车型贴息规则配置',
            link: 'https://example.com/byd-af-332',
            owner: 'Nora',
          },
        ],
        subVersions: [],
      },
    ],
  },
  {
    id: 'non-loan-current',
    name: '非贷项目',
    owner: '待补充',
    productLine: '非贷',
    versions: [
      {
        id: 'non-loan-current-version',
        name: '当前非贷版本',
        startDate: '2026-04-06',
        endDate: '2026-06-12',
        stage: 'uat',
        requirements: [
          {
            id: 'req-non-loan-ls-2604',
            code: 'L-S-2604 Major',
            title:
              'POJK 24: Automatic Account Level Change Capability - Gamification | Start Dev 2026-04-06 | UAT Rollout 2026-05-11 | UAT Signoff 2026-05-19 | CAB 2026-05-20 | PROD 2026-05-21~22 | Status UAT',
            link: '',
            owner: '',
          },
          {
            id: 'req-non-loan-urgent-20260508',
            code: 'Urgent-20260508',
            title:
              "[Bug] Cannot Click Pay When user didn't have paylater and point amount is 0; [BUG] Cardless Cash Withdrawal - Limited Testing Config Hardening | Start Dev 2026-05-06 | UAT Rollout 2026-05-07 | UAT Signoff 2026-05-08 | CAB 2026-05-11 | PROD 2026-05-12 | Status Done",
            link: '',
            owner: '',
          },
          {
            id: 'req-non-loan-ls-2605',
            code: 'L-S-2605 Minor',
            title:
              'Weverse | Start Dev 2026-05-17 | UAT Rollout 2026-06-01 | UAT Signoff 2026-06-11 | CAB 2026-06-11 | PROD 2026-06-12 | Status Technical Design',
            link: '',
            owner: '',
          },
        ],
        subVersions: [
          {
            id: 'non-loan-current-sub-1',
            name: 'L-S-2604 Major 子版本',
            startDate: '2026-04-06',
            endDate: '2026-05-22',
            stage: 'uat',
            requirements: [
              {
                id: 'req-non-loan-sub-2604',
                code: 'L-S-2604-A',
                title: 'Automatic Account Level Change Capability 子项',
                link: '',
                owner: '',
              },
            ],
            subVersions: [],
          },
          {
            id: 'non-loan-current-sub-2',
            name: 'Urgent-20260508 子版本',
            startDate: '2026-05-06',
            endDate: '2026-05-12',
            stage: 'production',
            requirements: [
              {
                id: 'req-non-loan-sub-urgent',
                code: 'Urgent-20260508-A',
                title: 'Cannot Click Pay / Cardless Cash Withdrawal 子项',
                link: '',
                owner: '',
              },
            ],
            subVersions: [],
          },
        ],
      },
    ],
  },
]
