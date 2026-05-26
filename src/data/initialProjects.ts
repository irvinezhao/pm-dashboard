import type { Project } from '../types'

export const initialProjects: Project[] = [
  {
    id: 'allo-personal-loan',
    name: 'allo个贷项目',
    owner: 'Irving',
    productLine: '消费金融',
    versions: [
      {
        id: 'allo-pl-v1-8',
        name: '非贷-Lesmana',
        startDate: '2026-05-20',
        endDate: '2026-06-12',
        stage: 'development',
        requirements: [],
        subVersions: [
          {
            id: 'version-1779778140550-628c575c8c8d58',
            name: 'L-S-2605 Minor',
            startDate: '2026-05-17',
            endDate: '2026-06-12',
            stage: 'development',
            requirements: [
              {
                id: 'requirement-1779778225449-4c98b61d658a78',
                code: '1466',
                title: '(Regulatory) QRIS MPM (Domestic + Cross Border ) Fixing for ASPI',
                link: 'https://docs.google.com/document/d/1s84VmQEuvHyyeQzqb0o6d-MdRVsJPZ_GVHcqths5iIY/edit?tab=t.0',
                owner: 'Keane',
              },
              {
                id: 'requirement-1779778191218-8ea57a739af498',
                code: '1465',
                title: 'Weverse',
                link: 'https://docs.google.com/document/d/1DKJ7ttP_xGisFOSz0BSpxd5DW4cMrwwyMnJGgSzbZbA/edit?tab=t.0',
                owner: 'Keane',
              },
            ],
            subVersions: [],
          },
          {
            id: 'version-1779777965819-66a30b4252dda8',
            name: 'L-S-2604 Major',
            startDate: '2026-04-06',
            endDate: '2026-05-22',
            stage: 'production',
            requirements: [
              {
                id: 'requirement-1779778272715-e7fa76b414f5c8',
                code: '1458',
                title: 'Allo Fest Gamification',
                link: '',
                owner: '',
              },
              {
                id: 'requirement-1779778262466-cc2e25559eaa1',
                code: '1432',
                title: '(Regulatotry) QRIS Tap UI Adjustment',
                link: '',
                owner: '',
              },
              {
                id: 'requirement-1779778251949-3b1e4174c2a0d8',
                code: '1448',
                title: 'POJK 24: Automatic Account Level Change Capability',
                link: '',
                owner: '',
              },
            ],
            subVersions: [],
          },
        ],
      },
      {
        id: 'allo-pl-v1-9',
        name: '贷款 Jalak',
        startDate: '2026-05-20',
        endDate: '2026-06-12',
        stage: 'development',
        requirements: [
          {
            id: 'requirement-1779778471779-e0b559dfe7b478',
            code: '245282',
            title: 'Shadow limit phase 4 - Loan restructure overdue',
            link: '',
            owner: '',
          },
          {
            id: 'requirement-1779778459162-254858133cc7d8',
            code: '242721',
            title: 'Collection Reminder Phase II',
            link: '',
            owner: '',
          },
          {
            id: 'req-pl-132',
            code: '490401',
            title: 'IUPP Batch Function Optimization',
            link: '',
            owner: '',
          },
        ],
        subVersions: [],
      },
    ],
  },
  {
    id: 'allo-auto-loan',
    name: 'allo车贷项目',
    owner: 'Irving',
    productLine: '汽车金融',
    versions: [
      {
        id: 'allo-al-v2-3',
        name: 'V1.0',
        startDate: '2026-03-04',
        endDate: '2026-04-15',
        stage: 'production',
        requirements: [
          {
            id: 'req-al-214',
            code: 'x',
            title: '车贷',
            link: '',
            owner: 'Qiang',
          },
        ],
        subVersions: [],
      },
    ],
  },
  {
    id: 'byd-auto-finance',
    name: 'BYD汽车金融项目',
    owner: 'Irving',
    productLine: '厂商金融',
    versions: [
      {
        id: 'byd-af-v3-2',
        name: '前期沟通',
        startDate: '2026-04-01',
        endDate: '2026-07-30',
        stage: 'versionStart',
        requirements: [],
        subVersions: [],
      },
    ],
  },
]
