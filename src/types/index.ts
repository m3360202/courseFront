export const BASE_URL = process.env.NEXT_PUBLIC_BASE_API + '/'
export const IMAGE_PATH = process.env.NEXT_PUBLIC_BASE_API + '/' + process.env.NEXT_PUBLIC_IMG_PATH + '/'
export const FILE_PATH = process.env.NEXT_PUBLIC_BASE_API + '/' + process.env.NEXT_PUBLIC_FILE_PATH + '/'
export const WEEKNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export enum Actions {
  Add,
  Edit,
  View,
  Delete
}

export enum Orientation {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export type TabItem = { label: string; href: string; icon?: string; hidden?: boolean }

export type DetailItem = {
  title: string | JSX.Element
  value?: string | number | JSX.Element
  col: number
  hidden?: boolean
  copy?: boolean
  copyValue?: string
  icon?: string
}

export const EnglishWords = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'Y',
  'V',
  'W',
  'X',
  'Y',
  'Z'
]

export const informationData = [
  {
    title: 'Student information',
    items: [
      {
        title: 'FirstName & LastName',
        value: 'FirstName & LastName',
        key: [
          { title: 'First Name', value: 'firstName' },
          { title: 'Last Name', value: 'lastName' }
        ]
      },
      { title: 'Email', value: 'Email', key: [{ title: 'Email', value: 'email' }] },
      { title: 'Phone Number', value: 'Phone Number', key: [{ title: 'Phone Number', value: 'phone' }] },
      { title: 'City', value: 'City', key: [{ title: 'City', value: 'city' }] }
    ]
  },
  {
    title: 'Parent 1 information',
    items: [
      {
        title: 'Parent/Guardian’s Name',
        value: 'Parent Name',
        key: [
          { title: 'Parent/Guardian’s First Name', value: 'parentFirstName' },
          { title: 'Parent/Guardian’s Last Name', value: 'parentLastName' }
        ]
      },
      { title: 'Parent Email', value: 'Parent Email', key: [{ title: 'Parent Email', value: 'parentEmail' }] },
      {
        title: 'Parent Phone Number',
        value: 'Parent Phone Number',
        key: [{ title: 'Parent Phone Number', value: 'parentPhone' }]
      }
    ]
  },
  {
    title: 'Parent 2 information',
    items: [
      {
        title: 'Parent/Guardian’s Name',
        value: 'Parent1 Name',
        key: [
          { title: 'Parent/Guardian’s First Name', value: 'parent1FirstName' },
          { title: 'Parent/Guardian’s Last Name', value: 'parent1LastName' }
        ]
      },
      { title: 'Parent Email', value: 'Parent1 Email', key: [{ title: 'Parent Email', value: 'parent1Email' }] },
      {
        title: 'Parent Phone Number',
        value: 'Parent1 Phone Number',
        key: [{ title: 'Parent Phone Number', value: 'parent1Phone' }]
      }
    ]
  }
]

export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}
