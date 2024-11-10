'use client'

import { useState } from 'react'

import ChatContext from './ListTableContext'

interface Props {
  children?: React.ReactNode
}

export default function ListTableProvider(props: Props) {
  //state
  const { children } = props
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(20)
  const [total, setTotal] = useState<number>(0)
  const [searchValue, setSearchValue] = useState<string>('')
  const [rowSelectionData, setRowSelectionData] = useState<Record<number, any>>({})

  return (
    <ChatContext.Provider
      value={{
        pageIndex,
        pageSize,
        searchValue,
        total,
        rowSelectionData,
        setPageIndex,
        setPageSize,
        setSearchValue,
        setTotal,
        setRowSelectionData
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
