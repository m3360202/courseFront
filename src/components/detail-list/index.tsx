'use client'

import ListItem from '@mui/material/ListItem'
import Box from '@mui/material/Box'

import { DetailItem } from '@/types'
import { List, Skeleton } from '@mui/material'
import copyToClipboard from '@/utils/copyToClipboard'
import { useCourse } from '@/hooks/useCourse'
import { RemixIcon } from '../icon/remix-icon'
import CustomizedTooltip from '../tool-tip'
import Title from '../title'

interface GroupedData {
  [key: number]: DetailItem[]
}

const skeletonLoading = <Skeleton width={120} height={20} />

const DetailList = ({ items }: { items?: DetailItem[] }) => {
  //Hooks
  const { loading } = useCourse()

  //Vars
  // 根据 col 值分组
  let sameCol = true
  const groupedData = items?.reduce((acc: GroupedData, item: DetailItem) => {
    if (!acc[item.col]) {
      acc[item.col] = []
    }
    acc[item.col].push(item)
    if (Object.keys(acc).filter(k => k == item.col.toString()).length > 1) {
      sameCol = false
    }

    return acc
  }, {})

  const renderDetailItem = (
    title: string | JSX.Element,
    value?: string | number | JSX.Element,
    copy?: boolean,
    copyValue?: string,
    icon?: string
  ) => {
    let hasValue = false
    let valueItem = null

    if (value) {
      if (typeof value === 'string') {
        hasValue = true
        valueItem = (
          <Title
            noWrap
            className={copy ? 'hover:text-blue-400' : ''}
            sx={{ maxWidth: { xs: '40%', md: sameCol ? '100%' : '72%' } }}
          >
            {value}
          </Title>
        )
      } else {
        if (
          (value as JSX.Element).props?.children ||
          (value as JSX.Element).props?.children?.filter((c: any) => c)?.length > 0
        )
          hasValue = true
        valueItem = value
      }
    }

    return (
      <ListItem role='listitem' className='flex items-center gap-2 p-0'>
        <RemixIcon icon={icon} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          {loading ? (
            skeletonLoading
          ) : (
            <>
              {copy ? (
                <CustomizedTooltip title='Click to Copy'>
                  <Box
                    className='cursor-pointer hover:text-blue-400 flex gap-1'
                    onClick={() => {
                      if (copy) {
                        copyToClipboard(copyValue || (value as string))
                      }
                    }}
                  >
                    {title}
                    {hasValue ? ' : ' : ''}
                    {valueItem}
                  </Box>
                </CustomizedTooltip>
              ) : (
                <Box className='flex gap-1'>
                  {title}
                  {hasValue ? ' : ' : ''}
                  {valueItem}
                </Box>
              )}
            </>
          )}
        </Box>
      </ListItem>
    )
  }

  const renderDetailItems = () => {
    const eles: JSX.Element[] = []
    if (groupedData)
      for (const [, items] of Object.entries(groupedData)) {
        const deles: JSX.Element[] = []
        items.forEach((item: DetailItem) => {
          !item.hidden && deles.push(renderDetailItem(item.title, item.value, item.copy, item.copyValue, item.icon))
        })
        eles.push(
          <List role='list' component='div' className='flex flex-col gap-2 plb-0'>
            {deles}
          </List>
        )
      }

    return eles
  }

  return (
    <div className='flex flex-wrap gap-x-12 gap-y-2'>
      <>{renderDetailItems()}</>
    </div>
  )
}

export default DetailList
